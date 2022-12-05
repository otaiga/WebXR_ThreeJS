import { WebGLRenderer } from "three";
import { getSceneModuleWithName } from "./createScene";
import "./styles.css";

const threeInit = async (): Promise<void> => {
  // get the module to load
  const createSceneModule = await getSceneModuleWithName(
    location.search.split("scene=")[1]?.split("&")[0]
  );

  // Create the render
  const renderer = new WebGLRenderer({ antialias: true });

  // Create the scene
  await createSceneModule.createScene(renderer);

  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  // Watch for browser/canvas resize events
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

threeInit().then(() => {
  console.log("everything is initialized");
});
