import { Scene, PerspectiveCamera, WebGLRenderer } from "three";

export interface CreateSceneClass {
  createScene: (
    renderer: WebGLRenderer
  ) => Promise<{ scene: Scene; camera: PerspectiveCamera }>;
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
