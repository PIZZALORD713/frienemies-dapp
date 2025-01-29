import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Carousel from "./Carousel"; // Import the updated Carousel component

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

            // **Sort NFTs by token_id in descending order**
            accumulatedNFTs.sort((a, b) => Number(b.token_id) - Number(a.token_id));

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
    };

    return (
        <div className="inventory-container">
            <h1>Your NFT Inventory</h1>
            {loading && <p>Loading NFTs...</p>}
            {!loading && allNFTs.length > 0 && (
                <Carousel
                    nftList={allNFTs}
                    onSelectNFT={handleSelectNFT}
                    selectedNFT={selectedNFT}
                />
            )}
            {allNFTs.length === 0 && !loading && <p>No NFTs found.</p>}

            <style jsx>{`
                .inventory-container {
                    width: 100%;
                    max-width: 975px;
                    margin: 0 auto;
                    padding: 20px;
                }
            `}</style>
        </div>
    );
};

export default NFTInventory;
