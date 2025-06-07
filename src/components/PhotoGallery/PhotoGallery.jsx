import React, { useEffect, useRef, useState } from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import './PhotoGallery.css';

const PhotoGallery = ({ photos }) => {
  const maxDisplayPhotos = 5;
  const extraPhotosCount = photos.length > maxDisplayPhotos ? photos.length - maxDisplayPhotos + 1 : 0;
  const lightGalleryRef = useRef(null);
  const [currentPageImages, setCurrentPageImages] = useState([]);

  // Prepare currentPageImages when photos change
  useEffect(() => {
    const images = photos.map((photo) => ({
      src: photo.src,
      thumb: photo.src,
      subHtml: photo.alt || '',
    }));
    setCurrentPageImages(images);
  }, [photos]);

  // Ensure lightGallery reinitializes when currentPageImages change
  useEffect(() => {
    if (lightGalleryRef.current) {
      lightGalleryRef.current.refresh();
    }
  }, [currentPageImages]);

  // Don't render if there are no photos
  if (!photos || photos.length === 0) {
    return null;
  }

  const openGallery = (index) => {
    if (lightGalleryRef.current) {
      lightGalleryRef.current.openGallery(index);
    }
  };

  const renderGallery = () => {
    const photoCount = Math.min(photos.length, maxDisplayPhotos);

    // 1 Photo: Full width
    if (photoCount === 1) {
      return (
        <div className="gallery-grid-single">
          <div className="gallery-item" onClick={() => openGallery(0)}>
            <img
              src={photos[0].src}
              alt={photos[0].alt || `Gallery image 1`}
              className="gallery-image"
            />
          </div>
        </div>
      );
    }

    // 2 Photos: Side by side
    if (photoCount === 2) {
      return (
        <div className="gallery-grid">
          {photos.slice(0, 2).map((photo, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => openGallery(index)}
            >
              <img
                src={photo.src}
                alt={photo.alt || `Gallery image ${index + 1}`}
                className="gallery-image"
              />
            </div>
          ))}
        </div>
      );
    }

    // 3 Photos: Two on top, one on bottom
    if (photoCount === 3) {
      return (
        <div className="gallery-grid-three-photos">
          <div className="gallery-top-row">
            {photos.slice(0, 2).map((photo, index) => (
              <div
                key={index}
                className="gallery-item"
                onClick={() => openGallery(index)}
              >
                <img
                  src={photo.src}
                  alt={photo.alt || `Gallery image ${index + 1}`}
                  className="gallery-image"
                />
              </div>
            ))}
          </div>
          <div className="gallery-bottom-row">
            <div
              className="gallery-item"
              onClick={() => openGallery(2)}
            >
              <img
                src={photos[2].src}
                alt={photos[2].alt || `Gallery image 3`}
                className="gallery-image"
              />
            </div>
          </div>
        </div>
      );
    }

    // 4 Photos: 2x2 grid
    if (photoCount === 4) {
      return (
        <div className="gallery-grid">
          {photos.slice(0, 4).map((photo, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => openGallery(index)}
            >
              <img
                src={photo.src}
                alt={photo.alt || `Gallery image ${index + 1}`}
                className="gallery-image"
              />
            </div>
          ))}
        </div>
      );
    }

    // 5 or more Photos: 3 on top, 2 on bottom
    return (
      <div className="gallery-grid-five-plus-photos">
        <div className="gallery-top-row">
          {photos.slice(0, 3).map((photo, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => openGallery(index)}
            >
              <img
                src={photo.src}
                alt={photo.alt || `Gallery image ${index + 1}`}
                className="gallery-image"
              />
            </div>
          ))}
        </div>
        <div className="gallery-bottom-row">
          {photos.slice(3, 5).map((photo, index) => (
            <div
              key={index + 3}
              className="gallery-item"
              onClick={() => openGallery(index + 3)}
            >
              <img
                src={photo.src}
                alt={photo.alt || `Gallery image ${index + 4}`}
                className="gallery-image"
              />
              {index === 1 && extraPhotosCount > 0 && (
                <div className="overlay">
                  +{extraPhotosCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="gallery-container">
      {renderGallery()}
      <LightGallery
        dynamic
        dynamicEl={currentPageImages}
        onInit={(detail) => {
          lightGalleryRef.current = detail.instance;
        }}
        licenseKey="YOUR_LICENSE_KEY_HERE"
        plugins={[lgZoom, lgThumbnail]}
        mode="lg-fade"
        speed={500}
        zoom={true}
        settings={{
          closable: true,
          backdropDuration: 300,
        }}
      />
    </div>
  );
};

export default PhotoGallery;