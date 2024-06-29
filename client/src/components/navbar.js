import './navbar.css'
import React, {useEffect, useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser, faHouse, faUpload, faArrowRight, faFilter, faAdd, faSignOut} from '@fortawesome/free-solid-svg-icons';
import {Link, useLocation} from "react-router-dom";
import hsl from "hsl-to-hex";
import {useAuth} from "../Context/Context";
import SearchBar from "./searchbar";


function Navbar() {
  const location = useLocation();
  const { user, setfilterPopOn, filterPopOn, RecipeFormOn, setRecipeFormOn, logout } = useAuth();
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);



  const handleFilterClick = () => {
    filterPopOn ? setfilterPopOn(false): setfilterPopOn(true);
  };

  const handleAddClick = () => {
    RecipeFormOn ? setRecipeFormOn(false): setRecipeFormOn(true);
  };




  useEffect(() => {
  const handleMouseMovement = (e) => {
    const mouseY = e.clientY;
    const navbarHeight = document.querySelector('.navbar-list').offsetHeight;
    const threshold = 100;
    setIsNavbarVisible(mouseY >= window.innerHeight - navbarHeight-80);
  };

  window.addEventListener('mousemove', handleMouseMovement);

  return () => {
    window.removeEventListener('mousemove', handleMouseMovement);
  };
}, []);

  useEffect(()=>{
    if(!user){
      document.querySelector('.navbar-container').style.left = '39%';
    }
    else {
      document.querySelector('.navbar-container').style.left = '34%';
    }
  }, [user, location]);

  useEffect(() => {
    const random = (min, max) => Math.random() * (max - min) + min;

    const setColors = () => {
      const hue = ~~random(220, 360);
      const complimentaryHue1 = hue + 30;
      const complimentaryHue2 = hue + 60;
      document.documentElement.style.setProperty("--hue-complimentary1", hue);
      document.documentElement.style.setProperty("--hue-complimentary2", complimentaryHue2);
      document.documentElement.style.setProperty("--hue", complimentaryHue1);
    };

    const setCustomProperties = () => {
      document.documentElement.style.setProperty("--font-family", "Poppins, system-ui");
      document.documentElement.style.setProperty("--bg-gradient", "linear-gradient(to top, hsl(var(--hue), 95%, 99%), hsl(var(--hue), 95%, 84%))");
    };

    setColors()

  }, []);


  return (
         <div className={`navbar-container ${isNavbarVisible ? '' : 'hidden'}`}>
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/">
            <span className="navbar-icon">
              <FontAwesomeIcon icon={faHouse} />
            </span>
            <span className="navbar-text">
              Home
            </span>
          </Link>
        </li>

        {user ? (
            <li className="navbar-item">
          <Link to="/options">
            <span className="navbar-icon">
              <FontAwesomeIcon icon={faUpload} />
            </span>
            <span className="navbar-text">
              Upload
            </span>
          </Link>
        </li>
        ):(
            <li className="navbar-item">
          <Link to="/login">
            <span className="navbar-icon">
              <FontAwesomeIcon icon={faUpload} />
            </span>
            <span className="navbar-text">
              Upload
            </span>
          </Link>
        </li>
        )}



        {user ? (
            <>
            <li className="navbar-item-mid">
              <Link to="/records">
                <span className="nav-profile">
                  {user.picture.includes("http")?(
                      <FontAwesomeIcon className="profile-icon" icon={faUser} />
                  ):(
                      <img src={`data:image/jpeg;base64,${user.picture}`} style={{
                        width: "80px",
                        height: "auto"
                      }}/>
                  )}
                </span>
                <span className="navbar-text-mid" style={{
                  bottom:"2.1%"
                }}>
                  {user.name}
                </span>
              </Link>
            </li>

              <SearchBar />
            </>
        ):(
            <></>
        )}

        {user?(
            <li style={{paddingBottom:"7px"}} className="navbar-item">
          <Link>
            <span className="navbar-icon" onClick={logout}>
              <FontAwesomeIcon icon={faSignOut} />
            </span>
            <span className="navbar-text">
              LogOut
            </span>
          </Link>
        </li>
        ):(
            <li className="navbar-item">
          <Link to="/signup">
            <span className="navbar-icon">
              <FontAwesomeIcon icon={faArrowRight} />
            </span>
            <span className="navbar-text">
              Join Us
            </span>
          </Link>
        </li>
        )}


        <div className="navbar-indicator" />
      </ul>
    </div>
  );
}

export default Navbar;