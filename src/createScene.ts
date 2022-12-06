import { Scene, PerspectiveCamera, WebGLRenderer } from "three";

type ThreeScene = {
  scene: Scene;
  camera: PerspectiveCamera;
  update: () => void;
};

export interface CreateSceneClass {
  createScene: (renderer: WebGLRenderer) => Promise<ThreeScene>;
}

export interface CreateSceneModule {
  default: CreateSceneClass;
}

export const getSceneModuleWithName = (
  name = "main"
): Promise<CreateSceneClass> => {
  return import(`./scenes/${name}`).then((module: CreateSceneModule) => {
    return module.default;
  });
};
