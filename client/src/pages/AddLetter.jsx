import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import { useAuthenticator } from "@aws-amplify/ui-react";

const client = generateClient();

function AddLetter() {
  const navigate = useNavigate();
  const { user } = useAuthenticator((context) => [context.user]);

  const [formData, setFormData] = useState({
    title: "",
    writer: "",
    recipient: "",
    category: "",
    file: null,
  });

  const [formOptions, setFormOptions] = useState({
    letterwriters: [],
    letterrecipients: [],
    lettercategories: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [writersData, recipientsData, categoriesData] = await Promise.all(
          [
            client.models.LetterWriter.list(),
            client.models.LetterRecipient.list(),
            client.models.LetterCategory.list(),
          ]
        );

        setFormOptions({
          letterwriters: writersData.data,
          letterrecipients: recipientsData.data,
          lettercategories: categoriesData.data,
        });
      } catch (error) {
        console.error("Failed to fetch form options:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) return alert("Please upload an HTML file");

    setLoading(true);

    try {
      const writerObj = formOptions.letterwriters.find(
        (item) => item.id === formData.writer
      );
      const recipientObj = formOptions.letterrecipients.find(
        (item) => item.id === formData.recipient
      );
      const categoryObj = formOptions.lettercategories.find(
        (item) => item.id === formData.category
      );

      // 1. Upload File to S3 (Changed to ensure it treats it as HTML)
      const fileKey = `letters/${Date.now()}-${formData.file.name}`;

      await uploadData({
        path: fileKey,
        data: formData.file,
        options: {
          contentType: "text/html", // Explicitly set content type so browsers render it
        },
      }).result;

      // 2. Create Record in Database
      await client.models.Letter.create(
        {
          title: formData.title,
          writerId: formData.writer,
          writerName: writerObj?.name ?? "Unknown",
          recipientId: formData.recipient,
          recipientName: recipientObj?.name ?? "Unknown",
          categoryId: formData.category,
          categoryName: categoryObj?.name ?? "Unknown",
          content: "HTML Letter",
          s3Key: fileKey,
        },
        { authMode: "userPool" }
      );

      alert("Letter added successfully!");
      navigate("/letters");
    } catch (error) {
      console.error("Failed to add letter:", error);
      alert(`Error adding letter: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{ padding: "2rem" }}>Access Denied.</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Add New Letter</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Writer
          </label>
          <select
            name="writer"
            value={formData.writer}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select a writer</option>
            {formOptions.letterwriters.map((writer) => (
              <option key={writer.id} value={writer.id}>
                {writer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Recipient
          </label>
          <select
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select a recipient</option>
            {formOptions.letterrecipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select a category</option>
            {formOptions.lettercategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Upload .html File
          </label>
          {/* CHANGED: accept .html */}
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            accept=".html,.htm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Uploading..." : "Add Letter"}
        </button>
      </form>
    </div>
  );
}

export default AddLetter;
