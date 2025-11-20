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
    addSunUI(params, onChange) {
        const folder = this.GUI.addFolder("Sun");
        folder.addColor(params, "color")
            .name("Color")
            .onChange(() => onChange(params));
        folder.add(params, "intensity", 0, 10, 0.1)
            .name("Intensity")
            .onChange(() => onChange(params));

        folder.add(params, "x", -100, 100, 1)
            .name("X")
            .onChange(() => onChange(params));

        folder.add(params, "z", -100, 100, 1)
            .name("Z")
            .onChange(() => onChange(params));
    }

    addSelectionInfo() {
        this.selectionFolder = this.GUI.addFolder("Selected Object");

        // Les champs affichés
        this.selectionData = {
            name: "",
            position: "",
            rotation: "",
            scale: ""
        };

        this.selectionFolder.add(this.selectionData, "name").listen();
        this.selectionFolder.add(this.selectionData, "position").listen();
        this.selectionFolder.add(this.selectionData, "rotation").listen();
        this.selectionFolder.add(this.selectionData, "scale").listen();

        // Cacher par défaut
        this.selectionFolder.hide();
    }

    // Mettre à jour le panneau
    updateSelection(object) {
        if (object) {
            this.selectionData.name = object.name || "Unnamed";
            this.selectionData.position = object.position
                ? `x: ${object.position.x.toFixed(2)}, y: ${object.position.y.toFixed(2)}, z: ${object.position.z.toFixed(2)}`
                : "";
            this.selectionData.rotation = object.rotation
                ? `x: ${object.rotation.x.toFixed(2)}, y: ${object.rotation.y.toFixed(2)}, z: ${object.rotation.z.toFixed(2)}`
                : "";
            this.selectionData.scale = object.scale
                ? `x: ${object.scale.x.toFixed(2)}, y: ${object.scale.y.toFixed(2)}, z: ${object.scale.z.toFixed(2)}`
                : "";

            this.selectionFolder.show();
        } else {
            this.selectionFolder.hide();
        }
    }

    addExportButton(onClick) {
        this.GUI.add({ exportScene: onClick }, 'exportScene').name('Export Scene');
    }
    addClearButton(onClick) {
        this.GUI.add({ clearScene: onClick }, 'clearScene').name('Clear Scene');
    }
    addImportButton(onImport) {
        this.GUI.add({ importScene: onImport }, 'importScene').name('Import Scene');
    }
}