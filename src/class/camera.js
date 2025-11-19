import * as THREE from "three";
import {OrbitCtl} from "./orbitControls.js";

export class Camera{

    constructor() {
        this.camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000)
        this.defaultPosition()
    }

    defaultPosition(){
        this.camera.position.set(2,2,5)
    }

    setOrbitControls(domElement){
        this.orbitControls = new OrbitCtl(this.camera,domElement)
    }
}