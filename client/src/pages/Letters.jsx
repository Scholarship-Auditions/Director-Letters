import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import { getUrl, remove } from "aws-amplify/storage";
import { useAuthenticator } from "@aws-amplify/ui-react";

// Generate client
const client = generateClient();

const Letters = ({ title, categoryFilter }) => {
  // 1. Get User Auth Status
  const { user } = useAuthenticator((context) => [context.user]);

  const [letters, setLetters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFilter || ""
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // A. Fetch Categories
      const { data: catData } = await client.models.LetterCategory.list();
      setCategories(catData);

      // B. Fetch Letters
      const { data: letterData } = await client.models.Letter.list();

      // C. Generate Signed URLs for downloads
      const lettersWithUrls = await Promise.all(
        letterData.map(async (letter) => {
          if (!letter.s3Key) return letter;
          try {
            const link = await getUrl({ path: letter.s3Key });
            return { ...letter, downloadUrl: link.url };
          } catch (err) {
            // This catches the "NoBucket" error if config is still bad
            console.error("Error getting URL for:", letter.title, err);
            return letter;
          }
        })
      );

      setLetters(lettersWithUrls);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: DELETE FUNCTION ---
  const handleDelete = async (id, s3Key) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this letter?"
    );
    if (!confirmed) return;

    try {
      // 1. Remove File from S3
      if (s3Key) {
        await remove({ path: s3Key });
      }

      // 2. Remove Record from Database
      // CRITICAL FIX: Add { authMode: 'userPool' } to prove you are an Admin
      await client.models.Letter.delete({ id }, { authMode: "userPool" });

      setLetters((prev) => prev.filter((item) => item.id !== id));
      alert("Letter deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Could not delete. Ensure you are logged in as an Admin.");
    }
  };

  // Filter Logic
  const filteredLetters = letters.filter((letter) => {
    const query = searchQuery.toLowerCase();

    // Safety checks in case fields are null
    const t = letter.title ? letter.title.toLowerCase() : "";
    const w = letter.writerName ? letter.writerName.toLowerCase() : "";
    const r = letter.recipientName ? letter.recipientName.toLowerCase() : "";

    const matchesSearch =
      t.includes(query) || w.includes(query) || r.includes(query);

    // Filter by Category Name (stored as string in DB) or ID
    // Note: categoryFilter prop might be "1" (ID) or "Band" (Name) depending on your router
    const matchesCategory = selectedCategory
      ? letter.categoryName === selectedCategory ||
        letter.categoryId === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );

  return (
    <main className="letters-container">
      <section className="letters-hero">
        <h1 className="letters-hero-title">{title}</h1>
      </section>

      <section className="letters-section">
        <div className="letter-type">
          <h2>List of {title}</h2>

          {/* Admin Add Button */}
          {user && (
            <Link
              to="/add-letter"
              className="btn btn-primary"
              style={{ marginBottom: "20px", display: "inline-block" }}
            >
              + Add New Letter
            </Link>
          )}

          <div className="search-form">
            <input
              type="text"
              placeholder="Search letters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="letters">
            {filteredLetters.length > 0 ? (
              filteredLetters.map((letter) => (
                <div
                  className="letter"
                  key={letter.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    background: "#fff",
                  }}
                >
                  <h3>{letter.title}</h3>
                  {/* Subtitles */}
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#555",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <strong>Writer:</strong> {letter.writerName}
                    </div>
                    <div>
                      <strong>Recipient:</strong> {letter.recipientName}
                    </div>
                    <div>
                      <strong>Category:</strong> {letter.categoryName}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* Download Button (Visible to All) */}
                    {letter.downloadUrl ? (
                      <a
                        href={letter.downloadUrl.toString()}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                      >
                        Download
                      </a>
                    ) : (
                      <button disabled className="btn btn-secondary">
                        File Pending
                      </button>
                    )}

                    {/* Admin Buttons (Delete/Edit) */}
                    {user && (
                      <>
                        {/* You can add an Edit Link here later */}
                        <button
                          onClick={() => handleDelete(letter.id, letter.s3Key)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No letters found.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Letters;
