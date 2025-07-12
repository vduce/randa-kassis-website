import React, { useEffect, useRef, useState } from "react";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import "./PhotoGallery.css";

const PhotoGallery = ({ photos }) => {
  const lightGalleryRef = useRef(null);
  const [currentPageImages, setCurrentPageImages] = useState([]);

  useEffect(() => {
    const images = photos.map((photo) => ({
      src: photo.src,
      thumb: photo.src,
      subHtml: photo.alt || photo.caption || "",
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
    // render 2 pics in each row
    return (
      <div className="gallery-grid">
        {currentPageImages.map((photo, index) => (
          <div key={index} className="gallery-item" onClick={() => openGallery(index)}>
            <img
              src={photo.src}
              alt={photo.alt || `Gallery image ${index + 1}`}
              className="gallery-image"
            />
            {photo.subHtml && <span className="caption">{photo.subHtml}</span>}
          </div>
        ))}
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
