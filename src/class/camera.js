import * as THREE from "three";

export class Camera{

    constructor() {
        this.camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000)
        this.camera.position.z = 5
    }
}