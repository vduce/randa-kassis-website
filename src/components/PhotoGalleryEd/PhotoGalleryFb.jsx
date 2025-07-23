import React from "react";
import FbImageLibrary from "react-fb-image-grid";

const PhotoGalleryFb = ({ photos }) => {
  const [images, setImages] = React.useState([]);

  React.useEffect(() => {
    if (photos && photos.length > 0) {
      const formattedImages = photos.map((photo) => photo.src);
      setImages(formattedImages);
    }
  }, [photos]);

  return (
    <div style={{ width: "400px", height: "570px" }}>
      <FbImageLibrary
        images={images}
        countFrom={5}
        hideOverlay={true}
        overlayBackgroundColor="#000000"
        // onClickEach={({ src, index }) => alert(`Clicked image ${index + 1}`)}
      />
    </div>
  );
};

export default PhotoGalleryFb;
