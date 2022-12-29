import { sRGBEncoding, WebGLRenderer } from "three";
import { getSceneModuleWithName } from "./createScene";
import "./styles.css";

const threeInit = async (): Promise<void> => {
  // get the module to load
  const createSceneModule = await getSceneModuleWithName(
    location.search.split("scene=")[1]?.split("&")[0]
  );

  // Get canvas
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

  // Create the render and provide where to render it (canvas)
  const renderer = new WebGLRenderer({ antialias: true, canvas });

  // Set the size the same as browser window
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = sRGBEncoding;

  // Watch for browser/canvas resize events
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Create the scene
  const threeScene = await createSceneModule.createScene(renderer);

  const onWindowResize = () => {
    threeScene.camera.aspect = window.innerWidth / window.innerHeight;
    threeScene.camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener("resize", onWindowResize);

  // Update loop
  renderer.setAnimationLoop(() => {
    threeScene.update();
    renderer.render(threeScene.scene, threeScene.camera);
  });
};

threeInit().then(() => {
  console.log("everything is initialized");
});
