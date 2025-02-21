import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit"; // Import the same Connect Button
import Carousel from "./Carousel";

interface NFT {
    token_id: string;
    [key: string]: any;
}

interface NFTInventoryProps {
    onSelectNFT: (nft: NFT) => void;
}

const NFTInventory: React.FC<NFTInventoryProps> = ({ onSelectNFT }) => {
    const { address, isConnected } = useAccount();
    const [allNFTs, setAllNFTs] = useState<NFT[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

    // Default NFTs when none are found
    const defaultNFTs: NFT[] = [
        { token_id: "7499" }, { token_id: "8448" }, { token_id: "6602" }, { token_id: "6149" }
        
    ];

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

            // Sort NFTs by token_id in descending order
            accumulatedNFTs.sort((a, b) => Number(b.token_id) - Number(a.token_id));

            setAllNFTs(accumulatedNFTs);

            if (accumulatedNFTs.length > 0) {
                setSelectedNFT(accumulatedNFTs[0]);
                onSelectNFT(accumulatedNFTs[0]);
            } else {
                // No NFTs found, show defaults
                setAllNFTs(defaultNFTs);
                setSelectedNFT(defaultNFTs[0]);
                onSelectNFT(defaultNFTs[0]);
            }
        } catch (error) {
            console.error("Error fetching NFTs:", error);
            setAllNFTs(defaultNFTs);
            setSelectedNFT(defaultNFTs[0]);
            onSelectNFT(defaultNFTs[0]);
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
    };

    return (
        <div className="inventory-container">
            <h1>fRiEN Viewer</h1>

            {/* If not connected, show the connect button */}
            {!isConnected && (
                <div className="connect-container">
                    <p>Please connect your wallet to view your NFTs. <ConnectButton chainStatus="none" showBalance={false} /> </p>
                    
                </div>
            )}

            {/* If connected and loading */}
            {isConnected && loading && <p>Loading NFTs...</p>}

            {/* If connected and NFTs exist */}
            {isConnected && !loading && allNFTs.length > 0 && (
                <Carousel
                    nftList={allNFTs}
                    onSelectNFT={handleSelectNFT}
                    selectedNFT={selectedNFT}
                />
            )}

            <style jsx>{`
                .inventory-container {
                    width: 100%;
                    margin: 0 auto;
                    padding: 20px;
                }
                .connect-container {
                    text-align: center;
                    padding: 20px;
                }
            `}</style>
        </div>
    );
};

export default NFTInventory;
