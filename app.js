// GLOBAL SELECTIONS AND VARS
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popUp = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;

// LOCAL STORAGE
let savedPalletes = [];

// EVENT LISTENERS

generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

//UPDATE LETTERS
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popUp.addEventListener("transitionend", () => {
  const popUpBox = popUp.children[0];
  popUp.classList.remove("active");
  popUpBox.classList.remove("active");
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

lockButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    lockColor(index);
  });
});

// FUNCTIONS

// THIS LOOP GENERATES RANDOM COLORS
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
  //   const letters = "#0123456789ABCDEF";
  //   let hash = "#";
  //   for (let i = 0; i < 6; i++) {
  //     hash += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return hash;
}

function randomColors() {
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    // ADD TO ARRAY
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    // ADD COLOR TO THE BACKGROUND
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // CHECK FOR CONTRAST
    checkTextContrast(randomColor, hexText);

    // INITIALIZE COLORIZE SLIDERS
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  // RESET INPUTS
  resetInputs();

  // CHECK FOR BUTTON CONTRAST
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // SATURATION SCALE
  const noSat = color.set("hsl.s", 0); // MIN SAT
  const fullSat = color.set("hsl.s", 1); // MAX SAT
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  // SCALE BRIGHTNESS
  const midBright = color.set("hsl.l", 0.5); // MID BRIGHTNESS
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  // UPDATE INPUT COLORS
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  // HUE
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  // COLORIZE INPUT SLIDERS
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();

  //CHECK CONTRAST
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon); // CHANGES ICON COLOR
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightnessColor = initialColors[slider.getAttribute("data-bright")];
      const brightnessValue = chroma(brightnessColor).hsl()[2];
      slider.value = Math.floor(brightnessValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  // POP UP ANIMATION
  const popUpBox = popUp.children[0];
  popUp.classList.add("active");
  popUpBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function lockColor(index) {
  colorDivs[index].classList.toggle("locked");
  lockButton[index].children[0].classList.toggle("fa-lock-open");
  lockButton[index].children[0].classList.toggle("fa-lock");
}

// IMPLEMENT SAVE TO PALETTE AND LOCAL STORAGE
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryButton = document.querySelector(".library");
const closeLibraryButton = document.querySelector(".close-library");

// EVENT LISTENERS

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryButton.addEventListener("click", openLibrary);
closeLibraryButton.addEventListener("click", closeLibrary);

function openPalette(e) {
  const popUp = saveContainer.children[0];
  saveContainer.classList.add("active");
  popUp.classList.add("active");
}

function closePalette(e) {
  const popUp = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popUp.classList.add("remove");
}

function savePalette(e) {
  saveContainer.classList.remove("active");
  popUp.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  // GENERATE OBJECT FOR SAVED PALETTES
  let palleteNumber;
  const palleteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (palleteObjects) {
    palleteNumber = palleteObjects.length;
  } else {
    palleteNumber = savedPalletes.length;
  }

  const palleteObject = { name, colors, nr: palleteNumber };
  savedPalletes.push(palleteObject);

  // SAVE PALETTE TO LOCAL STORAGE
  saveToLocal(palleteObject);
  saveInput.value = "";

  // GENERATE PALETTE FOR LIBRARY
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = palleteObject.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  palleteObject.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteButton = document.createElement("button");
  paletteButton.classList.add("pick-palette-btn");
  paletteButton.classList.add(palleteObject.nr);
  paletteButton.innerText = "SELECT";

  // ATTACH EVENTS TO THE BUTTON
  paletteButton.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalletes[paletteIndex].colors;
    savedPalletes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  // APPEND TO LIBRARY
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteButton);
  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(palleteObject) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(palleteObject);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popUp = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popUp.classList.add("active");
}

function closeLibrary() {
  const popUp = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popUp.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") == null) {
    localPalettes = [];
  } else {
    const palleteObjects = JSON.parse(localStorage.getItem("palettes"));

    savedPalletes = [...palleteObjects];
    palleteObjects.forEach((palleteObject) => {
      // GENERATE PALETTE FOR LIBRARY
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = palleteObject.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      palleteObject.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteButton = document.createElement("button");
      paletteButton.classList.add("pick-palette-btn");
      paletteButton.classList.add(palleteObject.nr);
      paletteButton.innerText = "Select";

      // ATTACH EVENT TO BUTTON
      paletteButton.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        palleteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      // APPEND TO LIBRARY
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteButton);
    });
  }
}
getLocal();
randomColors();
