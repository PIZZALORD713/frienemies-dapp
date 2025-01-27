import React, { useState, useEffect } from "react";
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

    // Fetch all NFTs for the wallet
    const fetchAllNFTs = async (walletAddress: string) => {
        if (!walletAddress) return;

        setLoading(true);

        let cursor: string | null = null;
        let accumulatedNFTs: NFT[] = [];

        try {
            do {
                // Type the fetch response and JSON data explicitly
                const response: Response = await fetch(
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

            // Auto-select the first NFT if available
            if (accumulatedNFTs.length > 0) {
                setSelectedNFT(accumulatedNFTs[0]);
                onSelectNFT(accumulatedNFTs[0]); // Notify the parent component
            }
        } catch (error) {
            console.error("Error fetching NFTs:", error);
            setAllNFTs([]);
        } finally {
            setLoading(false);
        }
    };

    // Automatically fetch NFTs when the wallet is connected or the address changes
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
        onSelectNFT(nft); // Notify the parent component about the selected NFT
    };

    return (
        <div>
            <h1>Your NFT Inventory</h1>
            {loading && <p>Loading NFTs...</p>}
            {!loading && allNFTs.length > 0 && (
                <>
                    <div className="scroll-container">
                        {allNFTs.map((nft, index) => (
                            <button
                                key={index}
                                className={`scroll-item ${selectedNFT?.token_id === nft.token_id ? "selected" : ""}`}
                                onClick={() => handleSelectNFT(nft)}
                            >
                                #{nft.token_id}
                            </button>
                        ))}
                    </div>
                    <p>Selected NFT: #{selectedNFT?.token_id}</p>
                </>
            )}
            {allNFTs.length === 0 && !loading && <p>No NFTs found.</p>}
            <style jsx>{`
        .scroll-container {
          display: flex;
          overflow-x: auto;
          white-space: nowrap;
          padding: 10px;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .scroll-item {
          display: inline-block;
          margin-right: 10px;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }

        .scroll-item.selected {
          background-color: #28a745;
        }

        .scroll-item:hover {
          background-color: #0056b3;
        }
      `}</style>
        </div>
    );
};

export default NFTInventory;
