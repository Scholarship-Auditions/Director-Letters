import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
        const response = await api.get('/api/form-data/add-letter');
        setFormOptions(response.data);
      } catch (error) {
        console.error('Failed to fetch form options:', error);
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
    const postData = new FormData();
    postData.append('title', formData.title);
    postData.append('writer', formData.writer);
    postData.append('recipient', formData.recipient);
    postData.append('category', formData.category);
    postData.append('file', formData.file);

    try {
      await api.post('/api/letters', postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/letters');
    } catch (error) {
      console.error('Failed to add letter:', error);
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
              <option key={writer.writer_id} value={writer.writer_id}>
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
              <option key={recipient.recipient_id} value={recipient.recipient_id}>
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
              <option key={category.category_id} value={category.category_id}>
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