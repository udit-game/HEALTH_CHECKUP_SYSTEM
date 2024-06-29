import React, {useEffect, useState} from 'react';
import ChatBox from "../components/chatBox";
import {useParams} from "react-router-dom";
import axios from "axios";
import './diagnosis.css';
import DiagnosisInfo from "../components/DiagnosisInfo";

const Diagnosis = () => {
    const {diagnosisId} = useParams();
    const [diagnosis, setdiagnosis] = useState(null);

    const fetchDiagnosisData = async () => {
        const response = await axios.post(
            `http://localhost:8080/diagnosis`,
            {id: diagnosisId},
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the JWT token in the Authorization header
                }
            }
        );
        setdiagnosis(response.data);
    }

    const [extractedContent, setExtractedContent] = useState({});

    // Function to extract content within double stars and store as key-value pairs
    const extractContentAsKeyValue = (text) => {
        const matches = {};

        // Check for previous format (with double stars)
        if (text.includes('**')) {
            const regex = /\*\*(.*?)\*\*([\s\S]*?)(?=\*\*|$)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const key = match[1]?.trim()?.replace(':', '').replace(/\*/g, '');
                let value = match[2]?.trim()?.replace(':', '').replace(/\*/g, '');
                if (value === 'N/A') {
                    value = `No ${key} are necessary at this time.`;
                }
                if (key && value) {
                    matches[key] = value;
                }
            }
        }

        // Check for new format (with colons)
        if (text.includes(':')) {
            const sections = text.split('\n\n');
            sections.forEach(section => {
                const [key, ...value] = section.split(':');
                const keyValue = key.trim().replace(/\*/g, '');
                let sectionContent = value.join(':').trim().replace(/\*/g, '');
                if (sectionContent === 'N/A') {
                    sectionContent = `No ${keyValue} are necessary at this time.`;
                }
                if (keyValue && sectionContent) {
                    matches[keyValue] = sectionContent;
                }
            });
        }

        // Check if "Disclaimer" is empty and assign default value
        if (!matches["Disclaimer"]) {
            matches["Disclaimer"] = "This information is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your qualified healthcare provider with any questions you may have regarding a medical condition.";
        }


        return matches;
    };


    useEffect(() => {
        // Update the state with extracted content when diagnosis changes
        if (diagnosis) {
            const content = extractContentAsKeyValue(diagnosis.response.response);
            content["type"] = diagnosis.type;
            setExtractedContent(content);
        }
    }, [diagnosis]);


    useEffect(() => {
        console.log(diagnosisId);
        fetchDiagnosisData();
    }, []);


    return (
        <div className="diagnosis-container">
            {diagnosis ? (
                <div>
                    <DiagnosisInfo result={extractedContent} />
                </div>
            ) : (
                <h1>loading</h1>
            )}
            {/* Add your content and components here */}
        </div>

    );
};

export default Diagnosis;
