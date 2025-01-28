import React, { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";

interface NFT {
    token_id: string;
    [key: string]: any; // Adjust based on your NFT data structure
}

interface NFTInventoryProps {
    onSelectNFT: (nft: NFT) => void; // Callback to pass the selected NFT to the viewer
}

const NFTInventory: React.FC<NFTInventoryProps> = ({ onSelectNFT }) => {
    const { address, isConnected } = useAccount();
    const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Fetch NFTs for the wallet
    const fetchAllNFTs = async (walletAddress: string) => {
        if (!walletAddress) return;

        setLoading(true);

        let cursor: string | null = null;
        let accumulatedNFTs: NFT[] = [];

        try {
            do {
                const response = await fetch(
                    `/api/fetchnfts?address=${walletAddress}${cursor ? `&cursor=${cursor}` : ""}`
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch NFTs: ${errorText}`);
                }

                const data: { result?: NFT[]; cursor?: string | null } = await response.json();
                accumulatedNFTs = [...accumulatedNFTs, ...(data.result || [])];
                cursor = data.cursor || null;
            } while (cursor);

            setAllNFTs(accumulatedNFTs);

            if (accumulatedNFTs.length > 0) {
                setSelectedNFT(accumulatedNFTs[0]);
                onSelectNFT(accumulatedNFTs[0]);
            }
        } catch (error) {
            console.error("Error fetching NFTs:", error);
            setAllNFTs([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch NFTs when wallet connects or address changes
    useEffect(() => {
        if (isConnected && address) {
            fetchAllNFTs(address);
        } else {
            setAllNFTs([]);
            setSelectedNFT(null);
        }
    }, [address, isConnected]);

    // Handle NFT selection
    const handleSelectNFT = (nft: NFT) => {
        setSelectedNFT(nft);
        onSelectNFT(nft);
        const selectedElement = document.getElementById(`nft-${nft.token_id}`);
        selectedElement?.scrollIntoView({ behavior: "smooth", inline: "center" });
    };

    // Handle carousel scrolling
    const scrollCarousel = (direction: "left" | "right") => {
        if (carouselRef.current) {
            const scrollAmount = direction === "left" ? -200 : 200;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="inventory-container">
            <h1>Your NFT Inventory</h1>
            {loading && <p>Loading NFTs...</p>}
            {!loading && allNFTs.length > 0 && (
                <div className="carousel-container">
                    <button className="arrow left" onClick={() => scrollCarousel("left")}>
                        ←
                    </button>
                    <div className="carousel" ref={carouselRef}>
                        {allNFTs.map((nft) => (
                            <button
                                key={nft.token_id}
                                id={`nft-${nft.token_id}`}
                                className={`carousel-item ${selectedNFT?.token_id === nft.token_id ? "selected" : ""}`}
                                onClick={() => handleSelectNFT(nft)}
                            >
                                #{nft.token_id}
                            </button>
                        ))}
                    </div>
                    <button className="arrow right" onClick={() => scrollCarousel("right")}>
                        →
                    </button>
                </div>
            )}
            {allNFTs.length === 0 && !loading && <p>No NFTs found.</p>}
            <style jsx>{`
                .inventory-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .carousel-container {
                    display: flex;
                    align-items: center;
                    position: relative;
                    width: 100%;
                    background: linear-gradient(to right, #007bff, #28a745, #6f42c1);
                    border-radius: 8px;
                    padding: 10px;
                    overflow: hidden;
                }

                .arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.8);
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 24px;
                    cursor: pointer;
                    z-index: 1;
                }

                .arrow.left {
                    left: 5px;
                }

                .arrow.right {
                    right: 5px;
                }

                .carousel {
                    display: flex;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    gap: 10px;
                    width: calc(100% - 100px); /* Account for arrow buttons */
                    padding: 5px 0;
                }

                .carousel-item {
                    flex: 0 0 auto;
                    background: #007bff;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                }

                .carousel-item.selected {
                    background: #28a745;
                    font-weight: bold;
                }

                .carousel-item:hover {
                    background: #0056b3;
                }

                .carousel::-webkit-scrollbar {
                    height: 6px;
                }

                .carousel::-webkit-scrollbar-thumb {
                    background: #ddd;
                    border-radius: 5px;
                }

                .carousel::-webkit-scrollbar-track {
                    background: transparent;
                }
            `}</style>
        </div>
    );
};

export default NFTInventory;
