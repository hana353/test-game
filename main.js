// 🌙 Moongirl Dress-up Game

// Trạng thái hiện tại của từng phần (theo folder: Hat, Clothes, Accesory, Pet)
let state = {
  hat: -1,          // single-select
  clothes: -1,      // single-select
  accessory: [],    // multi-select
  pet: [],          // multi-select
};

// Danh sách item theo thư mục
// Lưu ý: Tên file có dấu/cách sẽ được encode khi sử dụng
const items = {
  hat: [
    "H1.png",
    "H2.png",
    "H3.png",
    "H4.png",
    "H5.png",
    "H6.png",
  ],
  clothes: [
    "C1.png",
    "C2.png",
    "C3.png",
    "C4.png",
    "C5.png",
    "C6.png",
  ],
  accessory: [
    "A1.png",
    "A2.png",
    "A3.png",
    "A4.png",
    "A5.png",
    "A6.png",
    "A7.png",
    "A8.png",
    "A9.png",
  ],
  pet: [
    "P1.png",
    "P2.png",
    "P3.png",
    "P4.png",
    "P5.png",
    "P6.png",
    "P7.png",
    "P8.png",
    "P9.png",
    "P10.png",
    "P11.png",
  ],
};

// Map type -> folder name
const folderOfType = {
  hat: "hat",
  clothes: "clothes",
  accessory: "accessory",  // đúng chính tả hiện tại
  pet: "pet",
};


// Biến lưu loại hiện đang mở
let currentType = null;

function isMultiType(type) {
  return type === "accessory" || type === "pet";
}

// Khi tải trang: hiển thị nhân vật mặc định, ẩn list
window.onload = () => {
  Object.keys(state).forEach(type => updateCharacter(type, state[type]));
  document.getElementById("itemList").classList.add("hidden");
};

// Ngăn menu ngữ cảnh khi nhấn giữ trên mobile (tránh gây khó chịu khi chạm)
document.addEventListener("contextmenu", function (e) {
  if (e.target && (e.target.classList && e.target.classList.contains("item-thumb"))) {
    e.preventDefault();
  }
}, { capture: true });

// ==========================
// 🖼️ Hiển thị danh sách item
// ==========================
function showItems(type) {
  const listBox = document.getElementById("itemList");

  // Nếu đang bấm lại đúng loại đang mở → ẩn list
  if (currentType === type && !listBox.classList.contains("hidden")) {
    listBox.classList.add("hidden");
    currentType = null;
    return;
  }

  // Gán loại hiện tại
  currentType = type;

  // Xóa nội dung cũ và hiển thị list
  listBox.innerHTML = "";
  listBox.classList.remove("hidden");

  // Nếu không có item (ví dụ chưa có thư mục Accesory) thì ẩn list
  if (!items[type] || items[type].length === 0) {
    listBox.classList.add("hidden");
    currentType = null;
    return;
  }

  // Tiêu đề
  const title = document.createElement("h3");
  title.textContent = `Choose ${type}`;
  title.style.textTransform = "capitalize";
  listBox.appendChild(title);

  // Danh sách ảnh item
  items[type].forEach((img, index) => {
    const thumb = document.createElement("img");
    const encoded = encodeURIComponent(img);
    thumb.src = `./${folderOfType[type]}/${encoded}`;
    thumb.className = "item-thumb";

    // Trạng thái chọn ban đầu
    if (isMultiType(type)) {
      if (Array.isArray(state[type]) && state[type].includes(index)) {
        thumb.classList.add("selected-thumb");
      }
    } else {
      if (state[type] >= 0 && index === state[type]) {
        thumb.classList.add("selected-thumb");
      }
    }

    // Khi click chọn item
    thumb.onclick = () => {
      if (isMultiType(type)) {
        // Toggle chọn/bỏ chọn
        if (!Array.isArray(state[type])) state[type] = [];
        const pos = state[type].indexOf(index);
        if (pos >= 0) {
          state[type].splice(pos, 1); // bỏ chọn
          thumb.classList.remove("selected-thumb");
        } else {
          state[type].push(index); // chọn thêm
          thumb.classList.add("selected-thumb");
        }
        updateCharacter(type);
      } else {
        // Single-select: bấm lại item đã chọn => bỏ chọn
        const wasSelected = state[type] === index;
        state[type] = wasSelected ? -1 : index;
        // Cập nhật highlight: chỉ 1 hoặc none
        document.querySelectorAll(".item-thumb").forEach(el => el.classList.remove("selected-thumb"));
        if (!wasSelected) {
          thumb.classList.add("selected-thumb");
        }
        updateCharacter(type, state[type]);
      }
    };

    listBox.appendChild(thumb);
  });
}

