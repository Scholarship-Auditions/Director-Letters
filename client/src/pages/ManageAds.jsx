import React, { useState, useEffect, useRef } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Link } from "react-router-dom";
import { uploadData, getUrl } from "aws-amplify/storage";
import { dataClient, authModes } from "../lib/dataClient";
import "../styles/ManageAds.css";

function ManageAds() {
    const [ads, setAds] = useState([]);
    const [adPreviews, setAdPreviews] = useState({});
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ linkText: "", linkUrl: "", image: "" });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const { data } = await dataClient.models.Advertisement.list(authModes.read);
            const adList = data || [];
            setAds(adList);

            // Load image previews for all ads
            const previews = {};
            for (const ad of adList) {
                if (ad.image) {
                    try {
                        const { url } = await getUrl({ path: ad.image });
                        previews[ad.id] = url.toString();
                    } catch (e) {
                        console.error("Failed to load image for ad:", ad.id);
                    }
                }
            }
            setAdPreviews(previews);
        } catch (err) {
            console.error("Failed to fetch ads:", err);
            setError("Failed to load advertisements.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.linkText.trim() || !formData.linkUrl.trim()) {
            setError("Please fill in link text and URL.");
            return;
        }

        if (!editingId && !imageFile && !formData.image) {
            setError("Please upload an image for the advertisement.");
            return;
        }

        try {
            setSaving(true);
            let imagePath = formData.image;

            if (imageFile) {
                const imageKey = `ad-images/${Date.now()}-${imageFile.name}`;
                await uploadData({
                    path: imageKey,
                    data: imageFile,
                    options: { contentType: imageFile.type },
                });
                imagePath = imageKey;
            }

            const adData = {
                linkText: formData.linkText,
                linkUrl: formData.linkUrl,
                image: imagePath,
            };

            if (editingId) {
                await dataClient.models.Advertisement.update(
                    { id: editingId, ...adData },
                    authModes.write
                );
                setSuccess("Advertisement updated!");
            } else {
                await dataClient.models.Advertisement.create(adData, authModes.write);
                setSuccess("Advertisement created!");
            }

            setFormData({ linkText: "", linkUrl: "", image: "" });
            setImageFile(null);
            setImagePreview(null);
            setEditingId(null);
            fetchAds();
        } catch (err) {
            console.error("Failed to save ad:", err);
            setError("Failed to save advertisement.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (ad) => {
        setEditingId(ad.id);
        setFormData({ linkText: ad.linkText, linkUrl: ad.linkUrl, image: ad.image });
        setImagePreview(adPreviews[ad.id] || null);
        setImageFile(null);
        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this advertisement?")) return;
        try {
            await dataClient.models.Advertisement.delete({ id }, authModes.write);
            setSuccess("Advertisement deleted.");
            fetchAds();
        } catch (err) {
            console.error("Failed to delete ad:", err);
            setError("Failed to delete advertisement.");
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ linkText: "", linkUrl: "", image: "" });
        setImageFile(null);
        setImagePreview(null);
        setError("");
        setSuccess("");
    };

    return (
        <div className="manage-ads-wrapper">
            <Authenticator>
                {({ user }) => (
                    <div className="manage-ads">
                        <header className="manage-header">
                            <h1>Manage Advertisements</h1>
                            <Link to="/admin" className="back-link">← Back to Dashboard</Link>
                        </header>

                        {error && <div className="msg error-msg">{error}</div>}
                        {success && <div className="msg success-msg">{success}</div>}

                        {/* Create / Edit Form */}
                        <form onSubmit={handleSubmit} className="ad-form">
                            <h2>{editingId ? "Edit Advertisement" : "Add New Advertisement"}</h2>

                            <div className="ad-form-grid">
                                <div>
                                    <div className="form-field">
                                        <label>Link Text *</label>
                                        <input
                                            type="text"
                                            value={formData.linkText}
                                            onChange={(e) => setFormData((p) => ({ ...p, linkText: e.target.value }))}
                                            placeholder='e.g. "National Scholastic Music Awards"'
                                            required
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Link URL *</label>
                                        <input
                                            type="url"
                                            value={formData.linkUrl}
                                            onChange={(e) => setFormData((p) => ({ ...p, linkUrl: e.target.value }))}
                                            placeholder="https://example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="form-field">
                                        <label>Ad Image *</label>
                                        <div className="image-upload-section">
                                            <div className="image-preview">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Ad preview" />
                                                ) : (
                                                    <span className="placeholder">No image</span>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                style={{ display: "none" }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="upload-button"
                                            >
                                                {imagePreview ? "Change Image" : "Upload Image"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                {editingId && (
                                    <button type="button" className="btn-secondary" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? "Saving..." : editingId ? "Update Ad" : "Create Ad"}
                                </button>
                            </div>
                        </form>

                        {/* Ads List */}
                        <section className="ads-list-section">
                            <h2>All Advertisements ({ads.length})</h2>
                            {loading ? (
                                <p className="loading-text">Loading ads...</p>
                            ) : ads.length === 0 ? (
                                <p className="empty-text">No advertisements yet. Create your first one above.</p>
                            ) : (
                                <div className="ads-grid">
                                    {ads.map((ad) => (
                                        <div key={ad.id} className="ad-card">
                                            <div className="ad-card-image">
                                                {adPreviews[ad.id] ? (
                                                    <img src={adPreviews[ad.id]} alt={ad.linkText} />
                                                ) : (
                                                    <span className="placeholder">No image</span>
                                                )}
                                            </div>
                                            <div className="ad-card-info">
                                                <h3>{ad.linkText}</h3>
                                                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="ad-url">
                                                    {ad.linkUrl}
                                                </a>
                                            </div>
                                            <div className="ad-card-actions">
                                                <button onClick={() => handleEdit(ad)} className="btn-edit">
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => handleDelete(ad.id)} className="btn-delete">
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

export default ManageAds;
