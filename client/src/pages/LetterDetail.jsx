import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getUrl } from "aws-amplify/storage";
import { dataClient, authModes } from "../lib/dataClient";
import "../styles/LetterDetail.css";

function LetterDetail() {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarImageUrl, setSidebarImageUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const emailContentRef = useRef(null);

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        setLoading(true);
        const { data } = await dataClient.models.Letter.get({ id }, authModes.read);

        if (data) {
          setLetter(data);

          // Get signed URL for sidebar image if exists
          if (data.sidebarImage) {
            try {
              const { url } = await getUrl({ path: data.sidebarImage });
              setSidebarImageUrl(url.toString());
            } catch (imgErr) {
              console.error("Failed to load sidebar image:", imgErr);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch letter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [id]);

  const handleCopyEmail = async () => {
    try {
      // Get plain text from the email content
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = letter.emailContent || "";
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="letter-detail-wrapper">
        <div className="letter-detail-container">
          <div className="letter-loading">Loading letter...</div>
        </div>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="letter-detail-wrapper">
        <div className="letter-detail-container">
          <div className="letter-not-found">
            <h2>Letter Not Found</h2>
            <p>The letter you're looking for doesn't exist.</p>
            <Link to="/letters" className="sidebar-link">
              ← Back to Letters
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="letter-detail-wrapper">
      <div className="letter-detail-container">
        {/* Header */}
        <header className="letter-detail-header">
          <Link to="/letters" className="back-link">
            ← Back to Letters
          </Link>
          <div className="letter-meta">
            <span className="badge">{letter.categoryName}</span>
            <span className="badge">{letter.writerName}</span>
            <span className="badge">To: {letter.recipientName}</span>
          </div>
        </header>

        {/* Main Layout */}
        <div className="letter-detail-layout">
          {/* Left Sidebar */}
          <aside className="letter-sidebar">
            {/* Image Section */}
            {(sidebarImageUrl || letter.sidebarLinkUrl) && (
              <div className="sidebar-card sidebar-image-section">
                {sidebarImageUrl && (
                  <img
                    src={sidebarImageUrl}
                    alt="Sponsor"
                    className="sidebar-image"
                  />
                )}
                {letter.sidebarLinkUrl && (
                  <a
                    href={letter.sidebarLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sidebar-link"
                  >
                    {letter.sidebarLinkText || "Visit Website"} →
                  </a>
                )}
              </div>
            )}

            {/* Poem Section */}
            {letter.poemContent && (
              <div className="sidebar-card sidebar-poem-section">
                <h3>Poem</h3>
                <div
                  className="poem-content"
                  dangerouslySetInnerHTML={{ __html: letter.poemContent }}
                />
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="letter-main-content">
            <h1 className="letter-title">{letter.title}</h1>

            <div
              ref={emailContentRef}
              className="email-content"
              dangerouslySetInnerHTML={{ __html: letter.emailContent || "" }}
            />

            {letter.emailContent && (
              <div className="copy-button-container">
                <button
                  onClick={handleCopyEmail}
                  className={`copy-button ${copied ? "copied" : ""}`}
                >
                  {copied ? "✓ Copied!" : "📋 Copy Email Text"}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default LetterDetail;