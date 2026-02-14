import React, { useState, useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { dataClient, authModes } from "../lib/dataClient";
import "../styles/ManagePoems.css";

const poemQuillModules = {
    toolbar: [
        ["bold", "italic", "underline"],
        [{ align: [] }],
        ["clean"],
    ],
};

const poemQuillFormats = ["bold", "italic", "underline", "align"];

function ManagePoems() {
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchPoems();
    }, []);

    const fetchPoems = async () => {
        try {
            setLoading(true);
            const { data } = await dataClient.models.Poem.list(authModes.read);
            setPoems(data || []);
        } catch (err) {
            console.error("Failed to fetch poems:", err);
            setError("Failed to load poems.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.title.trim() || !formData.content.trim()) {
            setError("Please fill in both title and content.");
            return;
        }

        try {
            if (editingId) {
                await dataClient.models.Poem.update(
                    { id: editingId, title: formData.title, content: formData.content },
                    authModes.write
                );
                setSuccess("Poem updated successfully!");
            } else {
                await dataClient.models.Poem.create(
                    { title: formData.title, content: formData.content },
                    authModes.write
                );
                setSuccess("Poem created successfully!");
            }
            setFormData({ title: "", content: "" });
            setEditingId(null);
            fetchPoems();
        } catch (err) {
            console.error("Failed to save poem:", err);
            setError("Failed to save poem.");
        }
    };

    const handleEdit = (poem) => {
        setEditingId(poem.id);
        setFormData({ title: poem.title, content: poem.content });
        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this poem?")) return;
        try {
            await dataClient.models.Poem.delete({ id }, authModes.write);
            setSuccess("Poem deleted.");
            fetchPoems();
        } catch (err) {
            console.error("Failed to delete poem:", err);
            setError("Failed to delete poem.");
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ title: "", content: "" });
        setError("");
        setSuccess("");
    };

    return (
        <div className="manage-poems-wrapper">
            <Authenticator>
                {({ user }) => (
                    <div className="manage-poems">
                        <header className="manage-header">
                            <h1>Manage Poems</h1>
                            <Link to="/admin" className="back-link">← Back to Dashboard</Link>
                        </header>

                        {error && <div className="msg error-msg">{error}</div>}
                        {success && <div className="msg success-msg">{success}</div>}

                        {/* Create / Edit Form */}
                        <form onSubmit={handleSubmit} className="poem-form">
                            <h2>{editingId ? "Edit Poem" : "Add New Poem"}</h2>
                            <div className="form-field">
                                <label>Poem Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder='e.g. "One Believing Adult"'
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Poem Content *</label>
                                <div className="editor-container">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.content}
                                        onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                                        modules={poemQuillModules}
                                        formats={poemQuillFormats}
                                        placeholder="Enter the poem text..."
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                {editingId && (
                                    <button type="button" className="btn-secondary" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="btn-primary">
                                    {editingId ? "Update Poem" : "Create Poem"}
                                </button>
                            </div>
                        </form>

                        {/* Poems List */}
                        <section className="poems-list-section">
                            <h2>All Poems ({poems.length})</h2>
                            {loading ? (
                                <p className="loading-text">Loading poems...</p>
                            ) : poems.length === 0 ? (
                                <p className="empty-text">No poems yet. Create your first poem above.</p>
                            ) : (
                                <div className="poems-grid">
                                    {poems.map((poem) => (
                                        <div key={poem.id} className="poem-card">
                                            <h3>{poem.title}</h3>
                                            <div
                                                className="poem-preview"
                                                dangerouslySetInnerHTML={{ __html: poem.content }}
                                            />
                                            <div className="poem-card-actions">
                                                <button onClick={() => handleEdit(poem)} className="btn-edit">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDelete(poem.id)} className="btn-delete">
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </Authenticator>
        </div>
    );
}

export default ManagePoems;
