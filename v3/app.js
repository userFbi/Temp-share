// DOM Elements
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const filePreview = document.getElementById("filePreview");
const uploadBtn = document.getElementById("uploadBtn");
const expiryDropdown = document.getElementById("expiryDropdown");
const dropdownTrigger = document.getElementById("dropdownTrigger");
const dropdownMenu = document.getElementById("dropdownMenu");
const selectedExpiry = document.getElementById("selectedExpiry");
const idleState = document.getElementById("idleState");
const uploadingState = document.getElementById("uploadingState");
const completeState = document.getElementById("completeState");
const progressCircle = document.getElementById("progressCircle");
const progressPercent = document.getElementById("progressPercent");
const linearProgress = document.getElementById("linearProgress");
const fileCount = document.getElementById("fileCount");
const filePlural = document.getElementById("filePlural");
const expiryDaysEl = document.getElementById("expiryDays");
const expiryPlural = document.getElementById("expiryPlural");
const copyBtn = document.getElementById("copyBtn");
const uploadMoreBtn = document.getElementById("uploadMoreBtn");

let files = [];
let expiryDays = 1;

// Generate share code
function generateShareCode() {
  return "TS-" + Math.floor(100000 + Math.random() * 900000);
}

// Convert file to Base64
function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// Save files to LocalStorage
async function saveFilesToLocalStorage() {
  const shareCode = generateShareCode();

  const allData = JSON.parse(localStorage.getItem("tempshare_uploads")) || {};

  const savedFiles = [];

  for (let file of files) {
    const base64 = await fileToBase64(file);
    savedFiles.push({
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
    });
  }

  allData[shareCode] = {
    files: savedFiles,
    expiresAt: Date.now() + expiryDays * 24 * 60 * 60 * 1000,
  };

  localStorage.setItem("tempshare_uploads", JSON.stringify(allData));

  return shareCode;
}

// Format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Get file icon SVG
function getFileIconSVG(file) {
  if (file.type.startsWith("image/")) {
    return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
  }
  if (file.type.startsWith("video/")) {
    return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
  }
  if (file.type === "application/pdf") {
    return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>';
}

// Render file preview
function renderFilePreview() {
  filePreview.innerHTML = files
    .map(
      (file, index) => `
        <div class="file-item">
          <div class="file-info">
            ${getFileIconSVG(file)}
            <div>
              <div class="file-name">${file.name}</div>
              <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
          </div>
          <button class="file-remove" data-index="${index}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      `,
    )
    .join("");

  uploadBtn.disabled = files.length === 0;
}

// Handle file input
fileInput.addEventListener("change", (e) => {
  files = [...files, ...Array.from(e.target.files)];
  renderFilePreview();
});

// Handle drag and drop
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragging");
  files = [...files, ...Array.from(e.dataTransfer.files)];
  renderFilePreview();
});

// Handle file remove
filePreview.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".file-remove");
  if (removeBtn) {
    const index = parseInt(removeBtn.dataset.index);
    files.splice(index, 1);
    renderFilePreview();
  }
});

// Dropdown
dropdownTrigger.addEventListener("click", () => {
  expiryDropdown.classList.toggle("open");
});

dropdownMenu.addEventListener("click", (e) => {
  const option = e.target.closest(".dropdown-option");
  if (option) {
    expiryDays = parseInt(option.dataset.value);
    selectedExpiry.textContent = option.textContent;
    document
      .querySelectorAll(".dropdown-option")
      .forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
    expiryDropdown.classList.remove("open");
  }
});

document.addEventListener("click", (e) => {
  if (!expiryDropdown.contains(e.target)) {
    expiryDropdown.classList.remove("open");
  }
});

// Upload simulation
uploadBtn.addEventListener("click", async () => {
  if (files.length === 0) return;

  idleState.style.display = "none";
  uploadingState.style.display = "block";

  fileCount.textContent = files.length;
  filePlural.textContent = files.length > 1 ? "s" : "";

  let progress = 0;

  const interval = setInterval(async () => {
    progress += 10;

    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      // SAVE FILES
      const code = await saveFilesToLocalStorage();

      uploadingState.style.display = "none";
      completeState.style.display = "block";

      // SHOW CODE
      document.getElementById("shareUrl").value = code;

      document
        .getElementById("openDownloadBtn")
        .addEventListener("click", () => {
          window.open(`download.html?code=${code}`, "_blank");
        });

      expiryDaysEl.textContent = expiryDays;
      expiryPlural.textContent = expiryDays > 1 ? "s" : "";
    }

    const dashoffset = 226 - (226 * progress) / 100;
    progressCircle.style.strokeDashoffset = dashoffset;
    progressPercent.textContent = progress + "%";
    linearProgress.style.width = progress + "%";
  }, 200);
});

// Copy link
copyBtn.addEventListener("click", () => {
  const shareUrl = document.getElementById("shareUrl");
  shareUrl.select();
  document.execCommand("copy");
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
});

// Upload more
uploadMoreBtn.addEventListener("click", () => {
  files = [];
  filePreview.innerHTML = "";
  uploadBtn.disabled = true;
  completeState.style.display = "none";
  idleState.style.display = "block";
  progressCircle.style.strokeDashoffset = 226;
  progressPercent.textContent = "0%";
  linearProgress.style.width = "0%";
});

// Date logic

const today = new Date();

const options = {
  year: "numeric",
};

document.getElementById("todayDate").innerText = today.toLocaleDateString(
  "en-IN",
  options,
);

// ==============================
// TEMP SHARE – LOCAL STORAGE
// ==============================
