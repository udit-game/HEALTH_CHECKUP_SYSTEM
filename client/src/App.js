import './App.css';
import Login from "./pages/login";
import {Route, BrowserRouter as Router, Routes, Navigate} from "react-router-dom";
import Navbar from "./components/navbar";
import Signup from "./pages/signup";
import LandingPage from "./pages/landing";
import {useAuth} from "./Context/Context";
import health from "./images/health.png";
import OptionsPage from "./pages/options";
import {useEffect} from "react";
import Diagnosis from "./pages/diagnosis";
import Records from "./pages/Records";
import ChatBox from "./components/chatBox";


function App() {
    const {checktoken, isAuthenticated} = useAuth();

    async function setup() {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
        // Assuming checktoken is a function to verify the token
        await checktoken(currentToken);
    }
}

useEffect(() => {
    // Define an asynchronous function inside useEffect and immediately invoke it
    (async () => {
        await setup();
    })();
}, []);



    return (
        <Router>
            <div className="App">
                <img className="plusSign" src={health}/>
                <Navbar/>
                <Routes>
                    <Route exact path="/" element={isAuthenticated ? <LandingPage/> : <Navigate push to="/login" />}/>
                    <Route exact path="/login" element={isAuthenticated ? <Navigate push to="/" /> : <Login/>}/>
                    <Route exact path="/signup" element={isAuthenticated ? <Navigate push to="/" /> : <Signup/>}/>
                    <Route exact path="/options" element={isAuthenticated ? <OptionsPage/>: <Navigate push to="/login" />}/>
                    <Route exact path="/records" element={isAuthenticated ? <Records/>: <Navigate push to="/login" />}/>
                    <Route exact path="/diagnosis" element={<Diagnosis />}/>
                    <Route exact path="/records/:diagnosisId" element={<Diagnosis />}/>
                    <Route exact path="/records/:diagnosisId/chatbox" element={<ChatBox />}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
