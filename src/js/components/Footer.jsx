
import React from 'react';
import '../../css/Footer.css';


const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Tirth Dangodra. All rights reserved.</p>
                <p className="footer-note">Built with React & Vite</p>
            </div>
        </footer>
    );
};

export default Footer;
