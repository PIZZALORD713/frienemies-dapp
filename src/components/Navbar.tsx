﻿import React from 'react';
import navbarStyles from '../styles/navbar.module.css'; // Renamed import
import homeStyles from '../styles/Home.module.css'; // Renamed import
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar: React.FC = () => {
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={navbarStyles.nav}>
      <div className={navbarStyles.navContent}>
        <h1
          className={navbarStyles.branding}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className={homeStyles.friendly}>fRiEN</span>
          <span className={homeStyles.ominous}>EMiES</span>
        </h1>
        <ul className={navbarStyles.navLinks}>
          <li>
            <button onClick={() => scrollToSection('story')}>Story</button>
          </li>
          <li>
            <button onClick={() => scrollToSection('fren-to-imp')}>fREN to 😈</button>
          </li>
          <li>
                      <button onClick={() => scrollToSection('traits')}>TraitSwap (coming soon)</button>
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