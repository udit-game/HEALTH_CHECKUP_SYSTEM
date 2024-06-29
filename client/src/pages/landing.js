import React, { useEffect, useState } from 'react';
import "./landing.css"
import hsl from 'hsl-to-hex';
import {Link} from "react-router-dom";
import Carousel from "../components/Carousel";


const LandingPage = () => {
  useEffect(() => {
    const random = (min, max) => Math.random() * (max - min) + min;

    const map = (n, start1, end1, start2, end2) =>
      ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;

    const setColors = () => {
      const hue = ~~random(220, 2500);
      const complimentaryHue1 = hue + 30;
      const complimentaryHue2 = hue + 60;
      const bgGradient = `linear-gradient(
        to bottom,
        hsl(var(--hue), 95%, 99%),
        hsl(var(--hue), 95%, 84%)
      )`;
      document.documentElement.style.setProperty("--bg-gradient", bgGradient);
      document.documentElement.style.setProperty("--hue", hue);
      document.documentElement.style.setProperty("--hue-complimentary1", complimentaryHue1);
      document.documentElement.style.setProperty("--hue-complimentary2", complimentaryHue2);
    };
    setColors();
  }, []);

  return (
    <landing>
        <Carousel />
      <canvas className="orb-canvas"/>
      <div className="overlay">
        <div className="overlay__inner">
          <h1 className="overlay__title">
            <span className="text-gradient">Revolutionize Healthcare</span>: Cutting-edge
            <span className="text-gradient"> AI System </span>
            Deciphers Health Reports, Providing Precise Diagnoses and Insights for Individuals and Medical Professionals.
          </h1>
          <p className="overlay__description">
            Dive into the intricacies of your health with our AI-driven platform. Receive comprehensive analyses of your health reports, empowering you and your healthcare provider with detailed diagnoses and actionable insights. From identifying potential concerns to highlighting areas for improvement, our technology revolutionizes the way you understand and manage your well-being.
            <strong> Explore, learn, and embark on a journey towards optimal health with us.</strong>
          </p>
          <div className="overlay__btns">
            <button className="overlay__btn overlay__btn--transparent">
              <Link to="/signup">
                <span className="text-gradient">Get Started</span>
              </Link>
            </button>
          </div>
        </div>
      </div>
    </landing>
  );
};

export default LandingPage;
