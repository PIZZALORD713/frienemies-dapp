import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "../styles/Carousel.module.css";

interface CarouselProps {
    nftList: { token_id: string }[];
    onSelectNFT: (nft: { token_id: string }) => void;
    selectedNFT: { token_id: string } | null;
}

const Carousel: React.FC<CarouselProps> = ({ nftList, onSelectNFT, selectedNFT }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    return (
        <div className={styles.embla__wrapper}>
            {/* Left Arrow */}
            <button className={styles.arrow__button + " " + styles.left} onClick={scrollPrev}>◀</button>

            {/* Carousel */}
            <div className={styles.embla} ref={emblaRef}>
                <div className={styles.embla__container}>
                    {nftList.map((nft) => (
                        <button
                            key={nft.token_id}
                            className={`${styles.embla__slide} ${selectedNFT?.token_id === nft.token_id ? styles.selected : ""}`}
                            onClick={() => onSelectNFT(nft)}
                        >
                            #{nft.token_id}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Arrow */}
            <button className={styles.arrow__button + " " + styles.right} onClick={scrollNext}>▶</button>
        </div>
    );
};

export default Carousel;
