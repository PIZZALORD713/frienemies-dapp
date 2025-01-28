import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface CarouselProps {
    nftList: { token_id: string }[];
    onSelectNFT: (nft: { token_id: string }) => void;
    selectedNFT: { token_id: string } | null;
}

const Carousel: React.FC<CarouselProps> = ({ nftList, onSelectNFT, selectedNFT }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, containScroll: false });

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    return (
        <div className="carousel-container">
            <button className="arrow-button left" onClick={scrollPrev}>◀</button>
            <div className="carousel" ref={emblaRef}>
                <div className="carousel-track">
                    {nftList.map((nft) => (
                        <button
                            key={nft.token_id}
                            className={`carousel-item ${selectedNFT?.token_id === nft.token_id ? "selected" : ""}`}
                            onClick={() => onSelectNFT(nft)}
                        >
                            #{nft.token_id}
                        </button>
                    ))}
                </div>
            </div>
            <button className="arrow-button right" onClick={scrollNext}>▶</button>

            <style jsx>{`
        .carousel-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
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

        .arrow-button:hover {
          color: #0056b3;
        }

        .carousel {
          overflow: hidden;
          flex: 1;
          padding: 10px; /* Adds spacing to prevent overlap */
        }

        .carousel-track {
          display: flex;
          gap: 15px; /* Ensure spacing between items */
          padding: 10px 20px;
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
          min-width: 80px;
          text-align: center;
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
