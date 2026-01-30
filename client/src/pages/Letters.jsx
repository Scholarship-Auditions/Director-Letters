import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import "../styles/Letters.css";

const client = generateClient();

const Letters = ({ title, categoryFilter }) => {
  const [letters, setLetters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // When categoryFilter prop changes (e.g., navigating to a specific category page)
  useEffect(() => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    } else {
      setSelectedCategory("");
    }
  }, [categoryFilter]);

  const fetchData = async () => {
    try {
      const { data: catData } = await client.models.LetterCategory.list();
      setCategories(catData);

      const { data: letterData } = await client.models.Letter.list();
      setLetters(letterData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLetters = letters.filter((letter) => {
    const query = searchQuery.toLowerCase();
    const t = letter.title ? letter.title.toLowerCase() : "";
    const w = letter.writerName ? letter.writerName.toLowerCase() : "";
    const matchesSearch = t.includes(query) || w.includes(query);

    // Match by category name or ID
    const matchesCategory = selectedCategory
      ? letter.categoryName === selectedCategory || letter.categoryId === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="letters-page">
        <section className="letters-hero">
          <h1 className="letters-hero-title">{title}</h1>
        </section>
        <div className="letters-content">
          <div className="letters-loading">Loading letters...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="letters-page">
      {/* Hero Section */}
      <section className="letters-hero">
        <h1 className="letters-hero-title">{title}</h1>
        <p className="letters-hero-subtitle">
          Browse our collection of director letters
        </p>
      </section>

      {/* Main Content */}
      <div className="letters-content">
        {/* Search and Filter Bar */}
        <div className="letters-filters">
          <div className="letters-search">
            <input
              type="text"
              placeholder="Search by title or writer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!categoryFilter && (
            <div className="letters-category-filter">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results Count */}
        <p className="letters-count">
          {filteredLetters.length} letter{filteredLetters.length !== 1 ? "s" : ""} found
        </p>

        {/* Letters Grid */}
        {filteredLetters.length > 0 ? (
          <div className="letters-grid">
            {filteredLetters.map((letter) => (
              <article key={letter.id} className="letter-card">
                <span className="letter-card-category">
                  {letter.categoryName}
                </span>
                <h3 className="letter-card-title">{letter.title}</h3>
                <div className="letter-card-meta">
                  <span>By: {letter.writerName}</span>
                  <span>To: {letter.recipientName}</span>
                </div>
                <div className="letter-card-actions">
                  <Link to={`/letter/${letter.id}`} className="letter-view-btn">
                    View Letter →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="letters-empty">
            <h3>No letters found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Letters;
