import React, { useEffect, useMemo, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import api from "../api";
import { Link } from "react-router-dom";

const initialForm = { writer: "", recipient: "", category: "" };

const AdminDashboard = () => {
  const [options, setOptions] = useState({
    letterwriters: [],
    letterrecipients: [],
    lettercategories: [],
  });
  const [formValues, setFormValues] = useState(initialForm);
  const [editSelection, setEditSelection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const optionConfig = {
    writer: {
      key: "writer_id",
      endpoint: "writers",
      label: "Writer",
    },
    recipient: {
      key: "recipient_id",
      endpoint: "recipients",
      label: "Recipient",
    },
    category: {
      key: "category_id",
      endpoint: "categories",
      label: "Category",
    },
  };

  const fetchOptions = async () => {
    try {
      const { data } = await api.get("/api/options");
      setOptions(data);
    } catch (err) {
      console.error("Failed to load options", err);
      setError("Unable to load dropdown options. Please try again.");
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    setEditSelection((prev) => ({ ...prev, newName: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const requests = [];
      if (formValues.writer.trim()) {
        requests.push(
          api.post("/api/options/writers", { name: formValues.writer.trim() })
        );
      }
      if (formValues.recipient.trim()) {
        requests.push(
          api.post("/api/options/recipients", { name: formValues.recipient.trim() })
        );
      }
      if (formValues.category.trim()) {
        requests.push(
          api.post("/api/options/categories", { name: formValues.category.trim() })
        );
      }

      if (requests.length === 0) {
        setError("Add at least one new option before saving.");
        setIsSaving(false);
        return;
      }

      await Promise.all(requests);
      setFormValues(initialForm);
      fetchOptions();
    } catch (err) {
      console.error("Failed to save options", err);
      setError("Could not save your updates. Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const sortedOptions = useMemo(
    () => ({
      writers: [...options.letterwriters].sort((a, b) => a.name.localeCompare(b.name)),
      recipients: [...options.letterrecipients].sort((a, b) => a.name.localeCompare(b.name)),
      categories: [...options.lettercategories].sort((a, b) => a.name.localeCompare(b.name)),
    }),
    [options]
  );

  const renderList = (type, label, items, keyField) => (
    <div className="admin-card">
      <h3>{label}</h3>
      {items.length === 0 ? (
        <p className="muted">Nothing added yet.</p>
      ) : (
        <ul className="option-list">
          {items.map((item) => (
            <li key={item[keyField]} className="option-row">
              <span>{item.name}</span>
              <button
                type="button"
                className="link-button"
                onClick={() =>
                  setEditSelection({
                    type,
                    id: item[keyField],
                    currentName: item.name,
                    newName: item.name,
                  })
                }
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editSelection?.type || !editSelection.newName?.trim()) {
      setError("Enter a new name before saving your change.");
      return;
    }

    const config = optionConfig[editSelection.type];
    if (!config) {
      setError("Unknown option type selected.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await api.put(
        `/api/options/${config.endpoint}/${editSelection.id}`,
        { name: editSelection.newName.trim() }
      );
      setEditSelection(null);
      fetchOptions();
    } catch (err) {
      console.error("Failed to update option", err);
      setError("Could not update the selected option. Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-wrapper">
      <Authenticator>
        {({ signOut, user }) => (
          <div className="admin-content">
            <header className="admin-header">
              <div>
                <p className="muted">Signed in as {user?.username}</p>
                <h1>Letters Admin Dashboard</h1>
                <p className="muted">
                  Use this page to onboard directors, recipients, and categories
                  before uploading new letters.
                </p>
              </div>
              <div className="admin-header-actions">
                <Link to="/add-letter" className="primary-button">
                  Upload a letter
                </Link>
                <button type="button" className="secondary-button" onClick={signOut}>
                  Sign out
                </button>
              </div>
            </header>

            <section className="admin-grid">
              {renderList("writer", "Writers", sortedOptions.writers, "writer_id")}
              {renderList(
                "recipient",
                "Recipients",
                sortedOptions.recipients,
                "recipient_id"
              )}
              {renderList(
                "category",
                "Categories",
                sortedOptions.categories,
                "category_id"
              )}
            </section>

            <section className="admin-form-card">
              <h2>Add new dropdown options</h2>
              <p className="muted">
                Add any combination of writers, recipients, or categories. All
                non-empty fields will be saved together.
              </p>
              <form onSubmit={handleSubmit} className="admin-form">
                <label className="admin-field">
                  <span>Writer</span>
                  <input
                    type="text"
                    name="writer"
                    value={formValues.writer}
                    onChange={handleChange}
                    placeholder="e.g. Band Director"
                  />
                </label>
                <label className="admin-field">
                  <span>Recipient</span>
                  <input
                    type="text"
                    name="recipient"
                    value={formValues.recipient}
                    onChange={handleChange}
                    placeholder="e.g. Student"
                  />
                </label>
                <label className="admin-field">
                  <span>Category</span>
                  <input
                    type="text"
                    name="category"
                    value={formValues.category}
                    onChange={handleChange}
                    placeholder="e.g. Recommendation"
                  />
                </label>
                {error && <p className="error-text">{error}</p>}
                <div className="admin-actions">
                  <button type="submit" className="primary-button" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save options"}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setFormValues(initialForm)}
                  disabled={isSaving}
                >
                  Clear
                </button>
              </div>
            </form>

            {editSelection && (
              <div className="admin-form edit-form">
                <div className="admin-field">
                  <span>Editing {optionConfig[editSelection.type]?.label}</span>
                  <input
                    type="text"
                    value={editSelection.newName}
                    onChange={handleEditChange}
                    placeholder={`Rename ${editSelection.currentName}`}
                  />
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleEditSubmit}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save edit"}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setEditSelection(null)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            </section>
          </div>
        )}
      </Authenticator>
    </div>
  );
};

export default AdminDashboard;
