import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authModes, dataClient, fetchOptionLists } from "../lib/dataClient";

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
          dataClient.models.Letter.get({ id }),
          fetchOptionLists(),
        ]);

        const letter = letterResponse?.data;
        if (!letter) {
          setFormOptions(optionsResponse);
          return;
        }
        setFormData({
          title: letter.title,
          content: letter.content,
          writer: letter.writerId,
          recipient: letter.recipientId,
          category: letter.categoryId,
        });
        setFormOptions(optionsResponse);
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
      await dataClient.models.Letter.update(
        {
          id,
          title: formData.title,
          content: formData.content,
          writerId: formData.writer,
          recipientId: formData.recipient,
          categoryId: formData.category,
        },
        authModes.write
      );
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
        <button type="submit">Update Letter</button>
      </form>
    </div>
  );
}

export default EditLetter;