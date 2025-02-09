"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Card from "../components/Card";
import Button from "../components/Button";

const HeroSection = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-gray-100 p-6 flex min-h-screen flex-col items-center justify-center">
            <motion.div
                className="bg-white p-4 relative w-full max-w-2xl rounded-xl shadow-lg"
                initial={{ rotateX: 10, scale: 0.95 }}
                animate={{ rotateX: open ? 0 : 10, scale: open ? 1 : 0.95 }}
                transition={{ duration: 0.5 }}
            >
                <Card>
                    {!open ? (
                        <div className="p-4 cursor-pointer text-center" onClick={() => setOpen(true)}>
                            <Image
                                src="/newspaper-preview.jpg"
                                alt="Newspaper Preview"
                                width={500}
                                height={300}
                                className="rounded-lg"
                            />
                            <h1 className="text-gray-800 mt-4 text-xl font-bold">
                                From fRiENDS to fRiENEMiES
                            </h1>
                            <p className="text-gray-600 mt-2 text-sm">
                                What happens when a community takes back control? Click to find out.
                            </p>
                            <Button className="mt-4">Read More</Button>
                        </div>
                    ) : (
                        <div className="text-gray-700 p-4 text-left">
                            <h2 className="text-lg font-bold">A Community Revival</h2>
                            <p className="mt-2">
                                In 2022, fRiENDSiES launched with a bold vision—AI companions, interactive 3D avatars, and a community-driven digital identity system. It was the kind of future we all wanted to build. But it never got the chance...
                            </p>
                            <Button className="mt-4" onClick={() => setOpen(false)}>
                                Close
                            </Button>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};

export default HeroSection;
