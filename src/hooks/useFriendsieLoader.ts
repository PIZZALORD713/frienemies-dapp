import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { applyFaceTexture } from "../utils/applyFaceTexture";

export const useFriendsieLoader = (
    friendsieId: string,
    sceneRef: React.MutableRefObject<THREE.Scene | null>,
    mixersRef: React.MutableRefObject<THREE.AnimationMixer[]>,
    loadedModelsRef: React.MutableRefObject<THREE.Object3D[]>
) => {
    const gltfLoaderRef = useRef<GLTFLoader | null>(null);
    const dracoLoaderRef = useRef<DRACOLoader | null>(null);
    const textureLoaderRef = useRef(new THREE.TextureLoader());

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!dracoLoaderRef.current) {
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath("/draco/");
            dracoLoaderRef.current = dracoLoader;
        }

        if (!gltfLoaderRef.current) {
            const gltfLoader = new GLTFLoader();
            gltfLoader.setDRACOLoader(dracoLoaderRef.current);
            gltfLoaderRef.current = gltfLoader;
        }

        let allFriendsies: Record<string, any> | null = null;

        // 🧹 Clear previous models from the scene before loading a new one
        const clearScene = () => {
            if (!sceneRef.current) return;

            mixersRef.current.forEach((mixer) => mixer.stopAllAction());
            mixersRef.current.length = 0;

            loadedModelsRef.current.forEach((model) => {
                sceneRef.current?.remove(model);
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        if (Array.isArray(mesh.material)) {
                            mesh.material.forEach((material) => material.dispose());
                        } else {
                            mesh.material.dispose();
                        }
                        mesh.geometry.dispose();
                    }
                });
            });

            loadedModelsRef.current.length = 0;
        };

        // 🔹 Debounced function to load a Friendsie model
        const loadFriendsie = async () => {
            if (!friendsieId) return;

            if (!allFriendsies) {
                try {
                    const response = await fetch(
                        "https://gist.githubusercontent.com/IntergalacticPizzaLord/a7b0eeac98041a483d715c8320ccf660/raw/ce7d37a94c33c63e2b50d5922e0711e72494c8dd/fRiENDSiES"
                    );
                    allFriendsies = await response.json();
                } catch (error) {
                    console.error("Error fetching Friendsies data:", error);
                    return;
                }
            }

            if (!allFriendsies || !allFriendsies[friendsieId]) {
                console.error(`Friendsie with ID "${friendsieId}" not found.`);
                return;
            }

            // 🛑 Cancel previous timeout if user scrolls fast
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // ⏳ Set a debounce timer before loading
            debounceTimeoutRef.current = setTimeout(() => {
                // 🧹 Clear previous model before loading a new one
                clearScene();

                const friendsie = allFriendsies[friendsieId];
                const attributes = friendsie.attributes;
                let faceTrait: string | null = null;

                attributes.forEach(({ trait_type, asset_url }: { trait_type: string; asset_url: string }) => {
                    if (trait_type === "face") {
                        faceTrait = asset_url;
                    }

                    if (asset_url && asset_url.endsWith(".glb")) {
                        gltfLoaderRef.current?.load(
                            asset_url,
                            (gltf) => {
                                const model = gltf.scene;
                                model.scale.set(10, 10, 10);
                                sceneRef.current?.add(model);
                                loadedModelsRef.current.push(model);

                                if (trait_type === "head" && faceTrait) {
                                    applyFaceTexture(model, faceTrait, textureLoaderRef.current);
                                }

                                if (gltf.animations && gltf.animations.length > 0) {
                                    const mixer = new THREE.AnimationMixer(model);
                                    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
                                    mixersRef.current.push(mixer);
                                }
                            },
                            undefined,
                            (error) => console.error(`Error loading GLB asset: ${asset_url}`, error)
                        );
                    }
                });
            }, 300); // ⏳ Debounce delay (300ms)
        };

        loadFriendsie();
    }, [friendsieId]);
};
