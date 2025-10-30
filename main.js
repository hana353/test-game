// Configuration
const CONFIG = {
  multiSelectTypes: new Set(['accessory', 'pet']),
  folders: {
    skin: 'skin',
    background: 'background',
    hat: 'hat',
    clothes: 'clothes',
    accessory: 'accessory',
    pet: 'pet'
  },
  items: {
    skin: ['S1.png', 'S2.png', 'S3.png', 'S4.png', 'S5.png', 'S6.png'],
    background: ['B1.png', 'B2.png', 'B3.png', 'B4.png'],
    hat: ['H1.png', 'H2.png', 'H3.png', 'H4.png', 'H5.png', 'H6.png'],
    clothes: ['C1.png', 'C2.png', 'C3.png', 'C4.png', 'C5.png', 'C6.png'],
    accessory: ['A1.png', 'A2.png', 'A3.png', 'A4.png', 'A5.png', 'A6.png', 'A7.png', 'A8.png', 'A9.png'],
    pet: ['P1.png', 'P2.png', 'P3.png', 'P4.png', 'P5.png', 'P6.png', 'P7.png', 'P8.png', 'P9.png', 'P10.png', 'P11.png']
  }
};

// State management
const state = {
  skin: -1,
  background: -1,
  hat: -1,
  clothes: -1,
  accessory: [],
  pet: []
};

let currentType = null;

// Utility functions
const isMultiType = (type) => CONFIG.multiSelectTypes.has(type);

const getImagePath = (type, filename) => 
  `./${CONFIG.folders[type]}/${encodeURIComponent(filename)}`;

// DOM cache
const DOM = {
  itemList: null,
  character: null,
  shareBtn: null
};

// Initialize
function init() {
  // Cache DOM elements
  DOM.itemList = document.getElementById('itemList');
  DOM.character = document.getElementById('character');
  DOM.shareBtn = document.getElementById('shareBtn');

  // Render initial character state
  Object.keys(state).forEach(type => updateCharacter(type));
  
  // Hide item list initially
  DOM.itemList.classList.add('hidden');

  // Setup event listeners
  setupEventListeners();
}

function setupEventListeners() {
  // Prevent context menu on touch devices
  document.addEventListener('contextmenu', (e) => {
    if (e.target?.classList?.contains('item-thumb')) {
      e.preventDefault();
    }
  }, { passive: false, capture: true });

  // Share button
  DOM.shareBtn.addEventListener('click', handleShare);
}

// Item list management
function showItems(type) {
  const items = CONFIG.items[type];
  
  // Toggle list visibility
  if (currentType === type && !DOM.itemList.classList.contains('hidden')) {
    hideItemList();
    return;
  }

  // Validate items exist
  if (!items?.length) {
    hideItemList();
    return;
  }

  currentType = type;
  renderItemList(type, items);
}

function hideItemList() {
  DOM.itemList.classList.add('hidden');
  currentType = null;
}

function renderItemList(type, items) {
  // Clear and show list
  DOM.itemList.innerHTML = '';
  DOM.itemList.classList.remove('hidden');

  // Create title
  const title = document.createElement('h3');
  title.textContent = `Choose ${type}`;
  title.style.textTransform = 'capitalize';
  DOM.itemList.appendChild(title);

  // Create fragment for better performance
  const fragment = document.createDocumentFragment();

  items.forEach((img, index) => {
    const thumb = createThumbnail(type, img, index);
    fragment.appendChild(thumb);
  });

  DOM.itemList.appendChild(fragment);
}

function createThumbnail(type, img, index) {
  const thumb = document.createElement('img');
  thumb.src = getImagePath(type, img);
  thumb.className = 'item-thumb';
  thumb.loading = 'lazy'; // Lazy load images

  // Set selected state
  const isSelected = isMultiType(type) 
    ? state[type].includes(index)
    : state[type] === index;
  
  if (isSelected) {
    thumb.classList.add('selected-thumb');
  }

  // Handle click
  thumb.addEventListener('click', () => handleItemClick(type, index, thumb));

  return thumb;
}

