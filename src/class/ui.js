import GUI from "lil-gui";

export class Ui{
    constructor() {
        this.GUI = new GUI();
    }

    addSkyboxUI(files,params,onChange){
        const folder = this.GUI.addFolder("Skybox");

        // Ajout du contrôle : liste déroulante
        folder
            .add(params, "file", files)   // file ∈ files
            .name("Skybox")
            .onChange((value) => {
                // Appeler le callback fourni (addSkybox)
                onChange(value);
            });
    }
}