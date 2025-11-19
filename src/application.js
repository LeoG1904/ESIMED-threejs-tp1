import * as THREE from 'three/webgpu'
import {Scene} from "./class/scene.js";
import {Camera} from "./class/camera.js";
import {Ui} from "./class/ui.js";

export class Application {
    
    constructor() {
        this.renderer = new THREE.WebGPURenderer({antialias: true})
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        document.body.appendChild(this.renderer.domElement)

        this.initParams()

        this.scene = new Scene()
        //this.scene.addCube()
        this.scene.loadScene('/scenes/scene_1.json')
        this.scene.addAmbiantLight()
        this.scene.addDirectionalLight()
        this.scene.addGround(this.groundParams.texture,this.groundParams.repeats)
        this.scene.addSkybox(this.skyParams.file)

        this.camera = new Camera()
        this.camera.setOrbitControls(this.renderer.domElement)

        this.ui = new Ui()
        this.ui.addSkyboxUI(this.skyboxFiles,this.skyParams,this.scene.addSkybox.bind(this.scene))
        this.ui.addGroundUI(this.groundTextures,this.groundParams,this.scene.changeGround.bind(this.scene));
        this.ui.addSunUI(this.sunParams, this.scene.changeSun.bind(this.scene));
        this.ui.addSelectionInfo();

        this.selectedObject = null
        this.selectedMesh = null
        this.selectedMeshMaterial = null

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        window.addEventListener('click', this.onClick.bind(this));


        this.renderer.setAnimationLoop(this.render.bind(this))
    }

    render() {
        this.renderer.render(this.scene.scene, this.camera.camera)
    }

    initParams(){
        this.groundTextures = [
            'aerial_grass_rock',
            'brown_mud_leaves_01',
            'forest_floor',
            'forrest_ground_01',
            'gravelly_sand'
        ]

        this.groundParams = {
            texture: this.groundTextures[0],
            repeats: 1000
        }

        this.skyboxFiles = [
            'DaySkyHDRI019A_2K-TONEMAPPED',
            'DaySkyHDRI050A_2K-TONEMAPPED',
            'NightSkyHDRI009_2K-TONEMAPPED'
        ]

        this.skyParams = {
            file: this.skyboxFiles[0]
        }

        this.sunParams = {
            intensity: 2.0,
            x: 3,
            z: 0,
            color: "#ffffff"
        };
    }

    onClick(event) {
        // Normaliser la position de la souris (-1 à 1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // Mettre à jour le raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera.camera);

        // Récupérer tous les objets de la scène
        const intersects = this.raycaster.intersectObjects(this.scene.scene.children, true);

        if (intersects.length > 0) {
            // Chercher le premier mesh "sélectable"
            const hit = intersects.find(i => i.object.userData.isSelectable);

            if (hit) {
                const mesh = hit.object;

                // Restaurer l'ancien matériau si nécessaire
                if (this.selectedMesh && this.selectedMeshMaterial) {
                    this.selectedMesh.material = this.selectedMeshMaterial;
                }

                // Sauvegarder le mesh et son matériau original
                this.selectedObject = mesh.userData.object;
                this.selectedMesh = mesh;
                this.selectedMeshMaterial = mesh.material;

                // Changer le matériau du mesh sélectionné (exemple : jaune)
                mesh.material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
                this.ui.updateSelection(this.selectedObject);
            }else {
                // Si rien n'est sélectionné
                if (this.selectedMesh && this.selectedMeshMaterial) {
                    this.selectedMesh.material = this.selectedMeshMaterial;
                }
                this.selectedObject = null;
                this.selectedMesh = null;
                this.selectedMeshMaterial = null;

                this.ui.updateSelection(null);
            }
        }
    }
}
