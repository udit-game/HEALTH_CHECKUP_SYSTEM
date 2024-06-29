import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './searchbar.css';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useAuth} from "../Context/Context";

const SearchBar = () => {
    let { recipeList } = useAuth()
    const [clicked, setClicked] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();


    const handleClick = async () => {
        setClicked(!clicked);
        document.getElementsByClassName('navbar-item-mid')[0].style.setProperty('display', 'block', 'important');
        if(inputValue!=='' && inputValue.length>4) {
            const response = await axios.request(recipeList(inputValue));
            if (response.data.results.length) {
                 navigate('/Recipes/'+inputValue);
            }
        }
        setInputValue(''); // Clear the input value on click
        if (!clicked) {
            inputRef.current.focus();
            document.getElementsByClassName('navbar-item-mid')[0].style.setProperty('display', 'none', 'important');
        }
    }

    const handleGlobalClick = (e) => {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
            document.getElementsByClassName('navbar-item-mid')[0].style.setProperty('display', 'block', 'important');
            setClicked(false);
        }
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    useEffect(() => {
        document.addEventListener('click', handleGlobalClick);

        return () => {
            document.removeEventListener('click', handleGlobalClick);
        }
    }, []);

    return (
        <div className={`search-box ${clicked ? 'active' : ''}`} ref={searchRef}>
            <div className="search" onClick={handleClick}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search Symptoms..."
                    className={clicked ? 'expanded' : ''}
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <span className="search-button">
                    <FontAwesomeIcon icon={faSearch} />
                </span>
            </div>
        </div>
    )
};

export default SearchBar;
