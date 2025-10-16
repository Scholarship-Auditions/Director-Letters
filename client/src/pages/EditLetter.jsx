import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function EditLetter() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    writer: '',
    recipient: '',
    category: '',
  });
  const [formOptions, setFormOptions] = useState({
    letterwriters: [],
    letterrecipients: [],
    lettercategories: [],
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLetterAndOptions = async () => {
      try {
        const [letterResponse, optionsResponse] = await Promise.all([
          api.get(`/api/letters/${id}`),
          api.get('/api/form-data/add-letter'),
        ]);

        const letter = letterResponse.data;
        setFormData({
          title: letter.title,
          content: letter.content,
          writer: letter.writer_id,
          recipient: letter.recipient_id,
          category: letter.category_id,
        });
        setFormOptions(optionsResponse.data);
      } catch (error) {
        console.error('Failed to fetch letter or options:', error);
      }
    };
    fetchLetterAndOptions();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/letters/${id}`, formData);
      navigate(`/letters/${id}`);
    } catch (error) {
      console.error('Failed to update letter:', error);
    }
  };

  return (
    <div>
      <h1>Edit Letter</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Content</label>
          <textarea name="content" value={formData.content} onChange={handleChange} required />
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
        <button type="submit">Update Letter</button>
      </form>
    </div>
  );
}

export default EditLetter;