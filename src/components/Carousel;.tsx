import React, { useState } from "react";

interface CarouselProps {
    nftList: { token_id: string }[]; // List of NFTs (sorted by token_id)
    onSelectNFT: (nft: { token_id: string }) => void; // Callback for selected NFT
    selectedNFT: { token_id: string } | null; // Currently selected NFT
}

const Carousel: React.FC<CarouselProps> = ({ nftList, onSelectNFT, selectedNFT }) => {
    const [scrollIndex, setScrollIndex] = useState(0); // Track the visible section of the carousel
    const visibleItems = 7; // Number of tokens visible at a time (adjustable)

    // Scroll handlers
    const handleScrollLeft = () => {
        setScrollIndex((prev) => Math.max(prev - visibleItems, 0));
    };

    const handleScrollRight = () => {
        setScrollIndex((prev) => Math.min(prev + visibleItems, nftList.length - visibleItems));
    };

    // Calculate visible NFTs based on scroll index
    const visibleNFTs = nftList.slice(scrollIndex, scrollIndex + visibleItems);

    return (
        <div className="carousel-container">
            <button
                className="arrow-button left"
                onClick={handleScrollLeft}
                disabled={scrollIndex === 0}
            >
                ◀
            </button>
            <div className="carousel-items">
                {visibleNFTs.map((nft) => (
                    <button
                        key={nft.token_id}
                        className={`carousel-item ${selectedNFT?.token_id === nft.token_id ? "selected" : ""
                            }`}
                        onClick={() => onSelectNFT(nft)}
                    >
                        #{nft.token_id}
                    </button>
                ))}
            </div>
            <button
                className="arrow-button right"
                onClick={handleScrollRight}
                disabled={scrollIndex + visibleItems >= nftList.length}
            >
                ▶
            </button>
            <style jsx>{`
        .carousel-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
          position: relative;
          width: 100%;
          max-width: 1200px; /* Or another value suitable for your design */
          margin: 0 auto; /* Center-align */

        }

        .arrow-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 10px;
          color: #007bff;
          transition: color 0.2s;
        }

        .arrow-button:disabled {
          color: #ccc;
          cursor: not-allowed;
        }

        .carousel-items {
          display: flex;
          overflow: hidden;
          flex: 1;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 5px 10px;
          background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.7));
          border-radius: 10px;
        }

        .carousel-item {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 10px 15px;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
        }

        .carousel-item.selected {
          background-color: #28a745;
          transform: scale(1.1);
        }

        .carousel-item:hover {
          background-color: #0056b3;
          transform: scale(1.05);
        }
      `}</style>
        </div>
    );
};

export default Carousel;
