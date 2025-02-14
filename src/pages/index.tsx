import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import NFTInventory from "../components/NFTInventory"; // Import the NFTInventory component
import { useState } from "react";
import dynamic from "next/dynamic";


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
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />

            </Head>

            <Navbar />

            <main className={styles.main}>
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
