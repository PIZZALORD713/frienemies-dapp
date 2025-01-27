import { NextApiRequest, NextApiResponse } from "next";
import Moralis from "moralis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const chain = "0x1"; // Ethereum Mainnet
        const format = "decimal";
        const normalizeMetadata = true; // Use boolean
        const tokenAddresses = ["0xe5af63234f93afd72a8b9114803e33f6d9766956"];
        const mediaItems = true;

        // Ensure Moralis is initialized once
        if (!Moralis.Core.isStarted) {
            await Moralis.start({
                apiKey: process.env.MORALIS_API_KEY, // Server-side secure usage
            });
        }

        // Validate the request
        const { address } = req.query;

        if (!address || typeof address !== "string") {
            return res.status(400).json({ error: "Invalid wallet address" });
        }

        // Fetch NFTs for the wallet address
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            chain,
            format,
            normalizeMetadata,
            tokenAddresses,
            mediaItems,
            address,
        });

        // Type response as a known Moralis type
        const nfts = (response.toJSON() as { result: any[] }).result; // Type `result` explicitly

        // Log the fetched NFTs for debugging
        console.log("Fetched NFTs:", nfts);

        // Respond with the fetched data
        res.status(200).json({ result: nfts });
    } catch (error) {
        console.error("Error fetching NFTs:", error);
        res.status(500).json({ error: "Failed to fetch NFTs" });
    }
}
