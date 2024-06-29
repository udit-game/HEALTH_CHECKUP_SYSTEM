import React, {useEffect, useState, useRef} from 'react';
import './options.css'; // Import CSS file for styling
import docter from '../images/docter.png';
import xray from '../images/xray.png';
import injury from '../images/injury.png';
import healthReport from '../images/healthReport.png';
import mri from '../images/mri.png'
import UploadButton from "../components/uploadButton'";


const OptionsPage = () => {
  const uploadRef = useRef(null);
  const [isUploadOpen, setIsUploadOpen] = useState("none");

  const openUpload = (type) => {
    setIsUploadOpen(type);
  };

  const closeUpload = () => {
    setIsUploadOpen("none");
  };

   useEffect(() => {
    function handleClickOutside(event) {
      if (uploadRef.current && !uploadRef.current.contains(event.target)) {
        closeUpload();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="options-container">
      <div className="image-container">
        <img src={docter} alt="Help" width="250px" />
        <h2>What do you want help with?</h2>
      </div>
      <div className="options">
        <div className="option-box one">
            {isUploadOpen==="injury" && (
        <div className="upload-overlay">
          <div className="blur-background" />
          <div ref={uploadRef} className="upload-container">
            <UploadButton fileType="jpeg" purpose={"injury"} onClose={closeUpload} />
              <p>Upload Image of Injury or abnormal part in jpeg format</p>
          </div>
        </div>
      )}
            <h2>Injury</h2>
            <img src={injury} width="120%"/>
            <div className="details-window up" onClick={() => openUpload("injury")}>
              <p>Upload Image of Injury or abnormal part in jpeg format</p>
            </div>
        </div>
        <div className="option-box one">
            {isUploadOpen==="report" && (
        <div className="upload-overlay">
          <div className="blur-background" />
          <div ref={uploadRef} className="upload-container">
            <UploadButton fileType="pdf" purpose={"report"} onClose={closeUpload} />
              <p>Upload File of Health Report in Pdf format</p>
          </div>
        </div>
      )}
            <h2>Health Report</h2>
            <img src={healthReport} width="300px" style={{
                bottom: "5px",
                left: "-20px"
            }}/>
            <div className="details-window up" onClick={() => openUpload("report")}>
              <p>Upload File of Health Report in Pdf format</p>
            </div>
        </div>
        <div className="option-box one">
            {isUploadOpen==="xray" && (
        <div className="upload-overlay">
          <div className="blur-background" />
          <div ref={uploadRef} className="upload-container">
            <UploadButton fileType="jpeg" purpose={"xray"} onClose={closeUpload} />
              <p>Upload Image of Xray in jpeg format</p>
          </div>
        </div>
      )}
            <h2>XRAY</h2>
            <img src={xray}/>
            <div className="details-window up" onClick={() => openUpload("xray")}>
              <p>Upload Image of Xray in jpeg format</p>
            </div>
        </div>
          <div className="option-box one">
            {isUploadOpen==="mri" && (
        <div className="upload-overlay">
          <div className="blur-background" />
          <div ref={uploadRef} className="upload-container">
            <UploadButton fileType="jpeg" purpose={"mri"} onClose={closeUpload} />
              <p>Upload Image of Brain MRI in jpeg format</p>
          </div>
        </div>
      )}
            <h2>Brain MRI</h2>
            <img src={mri} width="250px" height="210px" style={{
                bottom: "5px",
                left: "0px"
            }}/>
            <div className="details-window up" onClick={() => openUpload("mri")}>
              <p>Upload Image of Brain MRI in jpeg format</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default OptionsPage;
