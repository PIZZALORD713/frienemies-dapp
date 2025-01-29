import * as THREE from "three";

export const applyFaceTexture = (model: THREE.Object3D, faceUrl: string, textureLoader: THREE.TextureLoader) => {
    textureLoader.load(
        faceUrl,
        (faceTexture) => {
            faceTexture.flipY = false;
            faceTexture.wrapS = faceTexture.wrapT = THREE.RepeatWrapping;

            model.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && child.name === "X") {
                    const mesh = child as THREE.Mesh;

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
                        mesh.geometry.addGroup(0, Infinity, 0);
                        mesh.geometry.addGroup(0, Infinity, 1);

                        mesh.material = [primaryMaterial, faceMaterial];

                        (mesh.material as THREE.Material[]).forEach((material) => {
                            material.needsUpdate = true;
                        });
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
