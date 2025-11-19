import * as THREE from "three/webgpu";
import {createStandardMaterial, loadGltf, textureloader} from "../tools.js";

export class Scene{

    constructor() {
        this.scene = new THREE.Scene()
        this.loadedModels = {}


    }

    addCube(){
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshPhongMaterial( {
            color: 0xff0000,
            flatShading : true
        } );
        const cube = new THREE.Mesh( geometry, material );
        cube.position.set(0,1,0)
        this.scene.add( cube );
    }

    addAmbiantLight(){
        const ambient = new THREE.AmbientLight(0xffffff,0.3)
        this.scene.add(ambient)

    }

    addDirectionalLight(){
        this.sun = new THREE.DirectionalLight(0xffffff,2.0)
        this.sun.position.set(20,100,0)
        this.sun.target.position.set(0,0,0)
        this.sun.castShadow = true;

        // Optionnel : ajuster la qualité
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;

        // Optionnel : étendre la zone de projection
        this.sun.shadow.camera.left = -100;
        this.sun.shadow.camera.right = 100;
        this.sun.shadow.camera.top = 100;
        this.sun.shadow.camera.bottom = -100;
        this.sun.shadow.camera.far = 300;

        this.scene.add(this.sun)

        const sunHelper = new THREE.DirectionalLightHelper(this.sun, 5)
        this.scene.add(sunHelper)
    }

    changeSun(params) {
        if (!this.sun) return;

        if (params.intensity !== undefined) this.sun.intensity = params.intensity;
        if (params.x !== undefined) this.sun.position.x = params.x;
        if (params.z !== undefined) this.sun.position.z = params.z;
        if (params.color !== undefined) this.sun.color.set(params.color); // applique la couleur
    }


    addGround(texture, repeats) {
        const geometry = new THREE.PlaneGeometry(5000, 5000);

        const material = createStandardMaterial(texture, repeats);

        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2; // rotation pour que le plan soit horizontal
        this.ground.receiveShadow = true;

        this.scene.add(this.ground);
    }

    changeGround(texture, repeats) {
        if (!this.ground) return;

        this.ground.material = createStandardMaterial(texture, repeats);
    }

    addSkybox(filename){
        const path = `/skybox/${filename}.jpg`;

        textureloader.load(
            path,
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.background = texture;
            },
            undefined,
            (error) => {
                console.error("Erreur skybox :", error);
            }
        );
    }

    async loadScene(url) {

        const response = await fetch(url);
        const data = await response.json();

        const nodes = data.nodes || [];

        for (const obj of nodes) {

            const name = obj.name;

            // Charger uniquement si pas déjà chargé
            if (!this.loadedModels[name]) {
                this.loadedModels[name] = await loadGltf(name);
            }

            // loadGltf retourne déjà un OBJET SCENE prêt à cloner
            const original = this.loadedModels[name];
            const instance = original.clone(true);

            // Position
            if (obj.position) {
                instance.position.fromArray(
                    obj.position.split(',').map(Number)
                );
            }

            // Rotation (quaternion)
            if (obj.rotation) {
                instance.quaternion.fromArray(
                    obj.rotation.split(',').map(Number)
                );
            }

            // Scale
            if (obj.scale) {
                instance.scale.fromArray(
                    obj.scale.split(',').map(Number)
                );
            }

            instance.traverse(o => {
                if (o.isMesh) {
                    o.userData = {
                        isSelectable: true,
                        object: instance,  // référence au mesh/cloné complet
                    };
                }
            });

            this.scene.add(instance);
        }
    }
    exportScene() {
        const exportData = {
            nodes: []
        };

        // Parcourir tous les objets de la scène
        this.scene.traverse(obj => {
            if (obj.isMesh && obj.userData.isSelectable) {
                const node = {
                    name: obj.userData.object.name || "Unnamed",
                    position: `${obj.position.x},${obj.position.y},${obj.position.z}`,
                    rotation: `${obj.quaternion.x},${obj.quaternion.y},${obj.quaternion.z},${obj.quaternion.w}`,
                    scale: `${obj.scale.x},${obj.scale.y},${obj.scale.z}`
                };
                exportData.nodes.push(node);
            }
        });

        // Créer le fichier JSON et déclencher le téléchargement
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scene_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}