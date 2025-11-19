import * as THREE from 'three/webgpu'
import {Scene} from "./class/scene.js";
import {Camera} from "./class/camera.js";

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

        this.camera = new Camera()
        this.camera.setOrbitControls(this.renderer.domElement)

        this.renderer.setAnimationLoop(this.render.bind(this))
    }

    render() {
        this.renderer.render(this.scene.scene, this.camera.camera)
    }

    initParams(){
        this.groundTextures = [
            'aerial_grass_rock',
            'brown_mud_leaves',
            'forest_floor',
            'forrest_ground',
            'gravelly_sand'
        ]

        this.groundParams = {
            texture: this.groundTextures[0],
            repeats: 1000
        }
    }

}
