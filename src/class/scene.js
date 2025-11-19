import * as THREE from "three/webgpu";
import {createStandardMaterial, loadGltf} from "../tools.js";

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
        const sun = new THREE.DirectionalLight(0xffffff,2.0)
        sun.position.set(20,100,0)
        sun.target.position.set(0,0,0)
        sun.castShadow = true;
        
        // Optionnel : ajuster la qualité
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;

        // Optionnel : étendre la zone de projection (important pour grandes scènes)
        sun.shadow.camera.left = -200;
        sun.shadow.camera.right = 200;
        sun.shadow.camera.top = 200;
        sun.shadow.camera.bottom = -200;
        sun.shadow.camera.far = 300;

        this.scene.add(sun)

        const sunHelper = new THREE.DirectionalLightHelper(sun, 5)
        this.scene.add(sunHelper)
    }

    addGround(texture, repeats) {
        const geometry = new THREE.PlaneGeometry(5000, 5000);

        const material = createStandardMaterial(texture, repeats);

        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2; // rotation pour que le plan soit horizontal

        ground.receiveShadow = true;

        this.scene.add(ground);
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

            this.scene.add(instance);
        }
    }
}