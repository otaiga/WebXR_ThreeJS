import {
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
} from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CreateSceneClass } from "../createScene";
import { loadAssets } from "../support/assetLoader";
import {
  hideCustomLoadingBar,
  showCustomLoadingBar,
} from "../support/customLoadingBar";

export class MainScreen implements CreateSceneClass {
  createScene = async (
    renderer: WebGLRenderer
  ): Promise<{
    scene: Scene;
    camera: PerspectiveCamera;
    update: () => void;
  }> => {
    const generator = new PMREMGenerator(renderer);

    // Create skybox
    new RGBELoader().load("assets/textures/snowy_park.hdr", (hdrmap) => {
      const envmap = generator.fromEquirectangular(hdrmap);
      scene.background = envmap.texture;
      scene.environment = envmap.texture;
    });

    const scene = new Scene();
    const camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.6, 3);

    // Add light
    scene.add(new HemisphereLight(0x606060, 0x404040));
    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // Enable XR
    renderer.xr.enabled = true;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 2, 0);
    controls.update();

    showCustomLoadingBar();

    const assets = await loadAssets();
    const snowSceneAsset = assets.models["snowScene.glb"];

    scene.add(snowSceneAsset.scene);
    let snowMat;
    const loadedMaterials = await snowSceneAsset.parser.getDependencies(
      "material"
    );
    for (const material of loadedMaterials) {
      if (material.name === "Snow") {
        snowMat = material;
      }
    }

    // Create ground
    if (snowMat) {
      const geometry = new PlaneGeometry(100, 100, 20, 20);
      const ground = new Mesh(geometry, snowMat);
      ground.rotation.x = -Math.PI / 2;
      scene.add(ground);
    }

    // Update next tick before render
    const update = () => {};

    hideCustomLoadingBar();

    // Append the VR button to the dom
    const vrButton = VRButton.createButton(renderer);
    document.body.appendChild(vrButton);

    return { scene, camera, update };
  };
}

export default new MainScreen();
