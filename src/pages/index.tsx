import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import NFTInventory from "../components/NFTInventory"; // Import the NFTInventory component
import { useState } from "react";
import dynamic from "next/dynamic";
import HeroSection from "../components/HeroSection";


// Lazy load FriendsieViewer (disable SSR to avoid hydration issues)
const FriendsieViewer = dynamic(() => import("../components/FriendsieViewer"), { ssr: false });

const Home: NextPage = () => {
    // State to manage the selected NFT
    const [selectedNFT, setSelectedNFT] = useState<any | null>(null);

    return (
        <div className={styles.container}>
            <Head>
                <title>fRiENEMiES</title>
                <meta
                    content="some friends are even better as enemies"
                    name="description"
                />
                <link href="/favicon.ico" rel="icon" />
            </Head>

            <Navbar />

            <main className={styles.main}>
                {/* Hero Section */}
                <HeroSection className={styles.story} />
                {/* NFT Inventory for navigation */}
                <NFTInventory onSelectNFT={setSelectedNFT} />

                {/* Friendsie Viewer for rendering the selected NFT */}
                {selectedNFT ? (
                    <FriendsieViewer friendsieId={selectedNFT.token_id} />
                ) : (
                    <p>Please select an NFT from the navigation above.</p>
                )}
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://x.com/pizzalord_pizza"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    Made with ❤️ by pizzalord.eth
                </a>
            </footer>
        </div>
    );
};

export default Home;
