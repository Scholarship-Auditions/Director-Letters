import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUrl } from "aws-amplify/storage";
import { dataClient, authModes } from "../lib/dataClient";
import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver";
import "../styles/LetterDetail.css";

// Helper function to sanitize HTML content - replace &nbsp; with regular spaces
const sanitizeContent = (html) => {
  if (!html) return "";
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/\u00A0/g, " ");
};

function LetterDetail() {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);
  const [poem, setPoem] = useState(null);
  const [ad, setAd] = useState(null);
  const [adImageUrl, setAdImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        setLoading(true);
        const { data } = await dataClient.models.Letter.get({ id }, authModes.read);

        if (data) {
          setLetter(data);

          // Fetch poem by poemId
          if (data.poemId) {
            try {
              const { data: poemData } = await dataClient.models.Poem.get(
                { id: data.poemId },
                authModes.read
              );
              if (poemData) setPoem(poemData);
            } catch (poemErr) {
              console.error("Failed to load poem:", poemErr);
            }
          }

          // Fetch advertisement by advertisementId
          if (data.advertisementId) {
            try {
              const { data: adData } = await dataClient.models.Advertisement.get(
                { id: data.advertisementId },
                authModes.read
              );
              if (adData) {
                setAd(adData);
                // Get signed URL for ad image
                if (adData.image) {
                  const { url } = await getUrl({ path: adData.image });
                  setAdImageUrl(url.toString());
                }
              }
            } catch (adErr) {
              console.error("Failed to load advertisement:", adErr);
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

  // Strip HTML tags from title for filenames and plain text usage
  const getPlainTitle = () => {
    if (!letter?.title) return "Letter";
    const div = document.createElement("div");
    div.innerHTML = letter.title;
    return div.textContent || div.innerText || "Letter";
  };

  const handleDownloadDocx = async () => {
    if (!letter?.emailContent) return;
    setDownloading("docx");

    try {
      const plainTitle = getPlainTitle();
      const cleanHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Times New Roman', serif; padding: 20px; }
              h1 { font-size: 24px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>${plainTitle}</h1>
            ${letter.emailContent}
          </body>
        </html>
      `;

      const buffer = await asBlob(cleanHtml, { orientation: "portrait" });
      saveAs(buffer, `${plainTitle}.docx`);
    } catch (error) {
      console.error("DOCX conversion failed:", error);
      alert("Could not generate DOCX file.");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPdf = () => {
    if (!letter?.emailContent) return;
    setDownloading("pdf");

    try {
      const plainTitle = getPlainTitle();
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to download PDF.");
        setDownloading(null);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${plainTitle}</title>
            <style>
              body { 
                font-family: 'Times New Roman', serif; 
                padding: 40px; 
                line-height: 1.6;
              }
              h1 { 
                font-size: 24px; 
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
              }
              .meta {
                color: #666;
                font-size: 14px;
                margin-bottom: 20px;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>${plainTitle}</h1>
            <div class="meta">
              <strong>Category:</strong> ${letter.categoryName} | 
              <strong>Writer:</strong> ${letter.writerName} | 
              <strong>Recipient:</strong> ${letter.recipientName}
            </div>
            ${letter.emailContent}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        setDownloading(null);
      }, 500);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setDownloading(null);
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
            <Link to="/letters" className="back-link">
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
        {/* Header with Back Link */}
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

        {/* Main Layout - 2 Columns */}
        <div className="letter-detail-layout">
          {/* Left Sidebar */}
          <aside className="letter-sidebar">
            {/* Advertisement Image Section */}
            {ad && (
              <div className="sidebar-image-section">
                {adImageUrl && (
                  <img
                    src={adImageUrl}
                    alt={ad.linkText}
                    className="sidebar-image"
                  />
                )}
                {ad.linkUrl && (
                  <>
                    <p className="sponsor-text">Sponsored by</p>
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sidebar-link"
                    >
                      {ad.linkText || "Visit Website"}
                    </a>
                  </>
                )}
              </div>
            )}

            {/* Poem Section */}
            {poem && (
              <div className="sidebar-poem-section">
                <h3>{poem.title}</h3>
                <div
                  className="poem-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeContent(poem.content) }}
                />
              </div>
            )}

            {/* Ad Banner Section */}
            <div className="sidebar-ad-section">
              <div className="ad-banner">
                <h4>Poem Book<br />Advertisement</h4>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="letter-main-content">
            {/* Title Header - Yellow - now renders rich HTML */}
            <div className="letter-title-header">
              <div
                className="letter-title"
                dangerouslySetInnerHTML={{ __html: letter.title }}
              />
            </div>

            {/* Email Content - White */}
            <div className="email-content-wrapper">
              <div
                className="email-content"
                dangerouslySetInnerHTML={{ __html: sanitizeContent(letter.emailContent) }}
              />

              {/* Copy Button */}
              {letter.emailContent && (
                <button
                  onClick={handleCopyEmail}
                  className={`action-button copy-btn ${copied ? "copied" : ""}`}
                >
                  {copied ? "✓ Copied!" : "📋 Copy Text"}
                </button>
              )}
            </div>

            {/* Download Section */}
            <div className="letter-actions">
              <span className="download-label">Download as</span>
              <div className="download-buttons">
                <button
                  onClick={handleDownloadDocx}
                  disabled={downloading === "docx"}
                  className="action-button docx-btn"
                >
                  {downloading === "docx" ? "..." : "DOCX"}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading === "pdf"}
                  className="action-button pdf-btn"
                >
                  {downloading === "pdf" ? "..." : "PDF"}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default LetterDetail;