function handleItemClick(type, index, thumb) {
  if (isMultiType(type)) {
    handleMultiSelect(type, index, thumb);
  } else {
    handleSingleSelect(type, index, thumb);
  }
  updateCharacter(type);
}

function handleMultiSelect(type, index, thumb) {
  const pos = state[type].indexOf(index);
  
  if (pos >= 0) {
    state[type].splice(pos, 1);
    thumb.classList.remove('selected-thumb');
  } else {
    state[type].push(index);
    thumb.classList.add('selected-thumb');
  }
}

function handleSingleSelect(type, index, thumb) {
  const wasSelected = state[type] === index;
  state[type] = wasSelected ? -1 : index;

  // Update all thumbnails
  DOM.itemList.querySelectorAll('.item-thumb').forEach(el => 
    el.classList.remove('selected-thumb')
  );

  if (!wasSelected) {
    thumb.classList.add('selected-thumb');
  }
}

// Character rendering
function updateCharacter(type) {
  const element = document.getElementById(type);
  if (!element) return;

  if (isMultiType(type)) {
    renderMultiLayers(element, type);
  } else {
    renderSingleLayer(element, type);
  }
}

function renderMultiLayers(element, type) {
  const selected = state[type];
  
  element.innerHTML = '';
  element.style.backgroundImage = 'none';

  if (!selected.length) return;

  const fragment = document.createDocumentFragment();
  
  selected.forEach(i => {
    const layer = createLayer(type, CONFIG.items[type][i]);
    fragment.appendChild(layer);
  });

  element.appendChild(fragment);
}

function renderSingleLayer(element, type) {
  const index = state[type];
  
  element.innerHTML = '';
  
  if (index < 0) {
    element.style.backgroundImage = 'none';
    return;
  }

  const imagePath = getImagePath(type, CONFIG.items[type][index]);
  
  // Special handling for background - use cover instead of contain
  const bgSize = (type === 'background') ? 'cover' : 'contain';
  
  Object.assign(element.style, {
    backgroundImage: `url('${imagePath}')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: bgSize,
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    pointerEvents: 'none'
  });
}

function createLayer(type, filename) {
  const layer = document.createElement('div');
  const imagePath = getImagePath(type, filename);
  
  Object.assign(layer.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundImage: `url('${imagePath}')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    pointerEvents: 'none'
  });

  return layer;
}

// Share functionality
async function handleShare() {
  // Disable button and show loading
  DOM.shareBtn.disabled = true;
  const originalText = DOM.shareBtn.textContent;
  DOM.shareBtn.textContent = 'Capturing...';

  // Create wrapper for capture with background
  const wrapper = createCaptureWrapper();
  document.body.appendChild(wrapper);

  let imgData = '';
  
  try {
    // Wait for all images to load
    await waitForImagesToLoad(wrapper);
    
    // Add small delay to ensure rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    imgData = await captureCharacter(wrapper);
  } catch (error) {
    console.error('Capture failed:', error);
  } finally {
    document.body.removeChild(wrapper);
    // Re-enable button
    DOM.shareBtn.disabled = false;
    DOM.shareBtn.textContent = originalText;
  }

  // Show modal with image
  showShareModal(imgData);
}

