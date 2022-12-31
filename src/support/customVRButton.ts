import { WebGLRenderer } from "three";

let xrSessionIsGranted = false;

const registerSessionGrantedListener = () => {
  if (navigator.xr) {
    // WebXRViewer (based on Firefox) has a bug where addEventListener
    // throws a silent exception and aborts execution entirely.
    if (/WebXRViewer\//i.test(navigator.userAgent)) return;

    navigator.xr.addEventListener("sessiongranted", () => {
      xrSessionIsGranted = true;
    });
  }
};

registerSessionGrantedListener();

export const createButton = async (renderer: WebGLRenderer) => {
  let currentSession: any = null;
  const button = document.createElement("button");
  button.style.display = "";
  button.style.cursor = "pointer";
  button.style.left = "calc(50% - 50px)";
  button.style.width = "100px";
  button.textContent = "ENTER VR";

  const showEnterVR = () => {
    const onSessionStarted = async (session: any) => {
      session.addEventListener("end", onSessionEnded);
      await renderer.xr.setSession(session);
      button.textContent = "EXIT VR";

      currentSession = session;
    };

    const onSessionEnded = () => {
      currentSession.removeEventListener("end", onSessionEnded);
      button.textContent = "ENTER VR";
      currentSession = null;
    };

    button.onmouseleave = () => {
      button.style.opacity = "0.5";
    };

    button.onmouseenter = () => {
      button.style.opacity = "1.0";
    };

    button.onclick = async () => {
      if (currentSession === null && navigator.xr) {
        // WebXR's requestReferenceSpace only works if the corresponding feature
        // was requested at session creation time. For simplicity, just ask for
        // the interesting ones as optional features, but be aware that the
        // requestReferenceSpace call will fail if it turns out to be unavailable.
        // ('local' is always available for immersive sessions and doesn't need to
        // be requested separately.)
        const sessionInit = {
          optionalFeatures: [
            "local-floor",
            "bounded-floor",
            "hand-tracking",
            "layers",
          ],
        };
        try {
          const session = await navigator.xr.requestSession(
            "immersive-vr",
            sessionInit
          );
          onSessionStarted(session);
        } catch (err) {
          console.log(err);
        }
      } else {
        currentSession.end();
      }
    };
  };

  const disableButton = () => {
    button.style.display = "";

    button.style.cursor = "auto";
    button.style.left = "calc(50% - 75px)";
    button.style.width = "150px";

    button.onmouseenter = null;
    button.onmouseleave = null;

    button.onclick = null;
  };

  const showWebXRNotFound = () => {
    disableButton();
    button.textContent = "VR NOT SUPPORTED";
  };

  const showVRNotAllowed = (exception: any) => {
    disableButton();
    console.warn(
      "Exception when trying to call xr.isSessionSupported",
      exception
    );
    button.textContent = "VR NOT ALLOWED";
  };

  const stylizeElement = (element: HTMLButtonElement | HTMLAnchorElement) => {
    element.style.position = "absolute";
    element.style.bottom = "20px";
    element.style.padding = "12px 6px";
    element.style.border = "1px solid #fff";
    element.style.borderRadius = "4px";
    element.style.background = "rgba(0,0,0,0.1)";
    element.style.color = "#fff";
    element.style.font = "normal 13px sans-serif";
    element.style.textAlign = "center";
    element.style.opacity = "0.5";
    element.style.outline = "none";
  };

  if (navigator.xr) {
    button.id = "VRButton";

    stylizeElement(button);

    try {
      const supported = await navigator.xr.isSessionSupported("immersive-vr");
      supported ? showEnterVR() : showWebXRNotFound();
      if (supported && xrSessionIsGranted) {
        button.click();
      }
    } catch (err) {
      showVRNotAllowed(err);
    }

    return button;
  } else {
    const message = document.createElement("a");

    if (window.isSecureContext === false) {
      message.href = document.location.href.replace(/^http:/, "https:");
      message.innerHTML = "WEBXR NEEDS HTTPS";
    } else {
      message.href = "https://immersiveweb.dev/";
      message.innerHTML = "WEBXR NOT AVAILABLE";
    }

    message.style.left = "calc(50% - 90px)";
    message.style.width = "180px";
    message.style.textDecoration = "none";

    stylizeElement(message);

    return message;
  }
};
