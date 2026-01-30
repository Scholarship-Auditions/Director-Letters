import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUrl } from "aws-amplify/storage";
import { dataClient, authModes } from "../lib/dataClient";
import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver";
import "../styles/LetterDetail.css";

function LetterDetail() {
  const { id } = useParams();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarImageUrl, setSidebarImageUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(null);

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

  const handleDownloadDocx = async () => {
    if (!letter?.emailContent) return;
    setDownloading("docx");

    try {
      // Build clean HTML for conversion
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
            <h1>${letter.title}</h1>
            ${letter.emailContent}
          </body>
        </html>
      `;

      const buffer = await asBlob(cleanHtml, { orientation: "portrait" });
      saveAs(buffer, `${letter.title}.docx`);
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
      // Create a printable version and use browser's print to PDF
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
            <title>${letter.title}</title>
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
            <h1>${letter.title}</h1>
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

      // Trigger print dialog after brief delay
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
              className="email-content"
              dangerouslySetInnerHTML={{ __html: letter.emailContent || "" }}
            />

            {/* Action Buttons Section */}
            <div className="letter-actions">
              <div className="letter-actions-left">
                {letter.emailContent && (
                  <button
                    onClick={handleCopyEmail}
                    className={`action-button copy-btn ${copied ? "copied" : ""}`}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy Text"}
                  </button>
                )}
              </div>
              <div className="letter-actions-right">
                <button
                  onClick={handleDownloadDocx}
                  disabled={downloading === "docx"}
                  className="action-button download-btn docx-btn"
                >
                  {downloading === "docx" ? "Converting..." : "📄 Download DOCX"}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading === "pdf"}
                  className="action-button download-btn pdf-btn"
                >
                  {downloading === "pdf" ? "Generating..." : "📑 Download PDF"}
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