import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataClient, fetchOptionLists, uploadLetterFile } from "../lib/dataClient";

function AddLetter() {
  const [formData, setFormData] = useState({
    title: '',
    writer: '',
    recipient: '',
    category: '',
    file: null,
  });
  const [formOptions, setFormOptions] = useState({
    letterwriters: [],
    letterrecipients: [],
    lettercategories: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        const options = await fetchOptionLists();
        setFormOptions(options);
      } catch (error) {
        console.error("Failed to fetch form options:", error);
      }
    };

    fetchFormOptions();
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
    try {
      const [writer, recipient, category] = [
        formOptions.letterwriters.find((item) => item.id === formData.writer),
        formOptions.letterrecipients.find((item) => item.id === formData.recipient),
        formOptions.lettercategories.find((item) => item.id === formData.category),
      ];

      const s3Key = await uploadLetterFile(formData.file);

      await dataClient.models.Letter.create({
        title: formData.title,
        writerId: formData.writer,
        writerName: writer?.name ?? "",
        recipientId: formData.recipient,
        recipientName: recipient?.name ?? "",
        categoryId: formData.category,
        categoryName: category?.name ?? "",
        content: "",
        s3Key,
      });

      navigate('/letters');
    } catch (error) {
      console.error("Failed to add letter:", error);
    }
  };

  return (
    <div>
      <h1>Add New Letter</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Writer</label>
          <select name="writer" value={formData.writer} onChange={handleChange} required>
            <option value="">Select a writer</option>
            {formOptions.letterwriters.map((writer) => (
              <option key={writer.id} value={writer.id}>
                {writer.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Recipient</label>
          <select name="recipient" value={formData.recipient} onChange={handleChange} required>
            <option value="">Select a recipient</option>
            {formOptions.letterrecipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            {formOptions.lettercategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Upload .docx File</label>
          <input type="file" name="file" onChange={handleFileChange} accept=".docx" required />
        </div>
        <button type="submit">Add Letter</button>
      </form>
    </div>
  );
}

export default AddLetter;