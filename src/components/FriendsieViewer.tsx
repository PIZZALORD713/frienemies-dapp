import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

interface FriendsieViewerProps {
    friendsieId: string;
}

const FriendsieViewer: React.FC<FriendsieViewerProps> = ({ friendsieId }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const mixersRef = useRef<THREE.AnimationMixer[]>([]);
    const loadedModelsRef = useRef<THREE.Object3D[]>([]);
    const animationFrameIdRef = useRef<number | null>(null);
    const gltfLoaderRef = useRef<GLTFLoader | null>(null);
    const dracoLoaderRef = useRef<DRACOLoader | null>(null);

    useEffect(() => {
        let controls: OrbitControls;
        let allFriendsies: Record<string, any> | null = null;

        if (!dracoLoaderRef.current) {
            const manager = new THREE.LoadingManager();
            const dracoLoader = new DRACOLoader(manager);
            dracoLoader.setDecoderPath("/draco/");
            dracoLoaderRef.current = dracoLoader;
        }

        if (!gltfLoaderRef.current) {
            const gltfLoader = new GLTFLoader();
            gltfLoader.setDRACOLoader(dracoLoaderRef.current);
            gltfLoaderRef.current = gltfLoader;
        }

        const textureLoader = new THREE.TextureLoader();

        // Initialize Scene
        const initScene = () => {
            if (!rendererRef.current) {
                rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
                rendererRef.current.setPixelRatio(window.devicePixelRatio);
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
                rendererRef.current.setClearColor(0xffffff);

                if (mountRef.current) {
                    mountRef.current.appendChild(rendererRef.current.domElement);
                }
            }

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(
                30,
                window.innerWidth / window.innerHeight,
                1,
                500
            );
            camera.position.set(0, 1, 10);

            controls = new OrbitControls(camera, rendererRef.current.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 2;
            controls.maxDistance = 10;
            controls.target.set(0, 1.75, 0);
            controls.update();

            const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.95);
            scene.add(hemisphereLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
            directionalLight.position.set(-0.75, 2.5, 2.5);
            scene.add(directionalLight);

            sceneRef.current = scene;
            cameraRef.current = camera;
        };

        // Clear Scene
        const clearScene = () => {
            const mixers = mixersRef.current;
            const loadedModels = loadedModelsRef.current;

            mixers.forEach((mixer) => mixer.stopAllAction());
            mixers.length = 0;

            loadedModels.forEach((model) => {
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
            loadedModels.length = 0;

            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };

        // Load Friendsie
        const loadFriendsie = async (id: string) => {
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

            if (!allFriendsies || !allFriendsies[id]) {
                console.error(`Friendsie with ID "${id}" not found.`);
                return;
            }

            clearScene();

            const friendsie = allFriendsies[id];
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
                                assignFaceTexture(model, faceTrait);
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
        };

        // Assign Face Texture
        const assignFaceTexture = (model: THREE.Object3D, faceUrl: string) => {
            textureLoader.load(
                faceUrl,
                (faceTexture) => {
                    faceTexture.flipY = false;
                    faceTexture.wrapS = faceTexture.wrapT = THREE.RepeatWrapping;

                    model.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh && child.name === "X") {
                            const mesh = child as THREE.Mesh;

                            // Ensure material is MeshStandardMaterial
                            if (mesh.material instanceof THREE.MeshStandardMaterial) {
                                const originalMaterial = mesh.material;

                                const primaryMaterial = new THREE.MeshStandardMaterial({
                                    map: originalMaterial.map,
                                    normalMap: originalMaterial.normalMap,
                                    transparent: true,
                                });

                                const faceMaterial = new THREE.MeshStandardMaterial({
                                    map: faceTexture,
                                    transparent: true,
                                    depthTest: false,
                                    opacity: 1,
                                });

                                mesh.geometry.clearGroups();
                                mesh.geometry.addGroup(0, Infinity, 0); // Base material
                                mesh.geometry.addGroup(0, Infinity, 1); // Face material

                                mesh.material = [primaryMaterial, faceMaterial];
                                mesh.material.needsUpdate = true;
                            } else {
                                console.warn("Material is not MeshStandardMaterial and cannot be processed.");
                            }
                        }
                    });
                },
                undefined,
                (error) => console.error("Error loading face texture:", error)
            );
        };

        // Animation Loop
        const animate = () => {
            if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

            animationFrameIdRef.current = requestAnimationFrame(animate);

            mixersRef.current.forEach((mixer) => mixer.update(0.01));
            controls.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };

        initScene();
        loadFriendsie(friendsieId);
        animate();

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            clearScene();
            controls.dispose();
        };
    }, [friendsieId]);

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default FriendsieViewer;
