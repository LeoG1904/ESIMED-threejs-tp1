
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
export class OrbitCtl{
        constructor(camera,domElement) {
            const controls = new OrbitControls(camera,domElement)
            controls.target.set(0,0,0)
            controls.update()
        }
    }