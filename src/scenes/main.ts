import {
  BackSide,
  Clock,
  DirectionalLight,
  HemisphereLight,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
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
import { createSpotLight } from "../support/torchController";

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
    const clock = new Clock();
    const origin = new Vector3();

    // Create skybox
    new RGBELoader().load("assets/textures/snowy_park.hdr", (hdrmap) => {
      const envmap = generator.fromEquirectangular(hdrmap);
      scene.background = envmap.texture;
      scene.environment = envmap.texture;
    });

    const scene = new Scene();

    // create camera
    const camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.6, 3);

    // create dolly for moving camera
    const dolly = new Object3D();
    dolly.add(camera);
    scene.add(dolly);

    const dummyCam = new Object3D();
    camera.add(dummyCam);

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
    const geometry = new SphereGeometry(0.2, 20);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const sphere = new Mesh(geometry, material);
    sphere.position.set(5, 1, -8);
    scene.add(sphere);

    const sphereHighlight = new Mesh(
      geometry,
      new MeshBasicMaterial({ color: 0xffffff, side: BackSide })
    );
    sphereHighlight.scale.set(1.2, 1.2, 1.2);

    // Create Controllerss
    const controllers = createControllers(renderer, scene);

    for (const controllerGroup of controllers) {
      controllerGroup.controller.addEventListener("selectstart", () => {
        for (const child of controllerGroup.controller.children) {
          if (child.name === "line") {
            child.scale.z = 10;
          }
          if (child.name === "spotlight" && !child.visible) {
            child.visible = true;
          }
        }
        controllerGroup.controller.userData.selectPressed = true;
      });

      controllerGroup.controller.addEventListener("selectend", () => {
        for (const child of controllerGroup.controller.children) {
          if (child.name === "line") {
            child.scale.z = 0;
            sphereHighlight.visible = false;
          }
          if (child.name === "spotlight" && child.visible) {
            child.visible = false;
          }
        }
        controllerGroup.controller.userData.selectPressed = false;
      });

      controllerGroup.controller.addEventListener("disconnected", () => {
        controllerGroup.controller.remove(
          ...controllerGroup.controller.children
        );
      });

      controllerGroup.controller.addEventListener("connected", (event) => {
        const handedness = event.data.handedness;
        controllerGroup.controller.name = `${handedness}Controller`;
        if (handedness === "left") {
          createSpotLight(event, controllerGroup, assets);
        }
      });
      dolly.add(controllerGroup.controller);
      dolly.add(controllerGroup.grip);
    }

    const handleController = () => {
      const rightControllerGroup =
        controllers[0].controller.name === "rightController"
          ? controllers[0]
          : controllers[1];
      if (
        rightControllerGroup.controller &&
        rightControllerGroup.controller.userData.selectPressed
      ) {
        workingMatrix
          .identity()
          .extractRotation(rightControllerGroup.controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(
          rightControllerGroup.controller.matrixWorld
        );
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
      const dt = clock.getDelta();
      // check for xr session
      const session = renderer.xr.getSession();
      if (session) {
        let i = 0;
        // get button pushes and axis
        for (const inputSource of session.inputSources) {
          const gamepad = inputSource?.gamepad;
          if (inputSource && gamepad) {
            // map data to use with controllers
            const data = {
              handedness: inputSource.handedness,
              buttons: inputSource.gamepad.buttons.map((b) => b.value),
              axes: inputSource.gamepad.axes.slice(0),
            };

            // map thumb sticks
            if (data.handedness === "left") {
              const speed = 2;
              let pos = dolly.position.clone();
              data.axes.map((value, i) => {
                if (Math.abs(value) > 0.2) {
                  //left and right axis on thumbsticks
                  if (i === 2) {
                    if (data.axes[2] > 0) {
                      dolly.rotation.y -= dt * 1;
                      console.log("left on left thumbstick");
                    } else {
                      dolly.rotation.y += dt * 1;
                      console.log("right on left thumbstick");
                    }
                    pos = dolly.getWorldPosition(origin);
                  }
                  //up and down axis on thumbsticks
                  if (i === 3) {
                    if (data.axes[3] > 0) {
                      pos.z += 1;
                      dolly.translateZ(dt * speed);
                      console.log("up on left thumbstick");
                    } else {
                      pos.z -= 1;
                      dolly.translateZ(-dt * speed);
                      console.log("down on left thumbstick");
                    }
                  }
                }
              });
            }
          }
        }
        handleController();
      }
    };

    // Hide the loading screen
    hideCustomLoadingBar();

    return { scene, camera, update };
  };
}

export default new MainScreen();
