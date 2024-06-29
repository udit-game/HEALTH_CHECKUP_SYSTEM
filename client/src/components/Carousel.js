import React, { useState, useEffect } from 'react';
import './Carousel.css'
import reportimg from '../images/reportimg.png';
import askquestions from '../images/askquestions.png';
import remedies from '../images/remedies.png';
import livewell from '../images/livewell.png';

const Carousel = () => {
  const [currentImage, setCurrentImage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % 5);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: '600px',
      height: '600px',
      overflow: 'hidden',
      position: 'absolute',
      left: "64%",
      top: "25%"
    }}>
      <img
          src={reportimg}
        alt="Image 1"
        style={{
          position: 'absolute',
          top: '0',
          left: `${(1 - currentImage) * 100}%`,
          width: '50%',
          height: '50%',
         transition: 'left 1s, opacity 1s', // Added opacity transition
            opacity: 1 === currentImage ? 1 : 0, // Hide non-current images
        }}
      />
      <img
          src={askquestions}
        alt="Image 2"
        style={{
          position: 'absolute',
          top: '0',
            left: `${(2 - currentImage) * 100}%`,
          width: '50%',
          height: '50%',
          transition: 'left 1s, opacity 1s', // Added opacity transition
            opacity: 2 === currentImage ? 1 : 0, // Hide non-current images
        }}
      />
      <img
          src={remedies}
        alt="Image 3"
        style={{
          position: 'absolute',
          top: '0',
            left: `${(3 - currentImage) * 100}%`,
          width: '50%',
          height: '50%',
          transition: 'left 1s, opacity 1s', // Added opacity transition
          opacity: 3 === currentImage ? 1 : 0, // Hide non-current images
        }}
      />
      <img
          src={livewell}
        alt="Image 4"
        style={{
          position: 'absolute',
          top: '0',
            left: `${(4 - currentImage) * 100}%`,
          width: '50%',
          height: '50%',
          transition: 'left 1s, opacity 0.0001s', // Added opacity transition
            opacity: 4 === currentImage ? 1 : 0, // Hide non-current images
        }}
      />
    </div>
  );
};

export default Carousel;
