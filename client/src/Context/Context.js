// AuthContext.js
import React, {createContext, useState, useContext} from 'react';
import axios from "axios";
import path from "path";
const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [token, setToke] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace YOUR_ACCESS_TOKEN with your actual token
          },
    };

    const checktoken = async (t) => {
        try {
            const response = await axios.post('http://localhost:8080/verify-token', {token: t});
            if (response.status === 200) {
                console.log("response in 200");
                const userData = response.data; // Assuming the server sends back user information
                setUser(userData);
                setIsAuthenticated(true);
                setToke(t);
                console.log("user data updated");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{token, user, checktoken, logout, isAuthenticated, config}}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export {AuthProvider, useAuth};