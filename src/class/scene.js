import * as THREE from "three/webgpu";

export class Scene{

    constructor() {
        this.scene = new THREE.Scene()
    }

    addCube(){
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );
    }

}