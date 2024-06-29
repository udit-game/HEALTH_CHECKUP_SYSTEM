import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './ChatBox.css';
import {useNavigate} from "react-router-dom";
import TypingCircle from "./texttyping"; // Import CSS file

const ChatBox = () => {
    const [userMessage, setUserMessage] = useState('');
    const [userMessages, setUserMessages] = useState([]);
    const [serverResponses, setServerResponses] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setUserMessage(e.target.value);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setUserMessage('');
            setUserMessages([...userMessages, userMessage]); // Store user message
            let reply1;
            const response = await axios.post('http://localhost:8000/ask-question', {user_question: userMessage}, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            reply1 = response.data.Reply;

            setServerResponses([...serverResponses, reply1]); // Store server response
            setUserMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };


    // Merge user messages and server responses into a single array
    const mergedMessages = [];
    for (let i = 0; i < Math.max(userMessages.length, serverResponses.length); i++) {
        if (userMessages[i]) {
            mergedMessages.push({type: 'user', content: userMessages[i], key: `user-${i}`});
        }
        if (serverResponses[i]) {
            mergedMessages.push({type: 'server', content: serverResponses[i], key: `server-${i}`});
        }
    }

    function smoothScrollToBottom(container) {
        const scrollHeight = container.scrollHeight;
        const containerHeight = container.clientHeight;
        const containerScrollMax = scrollHeight - containerHeight;
        container.style.overflow = 'hidden';
        const step = 1; // Adjust the step size for smoothness

        let scrollTop = container.scrollTop;
        let scrollInterval;

        // Check if the mouse enters or leaves the container
        let mouseOverContainer = false;

        function stepScroll() {
            // Check if the mouse is over the container
            if (!mouseOverContainer) {
                scrollTop += step;
                if (scrollTop >= containerScrollMax) {
                    clearInterval(scrollInterval);
                    container.scrollTop = containerScrollMax;
                } else {
                    container.scrollTop = scrollTop;
                }
            }
        }

        scrollInterval = setInterval(stepScroll, 10); // Adjust the interval for smoothness
    }

    let keeptyping = true;
    useEffect(() => {
        let size = document.querySelectorAll('.typewriter').length
        const lastTypewriterElement = document.querySelectorAll('.typewriter')[size - 1];

        if (lastTypewriterElement) {
            let complete_message = lastTypewriterElement.innerText;
            lastTypewriterElement.innerText = '';
            const words = complete_message.split(' '); // Split the text into words
            let wordIndex = 0;
            const container = lastTypewriterElement.parentNode.parentNode.parentNode.parentNode; // Get the container element

            function typeWriter() {
                if (wordIndex < words.length && keeptyping) {
                    const word = words[wordIndex];
                    let charIndex = 0;
                    const interval = setInterval(() => {
                        if (charIndex < word.length) {
                            if (word[charIndex] === ' ') {
                                lastTypewriterElement.innerHTML += '\u00A0'; // Append non-breaking space for space character
                            } else {
                                lastTypewriterElement.innerHTML += word[charIndex]; // Append the character
                            }
                            charIndex++;
                        } else {
                            lastTypewriterElement.innerHTML += '\u00A0'; // Add space after each word
                            clearInterval(interval);
                            wordIndex++;
                            setTimeout(typeWriter, 25); // Move to the next word after a delay
                        }
                        smoothScrollToBottom(container);
                    }, 50); // Adjust the typing speed as needed
                } else {
                    lastTypewriterElement.innerText = complete_message;
                    container.style.overflow = '';
                }
            }


            // Start the typing animation
            typeWriter();
        }
    }, [serverResponses]);


    document.addEventListener('keydown', function (event) {
        // Check if the pressed key is the Enter key
        if (event.keyCode === 13) {
            // Call the function to complete the message
            keeptyping = false;
        }
    });


    return (
        <>
            <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v6.2.1/css/all.css"
                  crossOrigin="anonymous" referrerPolicy="no-referrer"/>
            <img id="backgroundimg" src="https://androsysinc.com/wp-content/uploads/2020/12/AIPS-News-1080x675.jpg"
                 alt="Background"/>
            <div className="main">
                <div className="header">
                    <i style={{cursor: 'pointer', display: 'flex', float: 'right'}} className="fas fa-arrow-left"/>
                    <div className="center">
                        <div>
                            <img className="pfp"
                                 src="https://cdn.pixabay.com/photo/2014/11/30/14/11/cat-551554_960_720.jpg"
                                 alt="Profile"/>
                            <p id="pfpname">Ask Questions</p>
                        </div>
                    </div>
                </div>

                <div id="chat-content" className="content">
                    {/* Display messages */}
                    {mergedMessages.map(({type, content, key}, index) => (
                        <div key={key} style={{padding: '11px'}}>
                            {/* Display user message */}
                            {type === 'user' && (
                                <div className="msg-btn-holder">
                                    <div className="sender-msg msg-btn">
                                        <p>{content}</p>
                                    </div>
                                </div>
                            )}

                            {/* Display server response */}
                            {loading && index === mergedMessages.length - 1 ? (
                                <TypingCircle/>
                            ) : (
                                type === 'server' && (
                                    <div className="msg-btn-holder">
                                        <div className="receiver-msg msg-btn">
                                            <p id={`typewriter-text-${key}`} className="typewriter">{content}</p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>


                <div className="footer">
                    <div style={{width: '100%', padding: '11px'}}>
                        <input
                            placeholder="Message"
                            className="text-box"
                            name="message"
                            value={userMessage}
                            onChange={handleChange}
                        />
                        <div className="send-ico" onClick={handleSubmit}>
                            <i style={{position: 'absolute', left: "8px"}} className="fas fa-paper-plane"/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChatBox;