// ==========================
// ✨ Khi người chơi chọn item
// ==========================
function selectItem(type, index) {
  // Kept for backward compatibility; not used in new handlers
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

// ==========================
// 🧍 Cập nhật layer nhân vật
// ==========================
function updateCharacter(type, index) {
  const element = document.querySelector(`#${type}`);
  if (!element) return;

  if (isMultiType(type)) {
    // Render nhiều lớp cho các item đã chọn
    const selected = Array.isArray(state[type]) ? state[type] : [];
    element.innerHTML = "";
    element.style.backgroundImage = "none";
    if (selected.length === 0) return;
    selected.forEach(i => {
      const child = document.createElement("div");
      const encoded = encodeURIComponent(items[type][i]);
      child.style.position = "absolute";
      child.style.top = "0";
      child.style.left = "0";
      child.style.width = "100%";
      child.style.height = "100%";
      child.style.backgroundImage = `url('./${folderOfType[type]}/${encoded}')`;
      child.style.backgroundRepeat = "no-repeat";
      child.style.backgroundPosition = "center";
      child.style.backgroundSize = "contain";
      child.style.pointerEvents = "none";
      element.appendChild(child);
    });
  } else {
    // Render đơn lớp
    if (index == null || index < 0) {
      element.style.backgroundImage = "none";
      return;
    }
    const encoded = encodeURIComponent(items[type][index]);
    element.innerHTML = "";
    element.style.backgroundImage = `url('./${folderOfType[type]}/${encoded}')`;
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
  // Mở cửa sổ MỚI NGAY LẬP TỨC để không bị chặn popup trên mobile
  const newWindow = window.open("about:blank", "_blank");

  // Nếu vẫn bị chặn, đặt cờ fallback dùng điều hướng thẳng
  let shouldRedirect = !newWindow;

  // Thêm lớp nền tạm cho ảnh chia sẻ (background2.png mờ 0.2)
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
    // Chụp theo bounding box của #character để luôn chỉ lấy phần ô nhân vật
    const rect = area.getBoundingClientRect();
    const canvas = await html2canvas(document.body, {
      backgroundColor: null,
      useCORS: true,
      scale: Math.max(2, window.devicePixelRatio || 1),
      x: Math.round(rect.left + window.scrollX),
      y: Math.round(rect.top + window.scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY
    });
    imgData = canvas.toDataURL("image/png");
  } catch (e) {
    // Nếu có lỗi chụp, vẫn tiếp tục chia sẻ text
  } finally {
    area.classList.remove("exporting");
    if (bgLayer && bgLayer.parentNode) {
      bgLayer.parentNode.removeChild(bgLayer);
    }
  }

  const text = encodeURIComponent(
    "🎃 I just joined #SiggyHalloween contest!\n\nHelp Siggy get the purr-fect Halloween outfit 👻\n\nTry it now 👉 siggyhalloween.ritual.fun"
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;

  if (shouldRedirect) {
    // Fallback khi popup bị chặn: điều hướng thẳng tới X
    window.location.href = twitterUrl;
    return;
  }

  // Ghi nội dung vào cửa sổ đã mở lúc đầu
  const html = `
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"/></head>
      <body style="text-align:center; font-family:sans-serif; margin:16px;">
        <h2 style="margin:12px 0;">Share Your Siggy!</h2>
        ${imgData ? `<img src="${imgData}" style="max-width:92vw; height:auto; border-radius:10px; box-shadow:0 0 5px #999;"/>` : ''}
        <p style="margin:16px 0;"><a href="${twitterUrl}" target="_self" style="font-size:18px; text-decoration:none; padding:10px 14px; border-radius:10px; background:#000; color:#fff; display:inline-block;">Post on X 🚀</a></p>
        <p style="opacity:.7; font-size:14px;">Tap and hold the image to save (if needed)</p>
      </body>
    </html>
  `;
  try {
    newWindow.document.open();
    newWindow.document.write(html);
    newWindow.document.close();
  } catch (e) {
    // Nếu không thể ghi vì popup bị chặn giữa chừng
    window.location.href = twitterUrl;
  }
};