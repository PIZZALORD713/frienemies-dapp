import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { useFriendsieLoader } from "../hooks/useFriendsieLoader";

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
    const controlsRef = useRef<OrbitControls | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!rendererRef.current) {
            rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            rendererRef.current.setPixelRatio(window.devicePixelRatio);
            rendererRef.current.outputColorSpace = THREE.SRGBColorSpace;
            rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
            rendererRef.current.toneMappingExposure = 0.5; // Adjust exposure
        }

        // Initialize Scene & Camera
        const scene = new THREE.Scene();
        const width = mountRef.current?.clientWidth || window.innerWidth;
        const height = mountRef.current?.clientHeight || window.innerHeight;
        const camera = new THREE.PerspectiveCamera(30, width / height, 1, 500);
        camera.position.set(0, 1, 10);

        sceneRef.current = scene;
        cameraRef.current = camera;

        // HDR Environment Lighting
        new RGBELoader().setPath('/hdr/').load('studio.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            scene.background = null; // Optional: use "texture" to Set background to HDR
        });

        // Directional Lights
        const directionalLights = [
            { x: 5, y: 5, z: 10 },
            { x: -5, y: 5, z: 10 },
            { x: 5, y: 5, z: -10 },
            { x: -5, y: 5, z: -10 }
        ];

        directionalLights.forEach(({ x, y, z }) => {
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(x, y, z);
            light.castShadow = false;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            scene.add(light);

            // Add Light Helper (Shows direction of the light)
            //const lightHelper = new THREE.DirectionalLightHelper(light, 1);
            //scene.add(lightHelper);
        });

        // Hemisphere Light for Ambient Lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 1);
        scene.add(hemiLight);

        // Initialize Controls
        const controls = new OrbitControls(camera, rendererRef.current.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 2;
        controls.maxDistance = 10;
        controls.target.set(0, 1.75, 0);
        controls.update();
        controlsRef.current = controls;

        // Attach Renderer to DOM
        if (mountRef.current) {
            mountRef.current.appendChild(rendererRef.current.domElement);
        }

        // Set Initial Renderer Size
        rendererRef.current.setSize(width, height);

        // Resize Handler
        const handleResize = () => {
            if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;

            const newWidth = mountRef.current.clientWidth || window.innerWidth;
            const newHeight = mountRef.current.clientHeight || window.innerHeight;

            cameraRef.current.aspect = newWidth / newHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newWidth, newHeight);
        };

        // Use ResizeObserver for better performance
        resizeObserverRef.current = new ResizeObserver(handleResize);
        if (mountRef.current) {
            resizeObserverRef.current.observe(mountRef.current);
        }

        // Animation Loop
        const animate = () => {
            if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

            animationFrameIdRef.current = requestAnimationFrame(animate);
            mixersRef.current.forEach((mixer) => mixer.update(0.01));
            controls.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };

        animate();

        return () => {
            // Cleanup
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            controls.dispose();
            if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
        };
    }, []);

    // 🔹 Use the custom hook to load Friendsie models
    useFriendsieLoader(friendsieId, sceneRef, mixersRef, loadedModelsRef);

    return (
        <div
            ref={mountRef}
            style={{
                width: "100%",
                maxWidth: "600px",
                height: "500px",
                margin: "0 auto",
                border: "1px solid #ccc",
                borderRadius: "10px",
                overflow: "hidden",
            }}
        />
    );
};

export default FriendsieViewer;
