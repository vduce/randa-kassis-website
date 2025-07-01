import React from "react";

const FunFactVideo = (props) => {
  const isMobile = window.innerWidth <= 768;
  return (
    <div className="funfact-video mt-0">
      <div
        style={{
          position: "relative",
          height: isMobile ? "300px" : "750px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <iframe
          src="https://iframe.mediadelivery.net/embed/460223/98a68de4-921a-49ab-8125-102b936a9714?autoplay=false&loop=false&muted=false&preload=true&responsive=true"
          loading="lazy"
          style={{ top: 0, left: 0, width: "100%", height: "100%" }}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
          allowfullscreen="true"
        ></iframe>
      </div>
    </div>
  );
};

export default FunFactVideo;
