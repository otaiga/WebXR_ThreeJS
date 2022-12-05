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
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { CreateSceneClass } from "../createScene";

export class MainScreen implements CreateSceneClass {
  createScene = async (
    renderer: WebGLRenderer
  ): Promise<{
    scene: Scene;
    camera: PerspectiveCamera;
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
    cube.position.set(0, 2, 0);
    scene.add(cube);

    // Add light
    scene.add(new HemisphereLight(0x606060, 0x404040));
    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    renderer.outputEncoding = sRGBEncoding;
    renderer.xr.enabled = true;

    document.body.appendChild(VRButton.createButton(renderer));

    return { scene, camera };
  };
}

export default new MainScreen();
