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
                forceWheelAxis: "x",
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

    // ✅ Scroll & Select Slide on Click
    const handleSlideClick = useCallback(
        (index: number) => {
            if (!emblaApi) return;
            emblaApi.scrollTo(index); // Scroll to clicked slide
            onSelectNFT(nftList[index]); // Update selected NFT
        },
        [emblaApi, nftList, onSelectNFT]
    );

    // ✅ Ensure selected NFT updates when carousel moves
    const handleSelect = useCallback(() => {
        if (!emblaApi) return;
        const selectedIndex = emblaApi.selectedScrollSnap();
        onSelectNFT(nftList[selectedIndex]);
    }, [emblaApi, nftList, onSelectNFT]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", handleSelect);
        return () => emblaApi.off("select", handleSelect);
    }, [emblaApi, handleSelect]);

    // ✅ Handle Mouse Wheel Scroll
    useEffect(() => {
        if (!emblaApi || !emblaRef.current) return;

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            if (event.deltaY > 0) emblaApi.scrollNext();
            else emblaApi.scrollPrev();
        };

        emblaRef.current.addEventListener("wheel", onWheel, { passive: false });

        return () => emblaRef.current?.removeEventListener("wheel", onWheel);
    }, [emblaApi]);

    return (
        <div className={styles.embla__wrapper} ref={emblaRef}>
            {/* Left Arrow */}
            <button className={styles.arrow__button + " " + styles.left} onClick={() => emblaApi?.scrollPrev()}>
                ◀
            </button>

            {/* Carousel */}
            <div className={styles.embla} ref={emblaNode}>
                <div className={styles.embla__container}>
                    {nftList.map((nft, index) => (
                        <div
                            key={nft.token_id}
                            className={`${styles.embla__slide} ${selectedNFT?.token_id === nft.token_id ? styles.selected : ""
                                }`}
                            data-index={index}
                            onClick={() => handleSlideClick(index)} // ✅ Click event added
                        >
                            #{nft.token_id}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Arrow */}
            <button className={styles.arrow__button + " " + styles.right} onClick={() => emblaApi?.scrollNext()}>
                ▶
            </button>
        </div>
    );
};

export default Carousel;