function createCaptureWrapper() {
  // Get character dimensions
  const charRect = DOM.character.getBoundingClientRect();
  
  // Force square aspect ratio - use the smaller dimension or force square
  const size = Math.min(charRect.width, charRect.height);
  const captureWidth = size;
  const captureHeight = size;
  
  // Create wrapper with EXACT square size
  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    width: `${captureWidth}px`,
    height: `${captureHeight}px`,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    imageRendering: 'high-quality',
    imageRendering: '-webkit-optimize-contrast'
  });

  // Add background layer with opacity - using selected background or default background2.png
  const bgLayer = document.createElement('div');
  let bgImageUrl = './images4/background2.png'; // default
  
  // If user selected a background, use that instead
  if (state.background >= 0 && CONFIG.items.background[state.background]) {
    bgImageUrl = getImagePath('background', CONFIG.items.background[state.background]);
  }
  
  Object.assign(bgLayer.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundImage: `url('${bgImageUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: '0.3',
    zIndex: '0',
    imageRendering: 'high-quality'
  });
  wrapper.appendChild(bgLayer);

  // Clone character content
  const charClone = DOM.character.cloneNode(true);
  Object.assign(charClone.style, {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    imageRendering: 'high-quality',
    imageRendering: '-webkit-optimize-contrast'
  });
  
  // Ensure all child elements have high quality rendering and proper sizing
  const allChildren = charClone.querySelectorAll('*');
  allChildren.forEach(child => {
    child.style.imageRendering = 'high-quality';
    child.style.imageRendering = '-webkit-optimize-contrast';
    // Force children to respect parent dimensions
    if (child.style.position === 'absolute') {
      child.style.maxWidth = '100%';
      child.style.maxHeight = '100%';
    }
  });
  
  wrapper.appendChild(charClone);

  return wrapper;
}

// Wait for all images in element to load
function waitForImagesToLoad(element) {
  const images = [];
  
  // Get all background images
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const bgImage = window.getComputedStyle(el).backgroundImage;
    if (bgImage && bgImage !== 'none') {
      const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        images.push(urlMatch[1]);
      }
    }
  });

  // Get background of the element itself
  const mainBg = window.getComputedStyle(element).backgroundImage;
  if (mainBg && mainBg !== 'none') {
    const urlMatch = mainBg.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (urlMatch && urlMatch[1]) {
      images.push(urlMatch[1]);
    }
  }

  // Create promises for each unique image
  const uniqueImages = [...new Set(images)];
  const imagePromises = uniqueImages.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve anyway to not block
      img.src = src;
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(), 5000);
    });
  });

  return Promise.all(imagePromises);
}

async function captureCharacter(wrapper) {
  // Calculate optimal scale for high quality without making wrapper larger
  const devicePixelRatio = window.devicePixelRatio || 1;
  const optimalScale = Math.max(4, devicePixelRatio * 2); // 4x minimum for crisp images
  
  const canvas = await html2canvas(wrapper, {
    backgroundColor: null,
    useCORS: true,
    allowTaint: false,
    scale: optimalScale,
    width: wrapper.offsetWidth,
    height: wrapper.offsetHeight,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    logging: false,
    imageTimeout: 5000,
    foreignObjectRendering: false,
    removeContainer: true,
    async: true,
    onclone: (clonedDoc) => {
      const clonedWrapper = clonedDoc.querySelector('div');
      if (clonedWrapper) {
        clonedWrapper.style.imageRendering = 'high-quality';
        clonedWrapper.style.imageRendering = '-webkit-optimize-contrast';
      }
    }
  });
  
  // Convert to high-quality PNG
  return canvas.toDataURL('image/png', 1.0);
}

function buildTwitterUrl() {
  const text = encodeURIComponent(
    '🎃 I just joined #SiggyHalloween! \n\n' +
    'Help Siggy get the purr-fect Halloween outfit 👻\n\n' +
    'Try it now 👉 https://siggyhalloween-ritual.xyz/ \n\n ' +
    '#Ritualnet #Ritualfnd'
  );
  return `https://twitter.com/intent/tweet?text=${text}`;
}

