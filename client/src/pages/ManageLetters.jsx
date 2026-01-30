import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { dataClient, authModes } from "../lib/dataClient";
import "../styles/ContentEditor.css";

function ManageLetters() {
    const [letters, setLetters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        loadLetters();
    }, []);

    const loadLetters = async () => {
        try {
            setLoading(true);
            const { data } = await dataClient.models.Letter.list(authModes.read);
            setLetters(data || []);
        } catch (err) {
            console.error("Failed to load letters:", err);
            setError("Failed to load letters.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await dataClient.models.Letter.delete({ id }, authModes.write);
            setLetters((prev) => prev.filter((letter) => letter.id !== id));
            setDeleteId(null);
        } catch (err) {
            console.error("Failed to delete letter:", err);
            setError("Failed to delete letter.");
        }
    };

    return (
        <div className="content-editor-wrapper">
            <Authenticator>
                {({ user }) => (
                    <div className="content-editor">
                        <header className="editor-header">
                            <h1>Manage Letters</h1>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <Link to="/content-editor" className="btn-primary" style={{ textDecoration: "none", padding: "0.75rem 1.5rem" }}>
                                    + Create New Letter
                                </Link>
                                <Link to="/admin" className="back-link">
                                    ← Back to Dashboard
                                </Link>
                            </div>
                        </header>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-section">
                            {loading ? (
                                <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
                                    Loading letters...
                                </p>
                            ) : letters.length === 0 ? (
                                <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
                                    No letters found. Create your first letter!
                                </p>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                                                <th style={tableHeaderStyle}>Title</th>
                                                <th style={tableHeaderStyle}>Category</th>
                                                <th style={tableHeaderStyle}>Writer</th>
                                                <th style={tableHeaderStyle}>Recipient</th>
                                                <th style={tableHeaderStyle}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {letters.map((letter) => (
                                                <tr key={letter.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                    <td style={tableCellStyle}>{letter.title}</td>
                                                    <td style={tableCellStyle}>
                                                        <span style={badgeStyle}>{letter.categoryName}</span>
                                                    </td>
                                                    <td style={tableCellStyle}>{letter.writerName}</td>
                                                    <td style={tableCellStyle}>{letter.recipientName}</td>
                                                    <td style={tableCellStyle}>
                                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                                            <Link
                                                                to={`/content-editor/${letter.id}`}
                                                                style={editButtonStyle}
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => setDeleteId(letter.id)}
                                                                style={deleteButtonStyle}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Delete Confirmation Modal */}
                        {deleteId && (
                            <div style={modalOverlayStyle}>
                                <div style={modalStyle}>
                                    <h3 style={{ color: "#fff", marginBottom: "1rem" }}>
                                        Confirm Delete
                                    </h3>
                                    <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
                                        Are you sure you want to delete this letter? This action cannot be undone.
                                    </p>
                                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                                        <button
                                            onClick={() => setDeleteId(null)}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDelete(deleteId)}
                                            style={{ ...deleteButtonStyle, padding: "0.75rem 1.5rem" }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Authenticator>
        </div>
    );
}

const tableHeaderStyle = {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: "0.875rem",
    textAlign: "left",
    padding: "1rem",
};

const tableCellStyle = {
    color: "#fff",
    padding: "1rem",
    fontSize: "0.9rem",
};

const badgeStyle = {
    background: "rgba(99, 102, 241, 0.2)",
    color: "#a5b4fc",
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "500",
};

const editButtonStyle = {
    background: "rgba(99, 102, 241, 0.2)",
    color: "#a5b4fc",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    cursor: "pointer",
    textDecoration: "none",
};

const deleteButtonStyle = {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    cursor: "pointer",
};

const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
};

const modalStyle = {
    background: "#1e293b",
    padding: "2rem",
    borderRadius: "12px",
    maxWidth: "400px",
    width: "90%",
    border: "1px solid rgba(255, 255, 255, 0.1)",
};

export default ManageLetters;
