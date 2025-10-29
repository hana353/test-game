// 🌙 Moongirl Dress-up Game

let state = {
  hat: -1,
  clothes: -1,
  accessory: [],
  pet: [],
};

const items = {
  hat: ["H1.png","H2.png","H3.png","H4.png","H5.png","H6.png"],
  clothes: ["C1.png","C2.png","C3.png","C4.png","C5.png","C6.png"],
  accessory: ["A1.png","A2.png","A3.png","A4.png","A5.png","A6.png","A7.png","A8.png","A9.png"],
  pet: ["P1.png","P2.png","P3.png","P4.png","P5.png","P6.png","P7.png","P8.png","P9.png","P10.png","P11.png"],
};

const folderOfType = {
  hat: "hat",
  clothes: "clothes",
  accessory: "accessory",
  pet: "pet",
};

let currentType = null;
function isMultiType(type) {
  return type === "accessory" || type === "pet";
}

window.onload = () => {
  Object.keys(state).forEach(type => updateCharacter(type, state[type]));
  document.getElementById("itemList").classList.add("hidden");
};

document.addEventListener("contextmenu", function (e) {
  if (e.target && e.target.classList && e.target.classList.contains("item-thumb")) {
    e.preventDefault();
  }
}, { capture: true });

function showItems(type) {
  const listBox = document.getElementById("itemList");
  if (currentType === type && !listBox.classList.contains("hidden")) {
    listBox.classList.add("hidden");
    currentType = null;
    return;
  }
  currentType = type;
  listBox.innerHTML = "";
  listBox.classList.remove("hidden");
  if (!items[type] || items[type].length === 0) {
    listBox.classList.add("hidden");
    currentType = null;
    return;
  }
  const title = document.createElement("h3");
  title.textContent = `Choose ${type}`;
  title.style.textTransform = "capitalize";
  listBox.appendChild(title);

  items[type].forEach((img, index) => {
    const thumb = document.createElement("img");
    thumb.src = `./${folderOfType[type]}/${encodeURIComponent(img)}`;
    thumb.className = "item-thumb";
    if (isMultiType(type) && Array.isArray(state[type]) && state[type].includes(index)) {
      thumb.classList.add("selected-thumb");
    } else if (!isMultiType(type) && state[type] === index) {
      thumb.classList.add("selected-thumb");
    }

    thumb.onclick = () => {
      if (isMultiType(type)) {
        if (!Array.isArray(state[type])) state[type] = [];
        const pos = state[type].indexOf(index);
        if (pos >= 0) {
          state[type].splice(pos, 1);
          thumb.classList.remove("selected-thumb");
        } else {
          state[type].push(index);
          thumb.classList.add("selected-thumb");
        }
        updateCharacter(type);
      } else {
        const wasSelected = state[type] === index;
        state[type] = wasSelected ? -1 : index;
        document.querySelectorAll(".item-thumb").forEach(el => el.classList.remove("selected-thumb"));
        if (!wasSelected) thumb.classList.add("selected-thumb");
        updateCharacter(type, state[type]);
      }
    };
    listBox.appendChild(thumb);
  });
}

function selectItem(type, index) {
  if (isMultiType(type)) {
    if (!Array.isArray(state[type])) state[type] = [];
    const pos = state[type].indexOf(index);
    if (pos >= 0) state[type].splice(pos, 1); else state[type].push(index);
    updateCharacter(type);
  } else {
    state[type] = state[type] === index ? -1 : index;
    updateCharacter(type, state[type]);
  }
}

function updateCharacter(type, index) {
  const element = document.querySelector(`#${type}`);
  if (!element) return;

  if (isMultiType(type)) {
    const selected = Array.isArray(state[type]) ? state[type] : [];
    element.innerHTML = "";
    element.style.backgroundImage = "none";
    if (selected.length === 0) return;
    selected.forEach(i => {
      const child = document.createElement("div");
      child.style.position = "absolute";
      child.style.top = "0";
      child.style.left = "0";
      child.style.width = "100%";
      child.style.height = "100%";
      child.style.backgroundImage = `url('./${folderOfType[type]}/${encodeURIComponent(items[type][i])}')`;
      child.style.backgroundRepeat = "no-repeat";
      child.style.backgroundPosition = "center";
      child.style.backgroundSize = "contain";
      child.style.pointerEvents = "none";
      element.appendChild(child);
    });
  } else {
    if (index == null || index < 0) {
      element.style.backgroundImage = "none";
      return;
    }
    element.innerHTML = "";
    element.style.backgroundImage = `url('./${folderOfType[type]}/${encodeURIComponent(items[type][index])}')`;
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundPosition = "center";
    element.style.backgroundSize = "contain";
    element.style.position = "absolute";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.top = "0";
    element.style.left = "0";
    element.style.pointerEvents = "none";
  }
}

document.getElementById("shareBtn").onclick = async function () {
  const area = document.getElementById("character");
  const newWindow = window.open("about:blank", "_blank");
  let shouldRedirect = !newWindow;

  // Thêm lớp nền tạm
  const bgLayer = document.createElement("div");
  bgLayer.style.position = "absolute";
  bgLayer.style.top = "0";
  bgLayer.style.left = "0";
  bgLayer.style.width = "100%";
  bgLayer.style.height = "100%";
  bgLayer.style.backgroundImage = "url('./images4/background2.png')";
  bgLayer.style.backgroundSize = "cover";
  bgLayer.style.backgroundPosition = "center";
  bgLayer.style.opacity = "0.3";
  bgLayer.style.zIndex = "0";
  bgLayer.style.pointerEvents = "none";
  area.insertBefore(bgLayer, area.firstChild);
  area.classList.add("exporting");

  let imgData = "";

  try {
    // Clone vào div tạm 300x300 để mobile/desktop đều giống
    const tempDiv = document.createElement("div");
    tempDiv.style.width = "300px";
    tempDiv.style.height = "300px";
    tempDiv.style.position = "absolute";
    tempDiv.style.top = "-9999px";
    tempDiv.style.left = "-9999px";
    tempDiv.style.background = "transparent";
    tempDiv.appendChild(area.cloneNode(true));
    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv, {
      backgroundColor: null,
      useCORS: true,
      scale: 2
    });
    imgData = canvas.toDataURL("image/png");

    document.body.removeChild(tempDiv);
  } catch (e) {
    console.error(e);
  } finally {
    area.classList.remove("exporting");
    if (bgLayer && bgLayer.parentNode) bgLayer.parentNode.removeChild(bgLayer);
  }

  const text = encodeURIComponent(
    "🎃 I just joined #SiggyHalloween contest!\n\nHelp Siggy get the purr-fect Halloween outfit 👻\n\nTry it now 👉 siggyhalloween.ritual.fun"
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;

  if (shouldRedirect) {
    window.location.href = twitterUrl;
    return;
  }

  // HTML popup
  const html = `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { text-align: center; font-family: sans-serif; }
        img.siggy { width: 300px; height: 300px; border-radius: 10px; box-shadow:0 0 5px #999; object-fit: cover; }
        a { font-size: 18px; }
        p { margin: 5px 0 0 0; }
      </style>
    </head>
    <body>
      <h2>Share Your Siggy!</h2>
      ${imgData ? `<img src="${imgData}" class="siggy"/>` : ''}
      <p><a href="${twitterUrl}" target="_blank">Post on X 🚀</a></p>
      <p>(Right-click to save your image if needed)</p>
    </body>
  </html>
  `;

  try {
    newWindow.document.open();
    newWindow.document.write(html);
    newWindow.document.close();
  } catch (e) {
    window.location.href = twitterUrl;
  }
};
