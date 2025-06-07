import React, { useEffect, useRef, useState } from 'react';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import './PhotoGalleryEd.css';

const PhotoGalleryEd = ({ photos }) => {
  const maxDisplayPhotos = 5;
  const extraPhotosCount = photos.length > maxDisplayPhotos ? photos.length - maxDisplayPhotos + 1 : 0;
  const lightGalleryRef = useRef(null);
  const [currentPageImages, setCurrentPageImages] = useState([]);
  const photoCount = Math.min(photos.length, maxDisplayPhotos);

  useEffect(() => {
    const images = photos.map((photo) => ({
      src: photo.src,
      thumb: photo.src,
      subHtml: photo.alt || photo.caption || '',
    }));
    setCurrentPageImages(images);
  }, [photos]);

  useEffect(() => {
    if (lightGalleryRef.current) {
      lightGalleryRef.current.refresh();
    }
  }, [currentPageImages]);

  if (!photos || photos.length === 0) {
    return null;
  }

  const openGallery = (index) => {
    if (lightGalleryRef.current) {
      lightGalleryRef.current.openGallery(index);
    }
  };

  const renderGallery = () => {
    if (photoCount === 1) {
      return (
        <div className="gallery-ed-grid-single">
          <div className="gallery-ed-item" onClick={() => openGallery(0)}>
            <img
              src={photos[0].src}
              alt={photos[0].alt || `Gallery image 1`}
              className="gallery-ed-image"
            />
            {photos[0].caption && <span className="caption">{photos[0].caption}</span>}
          </div>
        </div>
      );
    }

    if (photoCount === 2) {
      return (
        <div className="gallery-ed-grid">
          {photos.slice(0, 2).map((photo, index) => (
            <div
              key={index}
              className="gallery-ed-item"
              onClick={() => openGallery(index)}
            >
              <img
                src={photo.src}
                alt={photo.alt || `Gallery image ${index + 1}`}
                className="gallery-ed-image"
              />
              {photo.caption && <span className="caption">{photo.caption}</span>}
            </div>
          ))}
        </div>
      );
    }

    if (photoCount === 3) {
      return (
        <div className="gallery-ed-grid-three-photos">
          <div className="gallery-ed-top-row">
            {photos.slice(0, 2).map((photo, index) => (
              <div
                key={index}
                className="gallery-ed-item"
                onClick={() => openGallery(index)}
              >
                <img
                  src={photo.src}
                  alt={photo.alt || `Gallery image ${index + 1}`}
                  className="gallery-ed-image"
                />
                {photo.caption && <span className="caption">{photo.caption}</span>}
              </div>
            ))}
          </div>
          <div className="gallery-ed-bottom-row">
            <div
              className="gallery-ed-item"
              onClick={() => openGallery(2)}
            >
              <img
                src={photos[2].src}
                alt={photos[2].alt || `Gallery image 3`}
                className="gallery-ed-image"
              />
              {photos[2].caption && <span className="caption">{photos[2].caption}</span>}
            </div>
          </div>
        </div>
      );
    }

    if (photoCount === 4) {
      return (
        <div className="gallery-ed-grid">
          {photos.slice(0, 4).map((photo, index) => (
            <div
              key={index}
              className="gallery-ed-item"
              onClick={() => openGallery(index)}
            >
              <img
                src={photo.src}
                alt={photo.alt || `Gallery image ${index + 1}`}
                className="gallery-ed-image"
              />
              {photo.caption && <span className="caption">{photo.caption}</span>}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="gallery-ed-grid-five-plus-photos">
        <div className="gallery-ed-top-row">
          {photos.slice(0, 3).map((photo, index) => (
            <div
              key={index}
              className="gallery-ed-item"
              onClick={() => openGallery(index)}
            >
              <img
                src={photo.src}
                alt={photo.alt || `Gallery image ${index + 1}`}
                className="gallery-ed-image"
              />
              {photo.caption && <span className="caption">{photo.caption}</span>}
            </div>
          ))}
        </div>
        <div className="gallery-ed-bottom-row">
          {photos.slice(3, 5).map((photo, index) => (
            <div
              key={index + 3}
              className="gallery-ed-item"
              onClick={() => openGallery(index + 3)}
            >
              <img
                src={photo.src}
                alt={photo.alt || `Gallery image ${index + 4}`}
                className="gallery-ed-image"
              />
              {photo.caption && <span className="caption">{photo.caption}</span>}
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
    <div className={`gallery-ed-container ${photoCount === 1 || photoCount === 2 ? 'gallery-ed-container-single-row' : 'gallery-ed-container-two-rows'}`}>
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

export default PhotoGalleryEd;