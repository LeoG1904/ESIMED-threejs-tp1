import * as THREE from 'three/webgpu'
import {Scene} from "./class/scene.js";
import {Camera} from "./class/camera.js";

export class Application {
    
    constructor() {
        this.renderer = new THREE.WebGPURenderer({antialias: true})
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)

        this.scene = new Scene()
        this.scene.addCube()
        this.camera = new Camera()

        this.renderer.setAnimationLoop(this.render.bind(this))
    }

    render() {
    }

}
