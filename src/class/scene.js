import * as THREE from "three/webgpu";
import {createStandardMaterial, loadGltf, textureloader} from "../tools.js";

export class Scene{

    constructor() {
        this.scene = new THREE.Scene()
        this.loadedModels = {}
        this.sun = null


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

    exportScene(params = {}) {
        const exportData = {
            params: params, // ajouter les paramètres globaux
            nodes: []
        };

        this.scene.traverse(obj => {
            if (obj.isMesh && obj.userData.isSelectable) {
                const worldPos = new THREE.Vector3();
                const worldQuat = new THREE.Quaternion();
                const worldScale = new THREE.Vector3();

                obj.userData.object.updateMatrixWorld();
                obj.userData.object.matrixWorld.decompose(worldPos, worldQuat, worldScale);

                exportData.nodes.push({
                    name: obj.userData.object.name || "Unnamed",
                    position: `${worldPos.x.toFixed(2)},${worldPos.y.toFixed(2)},${worldPos.z.toFixed(2)}`,
                    rotation: `${worldQuat.x.toFixed(4)},${worldQuat.y.toFixed(4)},${worldQuat.z.toFixed(4)},${worldQuat.w.toFixed(4)}`,
                    scale: `${worldScale.x.toFixed(2)},${worldScale.y.toFixed(2)},${worldScale.z.toFixed(2)}`
                });
            }
        });

        // Télécharger le JSON
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

    clearScene() {
        const objectsToRemove = [];

        this.scene.traverse(obj => {
            if (obj.isMesh && obj.userData.isSelectable) {
                objectsToRemove.push(obj.userData.object);
            }
        });

        // Supprimer toutes les instances complètes (évite les doublons)
        const unique = new Set(objectsToRemove);

        unique.forEach(obj => {
            this.scene.remove(obj);
        });
    }

    async importScene(event, params) {

        const file = event.target.files[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);

        this.clearScene();

        //    → on convertit le fichier en blob URL
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        await this.loadScene(url);

        URL.revokeObjectURL(url);

        if (data.params) {

            // SKYBOX
            if (data.params.skybox && params.skybox) {
                params.skybox.file = data.params.skybox.file;
                this.addSkybox(params.skybox.file);
            }

            // GROUND
            if (data.params.ground && params.ground) {
                params.ground.texture = data.params.ground.texture;
                params.ground.repeats = data.params.ground.repeats;
                this.changeGround(params.ground.texture, params.ground.repeats);
            }

            // SUN
            if (data.params.sun && params.sun) {
                params.sun.intensity = data.params.sun.intensity;
                params.sun.x = data.params.sun.x;
                params.sun.z = data.params.sun.z;
                params.sun.color = data.params.sun.color;

                this.changeSun(params.sun);
            }
        }
    }



}