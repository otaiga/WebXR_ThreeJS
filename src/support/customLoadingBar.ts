const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
let loadingDiv = document.getElementById("loadingDiv");
let progress = "0%";
let loadingText = "";

// Resize
const resizeLoadingUI = () => {
  const canvasRect = canvas.getBoundingClientRect();
  const canvasPositioning = window.getComputedStyle(canvas).position;

  const loadingDiv = document.getElementById("loadingDiv");
  if (!loadingDiv) {
    return;
  }

  loadingDiv.style.position =
    canvasPositioning === "fixed" ? "fixed" : "absolute";
  loadingDiv.style.left = canvasRect.left + "px";
  loadingDiv.style.top = canvasRect.top + "px";
  loadingDiv.style.width = canvasRect.width + "px";
  loadingDiv.style.height = canvasRect.height + "px";
};

export const showCustomLoadingBar = () => {
  if (loadingDiv) {
    return loadingDiv;
  }
  loadingDiv = document.createElement("div");
  loadingDiv.id = "loadingDiv";

  loadingDiv.style.height = "100vh";
  loadingDiv.style.width = "100%";
  loadingDiv.style.pointerEvents = "none";
  loadingDiv.style.opacity = "1";
  loadingDiv.style.backgroundColor = "black";
  loadingDiv.style.zIndex = "-1";
  loadingDiv.style.transition = "opacity 1.5s ease";

  // loading container
  const loadingContainer = document.createElement("div");
  loadingContainer.style.display = "flex";
  loadingContainer.style.alignItems = "center";
  loadingContainer.style.justifyItems = "center";
  loadingContainer.style.justifyContent = "center";
  loadingContainer.style.minHeight = "100%";
  loadingContainer.style.textAlign = "center";
  // div holder
  const div = document.createElement("div");
  // container
  const container = document.createElement("div");
  container.style.color = "rgba(66, 135, 245, 1)";
  container.style.textAlign = "center";

  // holder
  // const holder = document.createElement("div");
  // holder.id = "holder";
  // holder.style.lineHeight = "1.5";
  // holder.style.borderRadius = "9999px";
  // holder.style.background = "white";
  // holder.style.height = "200px";
  // holder.style.width = "200px";
  // holder.style.display = "flex";
  // holder.style.alignItems = "center";
  // holder.style.justifyContent = "center";
  // holder.appendChild(logo);
  // container.appendChild(holder);

  // Heading
  const heading = document.createElement("h3");
  heading.innerHTML = "Please hang tight..";
  heading.style.fontSize = "1.125rem";
  heading.style.lineHeight = "1.5rem";
  heading.style.fontWeight = "500";

  container.appendChild(heading);

  // Loading text
  const loadingTextP = document.createElement("p");
  loadingTextP.id = "loadingText";
  loadingTextP.innerHTML = "";

  // Update section
  const updateDiv = document.createElement("div");
  updateDiv.style.width = "100%";
  updateDiv.style.backgroundColor = "gray";
  updateDiv.style.borderRadius = "9999px";
  updateDiv.style.height = "0.625rem";

  // Percent section
  const progresssDiv = document.createElement("div");
  progresssDiv.style.width = progress;
  progresssDiv.style.backgroundColor = "blue";
  progresssDiv.style.height = "0.625rem";
  progresssDiv.style.borderRadius = "9999px";
  progresssDiv.id = "progressLevel";

  updateDiv.appendChild(progresssDiv);

  container.appendChild(updateDiv);

  div.appendChild(container);
  loadingContainer.appendChild(div);

  container.appendChild(loadingTextP);
  loadingDiv.appendChild(loadingContainer);

  resizeLoadingUI();

  document.body.insertBefore(loadingDiv, canvas);
  return loadingDiv;
};

export const hideCustomLoadingBar = () => {
  const loadingDiv = document.getElementById("loadingDiv");
  if (!loadingDiv) {
    return;
  }

  const onTransitionEnd = () => {
    if (loadingDiv) {
      loadingDiv.remove();
    }
  };

  loadingDiv.style.opacity = "0";
  loadingDiv.addEventListener("transitionend", onTransitionEnd);
};

export const updateProgress = (progressUpdate: string) => {
  const progressLevel = document.getElementById("progressLevel");
  progress = progressUpdate;
  if (progressLevel) {
    progressLevel.style.width = progress;
  }
};

export const setLoadingText = (updateText: string) => {
  const loadingTextElem = document.getElementById("loadingText");
  loadingText = updateText;
  if (loadingTextElem) {
    loadingTextElem.innerHTML = loadingText;
  }
};
