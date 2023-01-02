import { LoadingManager } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { setLoadingText, updateProgress } from "./customLoadingBar";

type ModelAssets = {
  [key: string]: GLTF;
};

export interface AssetContainer {
  models: ModelAssets;
}

const assets: AssetContainer = {
  models: {},
};

// Models to load
let models = ["snowScene.glb", "torch.glb"];

// Loading manager to track progress
const loadingManager = new LoadingManager();

// Load glTF resource
export const loadModel = async (
  loader: GLTFLoader,
  model: string
): Promise<GLTF> =>
  new Promise((resolve) => {
    loader.load(
      // resource URL
      `models/${model}`,
      // called when the resource is loaded - onLoad
      (gltf) => {
        resolve(gltf);
      }
      // Issues with loading GLTF files so using LoadingManager to track loading progress
      // called while loading is progressing (http request object {loaded and total keys}) - onProgress
      // (xhr) => {
      //   console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      // },
      // called when loading has errors - onError
      // (error) => {
      //   console.log("An error happened: ", error.message);
      //   reject(error);
      // }
    );
  });

// Allow loading of all resources
export const loadAssets = () =>
  new Promise<AssetContainer>(async (resolve, reject) => {
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const percent = Number((itemsLoaded / itemsTotal) * 100).toFixed(0);
      updateProgress(`${percent}%`);
      setLoadingText(`Loaded ${itemsLoaded} of ${itemsTotal} files.`);
    };

    loadingManager.onError = (url) => {
      reject("There was an error loading " + url);
    };

    const loader = new GLTFLoader(loadingManager).setPath("assets/");
    for (const model of models) {
      try {
        const gltf = await loadModel(loader, model);
        assets.models[model] = gltf;
      } catch (err) {
        console.log("Error loading model: ", err);
        reject(err);
      }
    }
    resolve(assets);
  });
