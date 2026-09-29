import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCachedFileList, loadCachedFileList } from "../../services/adminFileCache";
import "./CategorySelector.css";

// Content categories configuration
const CONTENT_CATEGORIES = [
  {
    key: "articles",
    label: "Articles",
    path: "public/articles",
    icon: "📰",
    description: "Published articles and opinion pieces",
  },
  {
    key: "encounters",
    label: "Encounters & Dialogue",
    path: "public/encounters",
    icon: "🤝",
    description: "Encounter and dialogue events",
  },
  {
    key: "interviews_politicians",
    label: "Interviews - Politicians",
    path: "public/interviews/politicians",
    icon: "🎤",
    description: "Political interviews",
  },
  {
    key: "interviews_painters",
    label: "Interviews - Painters",
    path: "public/interviews/painters",
    icon: "🎨",
    description: "Artist interviews",
  },
  {
    key: "interviews_critics",
    label: "Interviews - Critics",
    path: "public/interviews/essayistcritics",
    icon: "✍️",
    description: "Essayist and critic interviews",
  },
  {
    key: "story",
    label: "My Story",
    path: "public/story",
    icon: "📖",
    description: "Personal story chapters",
  },
  {
    key: "paintings",
    label: "BPoli - Paintings",
    path: "public/paintings",
    icon: "🖼️",
    description: "Painting descriptions and details",
  },
  {
    key: "exhibitions",
    label: "BPoli - Exhibitions",
    path: "public/exhibitions",
    icon: "🏛️",
    description: "Exhibition moments and events",
  },
  {
    key: "throughMyEyes",
    label: "Through My Eyes",
    path: "public/gallery/myeyes",
    icon: "👁️",
    description: "Personal photography and observations",
  },
  {
    key: "companion",
    label: "My Four-Pawed Companions",
    path: "public/gallery/companion",
    icon: "🐾",
    description: "Pet companions gallery",
  },
  {
    key: "arena",
    label: "In the Arena",
    path: "public/gallery/arena",
    icon: "⚔️",
    description: "In the arena gallery",
  },
];

const CategorySelector = ({ selectedCategory, onSelectCategory, refreshTrigger }) => {
  const [fileCounts, setFileCounts] = useState(() => CONTENT_CATEGORIES.reduce((counts, category) => {
    const cached = getCachedFileList(category.path);
    if (cached?.success) counts[category.key] = cached.data.count;
    return counts;
  }, {}));

  // Fetch file counts for all categories
  useEffect(() => {
    const fetchFileCounts = async () => {
      await Promise.all(
        CONTENT_CATEGORIES.map(async (category) => {
          try {
            const result = await loadCachedFileList(category.path);
            if (result.success) {
              setFileCounts(previous => ({ ...previous, [category.key]: result.data.count }));
            }
          } catch (error) {
            console.error(`Error fetching count for ${category.key}:`, error);
          }
        }),
      );
    };

    fetchFileCounts();
  }, [refreshTrigger]);

  const handleCategoryClick = (category) => {
    onSelectCategory(category);
  };

  return (
    <div className="category-selector">
      <nav className="category-list">
        {CONTENT_CATEGORIES.map((category) => (
          <Link
            key={category.key}
            to={`/admin/dashboard?category=${category.key}`}
            className={`category-item ${
              selectedCategory?.key === category.key ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(category)}
            title={category.description}
          >
            <span className="category-icon">{category.icon}</span>
            <div className="category-info">
              <span className="category-label">{category.label}</span>
              <span className="category-count">
                {Number.isInteger(fileCounts[category.key])
                  ? `${fileCounts[category.key]} file${fileCounts[category.key] === 1 ? "" : "s"}`
                  : "… files"}
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default CategorySelector;
export { CONTENT_CATEGORIES };
