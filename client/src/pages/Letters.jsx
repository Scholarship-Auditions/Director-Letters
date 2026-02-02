import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { generateClient } from "aws-amplify/data";
import "../styles/Letters.css";

const client = generateClient();
const LETTERS_PER_PAGE = 12; // Number of letters per page

const Letters = ({ title, categoryFilter }) => {
  const [letters, setLetters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || "");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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
    // Reset to page 1 when category changes
    setCurrentPage(1);
  }, [categoryFilter]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredLetters.length / LETTERS_PER_PAGE);
  const startIndex = (currentPage - 1) * LETTERS_PER_PAGE;
  const endIndex = startIndex + LETTERS_PER_PAGE;
  const currentLetters = filteredLetters.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of letters grid
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredLetters.length)} of {filteredLetters.length} letter{filteredLetters.length !== 1 ? "s" : ""}
        </p>

        {/* Letters Grid */}
        {currentLetters.length > 0 ? (
          <>
            <div className="letters-grid">
              {currentLetters.map((letter) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="letters-pagination">
                <button
                  className="pagination-btn pagination-prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className="pagination-numbers">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                    ) : (
                      <button
                        key={page}
                        className={`pagination-btn pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  className="pagination-btn pagination-next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
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
