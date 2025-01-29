import React, { useState, useEffect } from "react";
import navbarStyles from "../styles/navbar.module.css"; // Navbar styles
import homeStyles from "../styles/Home.module.css"; // Home styles
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar: React.FC = () => {
    const [small, setSmall] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // Handle navbar shrink on scroll
    useEffect(() => {
        const handleScroll = () => {
            setSmall(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Toggle mobile menu
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Smooth scrolling to section
    const scrollToSection = (id: string) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
            setMenuOpen(false); // Close menu on mobile after clicking
        }
    };

    return (
        <nav className={`${navbarStyles.nav} ${small ? navbarStyles.shrink : ""}`}>
            <div className={navbarStyles.navContent}>
                {/* Branding / Logo */}
                <h1
                    className={navbarStyles.branding}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    <span className={homeStyles.friendly}>fRiEN</span>
                    <span className={homeStyles.ominous}>EMiES</span>
                </h1>

                {/* Hamburger Menu for Mobile */}
                <div className={navbarStyles.hamburger} onClick={toggleMenu}>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>

                {/* Navigation Links */}
                <ul className={`${navbarStyles.navLinks} ${menuOpen ? navbarStyles.active : ""}`}>
                    <li>
                        <button onClick={() => scrollToSection("story")}>Story</button>
                    </li>
                    <li>
                        <button onClick={() => scrollToSection("fren-to-imp")}>fREN to 😈</button>
                    </li>
                    <li>
                        <button onClick={() => scrollToSection("traits")}>TraitSwap (coming soon)</button>
                    </li>
                    <li>
                        <ConnectButton chainStatus="none" showBalance={false} />
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
