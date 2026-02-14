import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { dataClient, authModes, fetchOptionLists, fetchPoems, fetchAdvertisements } from "../lib/dataClient";
import "../styles/ContentEditor.css";

// Enhanced Quill modules with ALL formatting options
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ["8px", "10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "72px"] }],
        ["bold", "italic", "underline", "strike"],
        [{ script: "sub" }, { script: "super" }],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
    ],
};

// Simple toolbar for title editor
const titleQuillModules = {
    toolbar: [
        ["bold", "italic", "underline"],
        [{ color: [] }],
        ["clean"],
    ],
};

const titleQuillFormats = ["bold", "italic", "underline", "color"];

const quillFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "script",
    "color",
    "background",
    "list",
    "indent",
    "direction",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
];

function ContentEditorPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: "",
        categoryId: "",
        categoryName: "",
        writerId: "",
        writerName: "",
        recipientId: "",
        recipientName: "",
        emailContent: "",
        poemId: "",
        advertisementId: "",
    });

    const [options, setOptions] = useState({
        letterwriters: [],
        letterrecipients: [],
        lettercategories: [],
    });

    const [poems, setPoems] = useState([]);
    const [ads, setAds] = useState([]);
    const [allLetters, setAllLetters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showEmailHtml, setShowEmailHtml] = useState(false);

    useEffect(() => {
        loadAll();
    }, [id]);

    const loadAll = async () => {
        try {
            setLoading(true);
            const [optData, poemData, adData, letterList] = await Promise.all([
                fetchOptionLists(),
                fetchPoems(),
                fetchAdvertisements(),
                dataClient.models.Letter.list(authModes.read),
            ]);

            setOptions(optData);
            setPoems(poemData);
            setAds(adData);
            setAllLetters(letterList.data || []);

            if (isEditing) {
                const { data } = await dataClient.models.Letter.get({ id }, authModes.read);
                if (data) {
                    setFormData({
                        title: data.title || "",
                        categoryId: data.categoryId || "",
                        categoryName: data.categoryName || "",
                        writerId: data.writerId || "",
                        writerName: data.writerName || "",
                        recipientId: data.recipientId || "",
                        recipientName: data.recipientName || "",
                        emailContent: data.emailContent || "",
                        poemId: data.poemId || "",
                        advertisementId: data.advertisementId || "",
                    });
                }
            } else {
                // Auto-assign least-used poem and ad for new letters
                const existingLetters = letterList.data || [];
                const autoPoem = getLeastUsed(poemData, existingLetters, "poemId");
                const autoAd = getLeastUsed(adData, existingLetters, "advertisementId");

                setFormData((prev) => ({
                    ...prev,
                    poemId: autoPoem || "",
                    advertisementId: autoAd || "",
                }));
            }
        } catch (err) {
            console.error("Failed to load data:", err);
            setError("Failed to load form data.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Auto-assignment: returns the ID of the item used the fewest times
     */
    const getLeastUsed = (items, letters, field) => {
        if (!items.length) return "";

        // Count usage of each item
        const usageMap = {};
        items.forEach((item) => (usageMap[item.id] = 0));
        letters.forEach((letter) => {
            if (letter[field] && usageMap[letter[field]] !== undefined) {
                usageMap[letter[field]]++;
            }
        });

        // Find the one with the lowest count
        let minCount = Infinity;
        let minId = items[0].id;
        for (const [itemId, count] of Object.entries(usageMap)) {
            if (count < minCount) {
                minCount = count;
                minId = itemId;
            }
        }
        return minId;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-set name fields when ID is selected
        if (name === "categoryId") {
            const category = options.lettercategories.find((c) => c.id === value);
            setFormData((prev) => ({
                ...prev,
                categoryId: value,
                categoryName: category?.name || "",
            }));
        } else if (name === "writerId") {
            const writer = options.letterwriters.find((w) => w.id === value);
            setFormData((prev) => ({
                ...prev,
                writerId: value,
                writerName: writer?.name || "",
            }));
        } else if (name === "recipientId") {
            const recipient = options.letterrecipients.find((r) => r.id === value);
            setFormData((prev) => ({
                ...prev,
                recipientId: value,
                recipientName: recipient?.name || "",
            }));
        }
    };

    const handleEmailContentChange = (value) => {
        setFormData((prev) => ({ ...prev, emailContent: value }));
    };

    const handleTitleChange = (value) => {
        setFormData((prev) => ({ ...prev, title: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.title || !formData.categoryId || !formData.writerId || !formData.recipientId) {
                throw new Error("Please fill in all required fields (Title, Category, Writer, Recipient).");
            }

            const letterData = {
                title: formData.title,
                categoryId: formData.categoryId,
                categoryName: formData.categoryName,
                writerId: formData.writerId,
                writerName: formData.writerName,
                recipientId: formData.recipientId,
                recipientName: formData.recipientName,
                emailContent: formData.emailContent,
                poemId: formData.poemId || null,
                advertisementId: formData.advertisementId || null,
            };

            if (isEditing) {
                await dataClient.models.Letter.update({ id, ...letterData }, authModes.write);
                setSuccess("Letter updated successfully!");
            } else {
                await dataClient.models.Letter.create(letterData, authModes.write);
                setSuccess("Letter created successfully!");
            }

            setTimeout(() => navigate("/manage-letters"), 1500);
        } catch (err) {
            console.error("Failed to save letter:", err);
            setError(err.message || "Failed to save letter. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Get usage count for a given poem/ad
    const getUsageCount = (itemId, field) => {
        return allLetters.filter((l) => l[field] === itemId).length;
    };

    return (
        <div className="content-editor-wrapper">
            <Authenticator>
                {({ user }) => (
                    <div className="content-editor">
                        <header className="editor-header">
                            <h1>{isEditing ? "Edit Letter" : "Create New Letter"}</h1>
                            <Link to="/admin" className="back-link">
                                ← Back to Dashboard
                            </Link>
                        </header>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <form onSubmit={handleSubmit} className="editor-form">
                            {/* Basic Info Section */}
                            <div className="form-section">
                                <h2>Letter Details</h2>

                                {/* Title - Rich Text */}
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Title * (Rich Text)</label>
                                        <div className="editor-container title-editor">
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.title}
                                                onChange={handleTitleChange}
                                                modules={titleQuillModules}
                                                formats={titleQuillFormats}
                                                placeholder="Enter letter title..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Category *</label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {options.lettercategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label>Writer *</label>
                                        <select
                                            name="writerId"
                                            value={formData.writerId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Writer</option>
                                            {options.letterwriters.map((writer) => (
                                                <option key={writer.id} value={writer.id}>
                                                    {writer.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label>Recipient *</label>
                                        <select
                                            name="recipientId"
                                            value={formData.recipientId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Recipient</option>
                                            {options.letterrecipients.map((rec) => (
                                                <option key={rec.id} value={rec.id}>
                                                    {rec.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Poem & Ad Assignment Section */}
                            <div className="form-section">
                                <h2>Poem & Advertisement Assignment</h2>
                                <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1rem" }}>
                                    The least-used poem and ad are auto-selected. You can override by choosing a different one.
                                </p>
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Poem</label>
                                        <select
                                            name="poemId"
                                            value={formData.poemId}
                                            onChange={handleChange}
                                        >
                                            <option value="">-- No Poem --</option>
                                            {poems.map((poem) => (
                                                <option key={poem.id} value={poem.id}>
                                                    {poem.title} (used {getUsageCount(poem.id, "poemId")}×)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label>Advertisement</label>
                                        <select
                                            name="advertisementId"
                                            value={formData.advertisementId}
                                            onChange={handleChange}
                                        >
                                            <option value="">-- No Ad --</option>
                                            {ads.map((ad) => (
                                                <option key={ad.id} value={ad.id}>
                                                    {ad.linkText} (used {getUsageCount(ad.id, "advertisementId")}×)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Email Content Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <h2>Email Content</h2>
                                    <button
                                        type="button"
                                        className="html-toggle-btn"
                                        onClick={() => setShowEmailHtml(!showEmailHtml)}
                                    >
                                        {showEmailHtml ? "📝 Visual Editor" : "💻 HTML Source"}
                                    </button>
                                </div>
                                <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1rem" }}>
                                    Paste your email content here. You can paste directly from Word to preserve formatting.
                                </p>
                                <div className="editor-container">
                                    {showEmailHtml ? (
                                        <textarea
                                            className="html-source-editor"
                                            value={formData.emailContent}
                                            onChange={(e) => handleEmailContentChange(e.target.value)}
                                            placeholder="<p>Enter your HTML content here...</p>"
                                        />
                                    ) : (
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.emailContent}
                                            onChange={handleEmailContentChange}
                                            modules={quillModules}
                                            formats={quillFormats}
                                            placeholder="Paste or type your email content here..."
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => navigate("/admin")}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading
                                        ? "Saving..."
                                        : isEditing
                                            ? "Update Letter"
                                            : "Create Letter"}
                                </button>
                            </div>
                        </form>

                        {loading && (
                            <div className="loading-overlay">
                                <div className="loading-spinner"></div>
                            </div>
                        )}
                    </div>
                )}
            </Authenticator>
        </div>
    );
}

export default ContentEditorPage;
