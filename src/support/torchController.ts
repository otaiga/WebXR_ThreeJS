import {
  XRTargetRaySpace,
  XRGripSpace,
  Group,
  SpotLight,
  CylinderGeometry,
  Mesh,
  Event,
} from "three";
import { AssetContainer } from "./assetLoader";
import { volumetricSpotLightMaterial } from "./shaders/volumetricSpotlightMaterial";

export const createSpotLight = (
  event: Event & {
    type: "connected";
  } & {
    target: XRTargetRaySpace;
  },
  controllerGroup: {
    controller: XRTargetRaySpace;
    grip: XRGripSpace;
  },
  assets: AssetContainer
) => {
  if (event.data.targetRayMode === "tracked-pointer") {
    const torchAsset = assets.models["torch.glb"];
    const torch = torchAsset.scene;
    torch.scale.set(0.2, 0.2, 0.2);
    controllerGroup.controller.remove(...controllerGroup.controller.children);
    controllerGroup.grip.remove(...controllerGroup.grip.children);

    // add spotlight
    const spotlightGroup = new Group();
    spotlightGroup.name = "spotlight";
    const spotlight = new SpotLight(0xffffff, 2, 12, Math.PI / 15, 0.3);
    spotlight.position.set(0, 0, 0);
    spotlight.target.position.set(0, 0, -1);
    spotlightGroup.add(spotlight.target);
    spotlightGroup.add(spotlight);

    const geometry = new CylinderGeometry(0.03, 1, 5, 32, 5, true);
    geometry.rotateX(Math.PI / 2);
    const material = volumetricSpotLightMaterial();
    const mesh = new Mesh(geometry, material);
    mesh.translateZ(-2.6);
    spotlightGroup.add(mesh);

    spotlightGroup.visible = false;

    controllerGroup.controller.add(torch);
    controllerGroup.controller.add(spotlightGroup);
  }
};
