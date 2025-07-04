import React from 'react';
import './About.css';

function About() {
    return (
        <div className="about-page">
            <div className="about-container">
                <h1 className="about-title">About SwitchBot App</h1>
                <p className="about-description">
                    SwitchBot App is a desktop/web application designed to give you seamless control over your SwitchBot smart devices. Easily manage, automate, and monitor your SwitchBot products from your computer or browser. With an intuitive interface and real-time device status, SwitchBot App makes it simple to schedule actions, check device states, and integrate your smart home experience—all in one place.
                </p>
                <p className="about-author">
                    Created by <a href="https://github.com/dbghelp" target="_blank" rel="noopener noreferrer" className="about-link">dbghelp</a>
                </p>
                <p className="about-github">
                    Visit the project on GitHub: <a href="https://github.com/dbghelp" target="_blank" rel="noopener noreferrer" className="about-link">https://github.com/dbghelp</a>
                </p>
            </div>
        </div>
    );
}

export default About;