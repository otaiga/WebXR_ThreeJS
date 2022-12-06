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
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CreateSceneClass } from "../createScene";

export class MainScreen implements CreateSceneClass {
  createScene = async (
    renderer: WebGLRenderer
  ): Promise<{
    scene: Scene;
    camera: PerspectiveCamera;
    update: () => void;
  }> => {
    // Allow loading of gltf files
    const loader = new GLTFLoader();
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

    // Append the VR button to the dom
    document.body.appendChild(VRButton.createButton(renderer));

    // Enable XR
    renderer.xr.enabled = true;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 2, 0);
    controls.update();

    const loadAssets = () =>
      new Promise<GLTF>((resolve, reject) => {
        // Load a glTF resource
        loader.load(
          // resource URL
          "assets/models/snowScene.glb",
          // called when the resource is loaded
          (gltf) => {
            resolve(gltf);
          },
          // called while loading is progressing
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          // called when loading has errors
          (error) => {
            console.log("An error happened: ", error.message);
            reject(error);
          }
        );
      });

    const gltf = await loadAssets();
    scene.add(gltf.scene);
    let snowMat;
    const loadedMaterials = await gltf.parser.getDependencies("material");
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

    return { scene, camera, update };
  };
}

export default new MainScreen();
