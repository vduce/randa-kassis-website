import PropTypes from "prop-types";

const PhotoGrid = ({ photos }) => {
  const visiblePhotos = photos.map((photo) => photo.src).slice(0, 5);
  const extraCount = photos.length - 5;
  const size = photos.length;

  return (
    <div className="photo-grid" style={{ width: size, height: size }}>
      {visiblePhotos.map((src, i) => (
        <div key={i} className={`grid-item grid-item-${visiblePhotos.length}`}>
          <img src={src} alt={`photo-${i}`} loading="lazy" />
          {i === 4 && extraCount > 0 && <span className="overlay">+{extraCount}</span>}
        </div>
      ))}
    </div>
  );
};

PhotoGrid.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default PhotoGrid;
