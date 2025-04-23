const StyledVideo = ({ url }) => (
    <div
      className="youtube-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "600px",
        minHeight: "200px",
        borderRadius: "15px",
        overflow: "hidden",
        transition: "transform 0.3s, box-shadow 0.3s",
      }}
    >
      <iframe
        src={url}
        title="A rebel at heart: My Story"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: "100%",
          height: "50vh",
          borderRadius: "12px",
          transition: "all 0.3s ease-in-out",
        }}
      />
    </div>
  );

  export default StyledVideo;