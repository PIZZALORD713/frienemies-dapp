import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import styles from "../styles/Carousel.module.css";

interface CarouselProps {
    nftList: { token_id: string }[];
    onSelectNFT: (nft: { token_id: string }) => void;
    selectedNFT: { token_id: string } | null;
}

const Carousel: React.FC<CarouselProps> = ({ nftList, onSelectNFT, selectedNFT }) => {
    const emblaRef = useRef<HTMLDivElement | null>(null);
    const [emblaApi, setEmblaApi] = useState<any | null>(null);

    // ✅ Initialize Embla with Wheel Gesture Support
    const [emblaNode, embla] = useEmblaCarousel(
        { loop: true },
        [
            WheelGesturesPlugin({
                forceWheelAxis: "x", // Forces vertical scrolling to be interpreted as horizontal
                wheelDraggingClass: "is-dragging",
            }),
        ]
    );

    // ✅ Store API once it's available
    useEffect(() => {
        if (embla) {
            setEmblaApi(embla);
        }
    }, [embla]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    // ✅ Handle Mouse Wheel Scroll (Ensuring Embla API is Ready)
    useEffect(() => {
        if (!emblaApi || !emblaRef.current) return;

        const onWheel = (event: WheelEvent) => {
            event.preventDefault(); // Prevent page scrolling
            if (!emblaApi) return;

            if (event.deltaY > 0) {
                emblaApi.scrollNext();
            } else {
                emblaApi.scrollPrev();
            }
        };

        emblaRef.current.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            emblaRef.current?.removeEventListener("wheel", onWheel);
        };
    }, [emblaApi]);

    return (
        <div className={styles.embla__wrapper} ref={emblaRef}>
            {/* Left Arrow */}
            <button className={styles.arrow__button + " " + styles.left} onClick={scrollPrev}>
                ◀
            </button>

            {/* Carousel */}
            <div className={styles.embla} ref={emblaNode}>
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
            <button className={styles.arrow__button + " " + styles.right} onClick={scrollNext}>
                ▶
            </button>
        </div>
    );
};

export default Carousel;
