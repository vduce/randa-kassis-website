import React from 'react';
import './CategorySelector.css';

// Content categories configuration
const CONTENT_CATEGORIES = [
  {
    key: 'articles',
    label: 'Articles',
    path: 'public/articles',
    icon: '📰',
    description: 'Published articles and opinion pieces'
  },
  {
    key: 'encounters',
    label: 'Encounters & Dialogue',
    path: 'public/encounters',
    icon: '🤝',
    description: 'Encounter and dialogue events'
  },
  {
    key: 'interviews_politicians',
    label: 'Interviews - Politicians',
    path: 'public/interviews/politicians',
    icon: '🎤',
    description: 'Political interviews'
  },
  {
    key: 'interviews_painters',
    label: 'Interviews - Painters',
    path: 'public/interviews/painters',
    icon: '🎨',
    description: 'Artist interviews'
  },
  {
    key: 'interviews_critics',
    label: 'Interviews - Critics',
    path: 'public/interviews/essayistcritics',
    icon: '✍️',
    description: 'Essayist and critic interviews'
  },
  {
    key: 'story',
    label: 'My Story',
    path: 'public/story',
    icon: '📖',
    description: 'Personal story chapters'
  },
  {
    key: 'paintings',
    label: 'Paintings',
    path: 'public/paintings',
    icon: '🖼️',
    description: 'Painting descriptions and details'
  },
  {
    key: 'exhibitions',
    label: 'Exhibitions',
    path: 'public/exhibitions',
    icon: '🏛️',
    description: 'Exhibition moments and events'
  },
  {
    key: 'throughMyEyes',
    label: 'Through My Eyes',
    path: 'public/gallery/myeyes',
    icon: '👁️',
    description: 'Personal photography and observations'
  }
];

const CategorySelector = ({ selectedCategory, onSelectCategory }) => {
  const handleCategoryClick = (category) => {
    onSelectCategory(category);
  };

  return (
    <div className="category-selector">
      <nav className="category-list">
        {CONTENT_CATEGORIES.map((category) => (
          <button
            key={category.key}
            className={`category-item ${
              selectedCategory?.key === category.key ? 'active' : ''
            }`}
            onClick={() => handleCategoryClick(category)}
            title={category.description}
          >
            <span className="category-icon">{category.icon}</span>
            <div className="category-info">
              <span className="category-label">{category.label}</span>
              <span className="category-count">0 files</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CategorySelector;
export { CONTENT_CATEGORIES };
