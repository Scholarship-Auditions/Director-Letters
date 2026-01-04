import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import { getUrl, remove } from "aws-amplify/storage";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver";

const client = generateClient();

const Letters = ({ title, categoryFilter }) => {
  const { user } = useAuthenticator((context) => [context.user]);

  const [letters, setLetters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFilter || ""
  );
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: catData } = await client.models.LetterCategory.list();
      setCategories(catData);

      const { data: letterData } = await client.models.Letter.list();

      const lettersWithUrls = await Promise.all(
        letterData.map(async (letter) => {
          if (!letter.s3Key) return letter;
          try {
            const link = await getUrl({ path: letter.s3Key });
            return { ...letter, downloadUrl: link.url };
          } catch (err) {
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

  // --- IMPROVED HTML to DOCX CONVERSION ---
  const handleDownloadDocx = async (letter) => {
    if (!letter.downloadUrl) return;
    setDownloadingId(letter.id);

    try {
      // 1. Fetch the raw HTML content from S3
      const response = await fetch(letter.downloadUrl.toString());
      if (!response.ok) throw new Error("Failed to fetch file");

      const rawHtml = await response.text();

      // 2. PARSE THE HTML using the Browser's DOMParser
      // This allows us to select specific elements like we do with document.getElementById
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, "text/html");

      // 3. Extract the CSS Styles (Google Docs keeps them in <style> tags)
      const styleTags = doc.querySelectorAll("style");
      let combinedStyles = "";
      styleTags.forEach((style) => {
        combinedStyles += style.outerHTML;
      });

      // 4. Extract ONLY the content (Skip banners and scripts)
      // Google Docs Published HTML puts content in <div id="contents">
      let contentHtml = "";
      const contentDiv = doc.getElementById("contents");

      if (contentDiv) {
        contentHtml = contentDiv.innerHTML;
      } else {
        // Fallback: If id="contents" isn't found, try to take the body but remove scripts
        const scripts = doc.querySelectorAll("script");
        scripts.forEach((script) => script.remove()); // Delete scripts
        contentHtml = doc.body.innerHTML;
      }

      // 5. Reconstruct a Clean HTML string for the Converter
      const cleanHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            ${combinedStyles} 
            <style>
               /* Add some default word doc overrides */
               body { font-family: 'Times New Roman', serif; }
               .doc-content { padding: 20px !important; } 
            </style>
          </head>
          <body>
            ${contentHtml}
          </body>
        </html>
      `;

      // 6. Convert to Blob (DOCX)
      const buffer = await asBlob(cleanHtml, { orientation: "portrait" });

      // 7. Save File
      saveAs(buffer, `${letter.title}.docx`);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Could not convert file. Try using the View button instead.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id, s3Key) => {
    if (!window.confirm("Are you sure you want to delete this letter?")) return;

    try {
      if (s3Key) await remove({ path: s3Key });
      await client.models.Letter.delete({ id }, { authMode: "userPool" });
      setLetters((prev) => prev.filter((item) => item.id !== id));
      alert("Letter deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Could not delete.");
    }
  };

  const filteredLetters = letters.filter((letter) => {
    const query = searchQuery.toLowerCase();
    const t = letter.title ? letter.title.toLowerCase() : "";
    const w = letter.writerName ? letter.writerName.toLowerCase() : "";
    const matchesSearch = t.includes(query) || w.includes(query);
    const matchesCategory = selectedCategory
      ? letter.categoryName === selectedCategory ||
        letter.categoryId === selectedCategory
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

                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    {letter.downloadUrl ? (
                      <>
                        <a
                          href={letter.downloadUrl.toString()}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{
                            textDecoration: "none",
                            backgroundColor: "#28a745",
                            color: "white",
                          }}
                        >
                          View / Read
                        </a>
                        <button
                          onClick={() => handleDownloadDocx(letter)}
                          disabled={downloadingId === letter.id}
                          className="btn btn-primary"
                          style={{
                            cursor:
                              downloadingId === letter.id ? "wait" : "pointer",
                          }}
                        >
                          {downloadingId === letter.id
                            ? "Converting..."
                            : "Download DOCX"}
                        </button>
                      </>
                    ) : (
                      <button disabled className="btn btn-secondary">
                        File Pending
                      </button>
                    )}

                    {user && (
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
