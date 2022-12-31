import {
  BackSide,
  DirectionalLight,
  HemisphereLight,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  SphereGeometry,
  WebGLRenderer,
  XRTargetRaySpace,
} from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CreateSceneClass } from "../createScene";
import { loadAssets } from "../support/assetLoader";
import {
  hideCustomLoadingBar,
  showCustomLoadingBar,
} from "../support/customLoadingBar";
import { createButton, createControllers } from "../support/xrSupport";

export class MainScreen implements CreateSceneClass {
  createScene = async (
    renderer: WebGLRenderer
  ): Promise<{
    scene: Scene;
    camera: PerspectiveCamera;
    update: () => void;
  }> => {
    const generator = new PMREMGenerator(renderer);
    const workingMatrix = new Matrix4();
    const raycaster = new Raycaster();

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

    const loadingElem = showCustomLoadingBar();

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

    // Add a sphere
    const geometry = new SphereGeometry(0.8, 20);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const sphere = new Mesh(geometry, material);
    sphere.position.set(0, 1, -4);
    scene.add(sphere);

    const sphereHighlight = new Mesh(
      geometry,
      new MeshBasicMaterial({ color: 0xffffff, side: BackSide })
    );
    sphereHighlight.scale.set(1.2, 1.2, 1.2);
    scene.add(sphereHighlight);
    sphereHighlight.visible = false;

    // Create Controllerss
    const controllers = createControllers(renderer, scene);

    for (const controller of controllers) {
      controller.addEventListener("selectstart", () => {
        controller.children[0].scale.z = 10;
        controller.userData.selectPressed = true;
      });

      controller.addEventListener("selectend", () => {
        controller.children[0].scale.z = 0;
        sphereHighlight.visible = false;
        controller.userData.selectPressed = false;
      });
    }

    const leftController = controllers[0];

    const handleController = (controller: XRTargetRaySpace) => {
      if (controller.userData.selectPressed) {
        workingMatrix.identity().extractRotation(controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(workingMatrix);

        const intersects = raycaster.intersectObjects([sphere]);

        if (intersects.length > 0) {
          intersects[0].object.add(sphereHighlight);
          sphereHighlight.visible = true;
        } else {
          sphereHighlight.visible = false;
        }
      }
    };

    // Create custom VR Button
    const vrButton = await createButton(renderer);

    // Append the VR button to the dom
    document.body.insertBefore(vrButton, loadingElem);

    // Update next tick before render
    const update = () => {
      if (leftController) {
        handleController(leftController);
      }
    };

    // Hide the loading screen
    hideCustomLoadingBar();

    return { scene, camera, update };
  };
}

export default new MainScreen();
