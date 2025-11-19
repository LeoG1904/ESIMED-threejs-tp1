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
    addGroundUI(files, params, onChange) {

        const folder = this.GUI.addFolder("Ground");

        // Liste des textures disponibles
        folder
            .add(params, "texture", files)
            .name("Texture")
            .onChange(() => {
                onChange(params.texture, params.repeats);
            });

        // Contrôle du repeat
        folder
            .add(params, "repeats", 1, 1000, 1)
            .name("Repeats")
            .onChange(() => {
                onChange(params.texture, params.repeats);
            });
    }
}