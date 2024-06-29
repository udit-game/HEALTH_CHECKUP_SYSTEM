import React from 'react';
import './DiagnosisInfo.css';
import {Link, useLocation, useNavigate} from "react-router-dom"; // Make sure to import the CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons'; // Make sure to import the icon you need


function DiagnosisInfo({result}) {

  const url = useLocation();
  const navigate = useNavigate();
  console.log(result);

  const size = '53px';

  return (
    <div className="infobody">
      <div className="dd_heading">
        <h2 className="text-center">Diagnosis Report</h2>
        <h3 className="text-center">Condition : <strong>{result["Findings Report"]}</strong></h3>
        {result["type"]=="report" ? (
            <section className="asksection">
              <button className="askbutton" onClick={function (){navigate(url.pathname+"/chatbox")}}>
                <FontAwesomeIcon icon={faComments} />
                <label className="asklabel">Ask Questions</label>
              </button>
            </section>
        ):(
           <div/>
        )}
      </div>
      <main className="page-content">
        <div className="d_card">
          <div className="DiagnosisInfo">
            <h2 className="heading">Detailed Analysis</h2>
            <p className="data-content">{result["Detailed Analysis"]}</p>
          </div>
        </div>
        <div className="d_card">
          <div className="DiagnosisInfo">
            <h2 className="heading">Recommendations and Next Steps</h2>
            <p className="data-content">{result["Recommendations and Next Steps"]}</p>
          </div>
        </div>
        <div className="d_card">
          <div className="DiagnosisInfo">
            <h2 className="heading">Treatment Suggestions</h2>
            <p className="data-content">{result["Treatment Suggestions"]}</p>
          </div>
        </div>
        <div className="d_card">
          <div className="DiagnosisInfo">
            <h2 className="heading">Disclaimer</h2>
            <p className="data-content">{result["Disclaimer"]}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DiagnosisInfo;