function showShareModal(imgData) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'shareModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
  `;

  // Create modal content
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 24px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    animation: slideUp 0.3s ease;
  `;

  const twitterUrl = buildTwitterUrl();

  content.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .modal-title {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        margin: 0;
      }
      .close-btn {
        background: #f0f0f0;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      .close-btn:hover {
        background: #e0e0e0;
      }
      .siggy-image {
        width: 100%;
        max-width: 400px;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        margin: 20px auto;
        display: block;
      }
      .button-group {
        display: flex;
        gap: 12px;
        margin-top: 20px;
        flex-wrap: nowrap;
      }
      .btn {
        flex: 1 1 0%;
        min-width: 0;
        padding: 14px 20px;
        height: 48px;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-sizing: border-box;
      }
      .btn-twitter {
        background: #1da1f2;
        color: white;
        margin-top: 17px;
      }
      .btn-twitter:hover {
        background: rgb(20, 123, 187);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(29,161,242,0.4);
      }
      .btn-download {
        background: #10b981;
        color: white;
      }
      .btn-download:hover {
        background: #059669;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16,185,129,0.4);
      }
      .btn-copy {
        background: #8b5cf6;
        color: white;
      }
      .btn-copy:hover {
        background: #7c3aed;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139,92,246,0.4);
      }
      .hint {
        text-align: center;
        color: #666;
        font-size: 14px;
        margin-top: 16px;
        line-height: 1.5;
      }
      .success-msg {
        background: #d1fae5;
        color: #065f46;
        padding: 12px;
        border-radius: 8px;
        margin-top: 12px;
        text-align: center;
        font-size: 14px;
        display: none;
      }
      @media (max-width: 600px) {
        .button-group { overflow-x: auto; }
        .btn { flex: 1 1 0%; }
      }
    </style>
    
    <div class="modal-header">
      <h2 class="modal-title">🎃 Your Siggy is Ready!</h2>
      <button class="close-btn" onclick="document.getElementById('shareModal').remove()">×</button>
    </div>
    
    ${imgData ? `
      <img src="${imgData}" class="siggy-image" alt="Siggy character" id="siggyImage"/>
      
      <div class="button-group">
        <a href="${twitterUrl}" class="btn btn-twitter" target="_blank">
          <span>Share on X</span>
        </a>
        <button class="btn btn-download" onclick="downloadImage()">
          <span>Download</span>
        </button>
        <button class="btn btn-copy" onclick="copyImage()">
          <span>Copy Image</span>
        </button>
      </div>
      
      <div class="success-msg" id="successMsg"></div>
      
      <p class="hint">
        💡 <strong>Mobile:</strong> Long-press the image to save<br>
        💡 <strong>Desktop:</strong> Right-click to copy or save
      </p>
    ` : `
      <div style="text-align: center; padding: 40px; color: #e74c3c;">
        <p style="font-size: 18px; margin-bottom: 20px;">⚠️ Failed to generate image</p>
        <a href="${twitterUrl}" class="btn btn-twitter" target="_blank">
          <span>🦆</span>
          <span>Share on X Anyway</span>
        </a>
      </div>
    `}
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Close on ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

// Download image function
window.downloadImage = function() {
  const img = document.getElementById('siggyImage');
  if (!img) return;
  
  // Create a temporary canvas to ensure maximum quality
  const tempCanvas = document.createElement('canvas');
  const tempImg = new Image();
  
  tempImg.onload = function() {
    // Set canvas to image dimensions
    tempCanvas.width = tempImg.width;
    tempCanvas.height = tempImg.height;
    
    // Draw with high quality settings
    const ctx = tempCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempImg, 0, 0);
    
    // Convert to blob with maximum quality
    tempCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `siggy-halloween-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      
      showSuccessMessage('Image downloaded! 💾');
    }, 'image/png', 1.0);
  };
  
  tempImg.src = img.src;
};

// Copy image to clipboard
window.copyImage = async function() {
  const img = document.getElementById('siggyImage');
  if (!img) return;
  
  try {
    // Convert base64 to blob
    const response = await fetch(img.src);
    const blob = await response.blob();
    
    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    
    showSuccessMessage('Image copied to clipboard! 📋');
  } catch (error) {
    console.error('Copy failed:', error);
    showSuccessMessage('❌ Copy failed. Try right-click instead.');
  }
};

function showSuccessMessage(message) {
  const msgEl = document.getElementById('successMsg');
  if (!msgEl) return;
  
  msgEl.textContent = message;
  msgEl.style.display = 'block';
  
  setTimeout(() => {
    msgEl.style.display = 'none';
  }, 3000);
}

// Make showItems available globally
window.showItems = showItems;

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}