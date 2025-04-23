// Custom component for side-by-side images
const SideBySideImages = ({ src1, alt1, title1, src2, alt2, title2 }) => {
    return (
      <div className="grid grid-cols-2 gap-6 my-6">
        <div className="flex flex-col items-center">
          <img
            src={`/photos/${src1}`}
            alt={alt1}
            style={{ width: "300px", height: "350px"}}
            className="w-full h-auto rounded-md shadow-lg"
          />
          {title1 && (
            <p className="text-center text-base text-gray-700 italic mt-3">
              {title1}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center">
          <img
            src={`/photos/${src2}`}
            alt={alt2}
            style={{ width: "300px", height: "350px"}}
            className="w-full h-auto rounded-md shadow-lg"
          />
          {title2 && (
            <p className="text-center text-base text-gray-700 italic mt-3">
              {title2}
            </p>
          )}
        </div>
      </div>
    );
  };
  
  export default SideBySideImages;