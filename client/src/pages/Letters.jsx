import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import { useAuthenticator } from "@aws-amplify/ui-react";

// 1. Create the Data Client
const client = generateClient();

const Letters = ({ title, categoryFilter }) => {
  // Auth Hook to check if user is Admin
  const { user } = useAuthenticator((context) => [context.user]);

  // State for Real Data
  const [letters, setLetters] = useState([]);
  const [categories, setCategories] = useState([]);

  // State for Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFilter || ""
  );

  // Loading State
  const [loading, setLoading] = useState(true);

  // 2. Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Fetch Categories for dropdown
        const { data: catData } = await client.models.LetterCategory.list();
        setCategories(catData);

        // B. Fetch All Letters
        const { data: letterData } = await client.models.Letter.list();

        // C. Generate Download URLs for each letter
        // We map over the letters and add a 'downloadUrl' property to each
        const lettersWithUrls = await Promise.all(
          letterData.map(async (letter) => {
            if (!letter.s3Key) return letter;
            try {
              const link = await getUrl({
                path: letter.s3Key,
                // options: { expiresIn: 3600 } // Link valid for 1 hour
              });
              return { ...letter, downloadUrl: link.url };
            } catch (err) {
              console.error("Error generating URL for", letter.title, err);
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

    fetchData();
  }, []);

  // 3. Filter Logic (Runs locally on the fetched data)
  const filteredLetters = letters.filter((letter) => {
    const query = searchQuery.toLowerCase();
    // Check Title, Content, Writer, or Recipient
    const matchesSearch =
      (letter.title && letter.title.toLowerCase().includes(query)) ||
      (letter.content && letter.content.toLowerCase().includes(query)) ||
      (letter.writerName && letter.writerName.toLowerCase().includes(query)) ||
      (letter.recipientName &&
        letter.recipientName.toLowerCase().includes(query));

    // Check Category (Using Name or ID based on how you saved it)
    // If categoryFilter prop is passed (e.g. "1"), we check against that.
    // Note: In your DB you saved "categoryName", so we compare names or IDs depending on your preference.
    // This simple check assumes selectedCategory matches the ID or Name stored.
    const matchesCategory = selectedCategory
      ? letter.categoryId === selectedCategory ||
        letter.categoryName === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading letters...
      </div>
    );

  return (
    <main className="letters-container">
      <section className="letters-hero">
        <h1 className="letters-hero-title">{title}</h1>
      </section>

      <section className="letters-section">
        <div className="letter-type">
          <h2>List of {title}</h2>

          {/* Only Admins see the "Add" button */}
          {user && (
            <Link
              to="/add-letter"
              className="btn btn-primary"
              style={{ marginBottom: "20px", display: "inline-block" }}
            >
              Add New Letter
            </Link>
          )}

          <div className="search-form">
            <input
              type="text"
              placeholder="Search letters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Dynamic Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                // value can be cat.id or cat.name depending on what you want to filter by
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
                    border: "1px solid #eee",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "8px",
                  }}
                >
                  <h3>{letter.title}</h3>
                  {/* Truncate content preview if it exists */}
                  <p>
                    {letter.content
                      ? letter.content.substring(0, 100) + "..."
                      : ""}
                  </p>

                  <h5>Writer: {letter.writerName}</h5>
                  <h5>For: {letter.recipientName}</h5>
                  <h5 style={{ color: "#666" }}>
                    Category: {letter.categoryName}
                  </h5>

                  <div style={{ marginTop: "10px" }}>
                    {/* Admin Actions */}
                    {user && (
                      <Link
                        to={`/edit-letter/${letter.id}`}
                        className="btn btn-secondary"
                        style={{ marginRight: "10px" }}
                      >
                        Edit
                      </Link>
                    )}

                    {/* Download Link (For Everyone) */}
                    {letter.downloadUrl ? (
                      <a
                        href={letter.downloadUrl.toString()}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                      >
                        Download File
                      </a>
                    ) : (
                      <span style={{ color: "red" }}>File Unavailable</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No letters found matching your search.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Letters;
