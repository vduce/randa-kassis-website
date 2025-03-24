import React from 'react'
import VideoModal from '../ModalVideo/VideoModal';
import fImg from '../../images/thumbnail.png'

const FunFactVideo = (props) => {
    return (
        <div className="funfact-video mt-0">
            <img src={fImg} alt="" />
            <VideoModal props={"chxkEqNnrok"} />

        </div>
    )
}

export default FunFactVideo;