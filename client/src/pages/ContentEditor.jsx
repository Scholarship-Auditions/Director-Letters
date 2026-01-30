import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { uploadData, getUrl } from "aws-amplify/storage";
import { dataClient, authModes, fetchOptionLists } from "../lib/dataClient";
import "../styles/ContentEditor.css";

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link"],
        ["clean"],
    ],
};

const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "indent",
    "align",
    "link",
];

function ContentEditorPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        categoryId: "",
        categoryName: "",
        writerId: "",
        writerName: "",
        recipientId: "",
        recipientName: "",
        emailContent: "",
        sidebarImage: "",
        sidebarLinkText: "",
        sidebarLinkUrl: "",
        poemContent: "",
    });

    const [options, setOptions] = useState({
        letterwriters: [],
        letterrecipients: [],
        lettercategories: [],
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadOptions();
        if (isEditing) {
            loadLetter();
        }
    }, [id]);

    const loadOptions = async () => {
        try {
            const data = await fetchOptionLists();
            setOptions(data);
        } catch (err) {
            console.error("Failed to load options:", err);
            setError("Failed to load dropdown options.");
        }
    };

    const loadLetter = async () => {
        try {
            setLoading(true);
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
                    sidebarImage: data.sidebarImage || "",
                    sidebarLinkText: data.sidebarLinkText || "",
                    sidebarLinkUrl: data.sidebarLinkUrl || "",
                    poemContent: data.poemContent || "",
                });

                if (data.sidebarImage) {
                    const { url } = await getUrl({ path: data.sidebarImage });
                    setImagePreview(url.toString());
                }
            }
        } catch (err) {
            console.error("Failed to load letter:", err);
            setError("Failed to load letter for editing.");
        } finally {
            setLoading(false);
        }
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

    const handlePoemContentChange = (value) => {
        setFormData((prev) => ({ ...prev, poemContent: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
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

            let sidebarImagePath = formData.sidebarImage;

            // Upload image if new one selected
            if (imageFile) {
                const imageKey = `content-images/${Date.now()}-${imageFile.name}`;
                await uploadData({
                    path: imageKey,
                    data: imageFile,
                    options: {
                        contentType: imageFile.type,
                    },
                });
                sidebarImagePath = imageKey;
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
                sidebarImage: sidebarImagePath,
                sidebarLinkText: formData.sidebarLinkText,
                sidebarLinkUrl: formData.sidebarLinkUrl,
                poemContent: formData.poemContent,
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
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Enter letter title"
                                            required
                                        />
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

                            {/* Email Content Section */}
                            <div className="form-section">
                                <h2>Email Content</h2>
                                <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1rem" }}>
                                    Paste your email content here. You can paste directly from Word to preserve formatting.
                                </p>
                                <div className="editor-container">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.emailContent}
                                        onChange={handleEmailContentChange}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="Paste or type your email content here..."
                                    />
                                </div>
                            </div>

                            {/* Sidebar Content Section */}
                            <div className="form-section">
                                <h2>Sidebar Content</h2>
                                <div className="sidebar-grid">
                                    <div>
                                        <h3 style={{ color: "#fff", fontSize: "1rem", marginBottom: "1rem" }}>
                                            Image & Link
                                        </h3>
                                        <div className="image-upload-section">
                                            <div className="image-preview">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Sidebar preview" />
                                                ) : (
                                                    <span className="placeholder">No image uploaded</span>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                className="image-upload-input"
                                            />
                                            <button
                                                type="button"
                                                onClick={triggerImageUpload}
                                                className="upload-button"
                                            >
                                                {imagePreview ? "Change Image" : "Upload Image"}
                                            </button>
                                        </div>
                                        <div className="form-field" style={{ marginTop: "1rem" }}>
                                            <label>Link Text</label>
                                            <input
                                                type="text"
                                                name="sidebarLinkText"
                                                value={formData.sidebarLinkText}
                                                onChange={handleChange}
                                                placeholder="e.g. Visit Our Sponsor"
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label>Link URL</label>
                                            <input
                                                type="url"
                                                name="sidebarLinkUrl"
                                                value={formData.sidebarLinkUrl}
                                                onChange={handleChange}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 style={{ color: "#fff", fontSize: "1rem", marginBottom: "1rem" }}>
                                            Poem Content
                                        </h3>
                                        <div className="editor-container poem-editor">
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.poemContent}
                                                onChange={handlePoemContentChange}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder="Paste or type your poem here..."
                                            />
                                        </div>
                                    </div>
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
