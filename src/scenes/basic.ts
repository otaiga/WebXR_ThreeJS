import {
  BoxGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CreateSceneClass } from "../createScene";

export class BasicScreen implements CreateSceneClass {
  createScene = async (
    renderer: WebGLRenderer
  ): Promise<{
    scene: Scene;
    camera: PerspectiveCamera;
    update: () => void;
  }> => {
    const scene = new Scene();

    const camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.set(0, 1.6, 3);

    // Add a cube
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);
    cube.position.set(0, 0, 0);
    scene.add(cube);

    // Add light
    scene.add(new HemisphereLight(0x606060, 0x404040));
    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    renderer.outputEncoding = sRGBEncoding;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Update next tick before render
    const update = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    };

    return { scene, camera, update };
  };
}

export default new BasicScreen();
