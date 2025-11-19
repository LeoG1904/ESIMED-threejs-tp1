import * as THREE from "three/webgpu";

export class Scene{

    constructor() {
        this.scene = new THREE.Scene()

        const sun = new THREE.DirectionalLight(0xffffff,2.0)
        sun.position.set(3,50,0)
        sun.target.position.set(0,0,0)
        this.scene.add(sun)
    }

    addCube(){
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshPhongMaterial( {
            color: 0xff0000,
            flatShading : true
        } );
        const cube = new THREE.Mesh( geometry, material );
        this.scene.add( cube );
    }

    addAmbiantLight(){
        const ambient = new THREE.AmbientLight(0xffffff,0.7)
        this.scene.add(ambient)

    }

}