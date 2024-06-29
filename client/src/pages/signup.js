import React, {useState, useEffect} from 'react';
import './login.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Link, useNavigate} from "react-router-dom";
import {faCircle, faKey, faUserCircle} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {useAuth} from "../Context/Context";

function SignupComponent({isAuthenticated}) {
  let navigate = useNavigate();
  const { user } = useAuth()
  useEffect(() => {
    const bgGradient = `linear-gradient(
      to bottom,
      #eda1c8,
      #3d9bb3
    )`;
    document.documentElement.style.setProperty("--bg-gradient", bgGradient);

    if(isAuthenticated && user){
      navigate('/')
    }

  }, [isAuthenticated, navigate]);
  const { checktoken } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePicture:'',
  });

  const handleChange = async (e) => {
    const inputName = e.target.name;
    const inputValue = e.target.type === 'file' ? e.target.files[0] : e.target.value;

    if (e.target.type === 'file') {
        const reader = new FileReader();

        reader.onload = () => {
          const base64String = reader.result.split(',')[1];

          setFormData({
            ...formData,
            ["profilePicture"]: base64String,
          });

        };

        await reader.readAsDataURL(inputValue);
      } else {
        setFormData({
          ...formData,
          [inputName]: inputValue,
        });
      }
  };



  const registerUser = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/signup', formData);
      if (response.status === 200) {
        const token = response.data.token;
        await checktoken(token);
        localStorage.setItem('token', token);
        navigate(0);
    }
    } catch (error) {
      console.error('Error:', error);
    }
  };



  function show_hide_password(target){
	var input = document.getElementById('password-input');
	if (input.getAttribute('type') === 'password') {
		target.classList.add('view');
		input.setAttribute('type', 'text');
	} else {
		target.classList.remove('view');
		input.setAttribute('type', 'password');
	}
	return false;
}

  return (
      <section className="login-section">

  <div className="login-box">

    <div className="login-square" style={{'--i': 0}}/>
    <div className="login-square" style={{'--i': 1}}/>
    <div className="login-square" style={{'--i': 2}}/>
    <div className="login-square" style={{'--i': 3}}/>
    <div className="login-square" style={{'--i': 4}}/>
    <div className="login-square" style={{'--i': 5}}/>

    <div className="login-container">
      <div className="login-form">
        <h2 className="login-h2">SIGNUP</h2>
        <form onSubmit={registerUser}>
          <div className="login-inputBx">
            <input className="login-input" type="text" name="name" value={formData.name} onChange={handleChange} required />
            <span className="login-span">Name</span>
            <FontAwesomeIcon className="login-fas" icon={faCircle} />
          </div>
          <div className="login-inputBx">
            <input className="login-input" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <span className="login-span">Email</span>
            <FontAwesomeIcon className="login-fas" icon={faUserCircle} />
          </div>
          <div className="login-inputBx login-password">
            <input className="login-input" id="password-input" type="password" name="password" value={formData.password} onChange={handleChange} required />
            <span className="login-span">Password</span>
            <Link to="/signup" className="login-password-control" onClick={(e) => show_hide_password(e.target)}/>
            <FontAwesomeIcon icon={faKey} className="login-fas" />
          </div>
          <div className="login-inputBx login-password">
            <label
          className="RecipeForm-upload-button"
          style={{
            position:"relative",
            display: 'inline-block',
            padding: '10px 20px',
            border: '2px solid #ccc',
            borderRadius: '10px',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9',
            margin: "10px",
            marginLeft: '-10px',
            opacity: "0.8",
          }}
        >
          Upload Image
          <input
            type="file"
            accept="image/*"
            name="profilePicture"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
        </label>
          </div>
          <div className="login-inputBx">
            <input className="login-input" type="submit" value="SignUp" />
          </div>
        </form>
        <p className="login-p">Already have an account <Link className="login-a" to="/login">Login</Link></p>
      </div>
    </div>

  </div>
</section>

  );
}

export default SignupComponent;
