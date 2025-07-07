import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const VideoModal = ({ props }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <React.Fragment>
      <Dialog
        open={isOpen}
        onClose={() => setOpen(false)}
        maxWidth={false}
        PaperProps={{
          style: {
            width: 820,
            height: 461,
            overflow: "hidden",
            position: "relative",
          },
        }}
      >
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            zIndex: 2,
            color: "#fff",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <CloseIcon />
        </IconButton>
        <div style={{ width: "100%", height: "100%" }}>
          <div
            style={{ position: "relative", paddingTop: "56.25%", width: "100%", height: "100%" }}
          >
            <iframe
              src={`https://iframe.mediadelivery.net/embed/451826/${props}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
              loading="lazy"
              style={{
                border: 0,
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
              }}
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
              title="video"
            ></iframe>
          </div>
        </div>
      </Dialog>

      <div className="video-btn">
        <ul>
          <li>
            <button className="btn-wrap" onClick={() => setOpen(true)}>
              <i className="fi flaticon-play" aria-hidden="true"></i>
            </button>
          </li>
        </ul>
      </div>
    </React.Fragment>
  );
};

export default VideoModal;
