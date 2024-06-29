import React, {useEffect, useState} from 'react';
import './Records.css';
import {Link} from "react-router-dom";
import {useAuth} from "../Context/Context";
import axios from "axios";
import pdfimg from '../images/pdfimage.png';

const RecordsPage = () => {

    const {user, checktoken} = useAuth();

    const [diagnosisList, setDiagnosisList] = useState([]);


    const fetchDiagnosisData = async () => {
        try {
            // Map through the user's diagnosis IDs and fetch diagnosis data for each
            const fetchedData = await Promise.all(
                user.diagnosisIds.map(async (diagnosisId) => {
                    try {
                        // Make a POST request to fetch diagnosis data for the current diagnosis ID
                        const response = await axios.post(
                            `http://localhost:8080/diagnosis`,
                            {id: diagnosisId},
                            {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the JWT token in the Authorization header
                                }
                            }
                        );
                        // Return the fetched diagnosis data
                        return response.data;
                    } catch (error) {
                        // If a 404 error occurs, log it and continue to the next iteration
                        if (error.response && error.response.status === 404) {
                            console.error(`Diagnosis ${diagnosisId} not found`);
                            return null; // Return null to indicate that the diagnosis was not found
                        } else {
                            // For other errors, re-throw the error
                            throw error;
                        }
                    }
                })
            );

            // Filter out null values (diagnoses not found) from fetchedData
            const filteredData = fetchedData.filter(data => data !== null);

            // Update diagnosisList with the fetched data
            setDiagnosisList(filteredData);
        } catch (error) {
            // Log any errors to the console
            console.error('Error fetching diagnosis data:', error);
        }
    };


    const deleterecord = async (id) => {
        try {
            // Make a DELETE request to the server endpoint with the provided ID
            const response = await axios.delete(`http://localhost:8080/diagnosis/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the JWT token in the Authorization header
                }
            });

            // Check if the request was successful
            if (response.status === 200) {
                console.log('Diagnosis deleted successfully', id);
                checktoken(localStorage.getItem("token"));
            } else {
                // Handle unexpected response status codes
                console.error('Unexpected status:', response.status);
            }
        } catch (error) {
            // Log any errors to the console
            console.error('Error deleting diagnosis data:', error);
            // Optionally, you can rethrow the error to handle it further up the call stack
            throw error;
        }
    };
    const handleDelete = async (id, event) => {
        event.preventDefault();
        try {
            // Call the deleterecord function when the link is clicked
            await deleterecord(id);
            // Optionally, you can perform any additional actions after deletion, such as updating state or displaying a message
            console.log('Diagnosis deleted successfully');
        } catch (error) {
            // Handle errors if necessary
            console.error('Error deleting diagnosis:', error);
        }
    };


    useEffect(() => {
        fetchDiagnosisData();
    }, [user]);


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


    return (
        <section className="records-page projects section" id="projects" style={{
            background: "linear-gradient(120deg, #CDEBFF, #D3EAD2)"
        }}>
            <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet"/>

            <h2 className="section__title-1">
                <span>Health Records.</span>
            </h2>

            <div className="projects__container container grid" style={{
                paddingLeft: "8%",
            }}>
                {diagnosisList.map((diagnosis, index) => (
                    <article key={index} className="projects__card">
                        <div className="projects__image">
                            {diagnosis.type === 'report' ? (
                                <img src={pdfimg} alt="PDF" className="projects__img" style={{
                                    width: "100%",
                                    height: "200px",
                                }}/>
                            ) : (
                                <img src={`data:image/png;base64,${diagnosis.base64String}`} alt="image"
                                     className="projects__img" style={{
                                    width: "100%",
                                    height: "200px",
                                }}/>
                            )}

                            <Link to={`/records/${diagnosis._id}`} className="projects__button button">
                                <i className="ri-arrow-right-up-line"/>
                            </Link>
                        </div>

                        <div className="projects__content">
                            <h3 className="projects__subtitle">{diagnosis.type}</h3>
                            <h2 className="projects__title">{diagnosis.response.response ? `${extractContentAsKeyValue(diagnosis.response.response)["Findings Report"]}` : ""}</h2>

                            <p className="projects__description">
                                {diagnosis.response.response ? `${extractContentAsKeyValue(diagnosis.response.response)["Detailed Analysis"]}... ` : ``}
                            </p>
                        </div>

                        <div className="projects__buttons">
                            <Link to={`/records/${diagnosis._id}`} target="_blank" className="projects__link">
                                <i className="ri-dribbble-line"/> View
                            </Link>
                            <a
                                href="#"
                                className="projects__link"
                                onClick={(event) => handleDelete(diagnosis._id, event)} // Call handleDelete when the link is clicked
                            >
                                <i className="ri-dribbble-line"/> Delete
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default RecordsPage;
