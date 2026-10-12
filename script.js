/* STAR MANAGEMENT — grouped backup links demo for GitHub Pages.
 * DEMO ONLY: the client-side passphrase is not secure and localStorage is per browser.
 * Use a real authentication/database backend before using this for private data.
 */
const DEMO_ADMIN_KEY = "change-this-demo-key";
const STORAGE_KEY = "starManagementGroups_v2";
const DEFAULT_GROUPS = [{
  id: "orion88-example",
  title: "ORION88 BACK UP LINK",
  icon: "🌟",
  iconImage: "",
  description: "Choose one of the available backup links.",
  urls: [
    "https://orion18218.info",
    "http://orion88.live",
    "http://orion19832.live",
    "http://orion19832.life",
    "http://orion18218.fun",
    "http://orion19832.fun",
    "http://orion88.life",
    "http://orion18218.life"
  ]
}];
const linksGrid = document.getElementById("linksGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const linkCount = document.getElementById("linkCount");
const groupCount = document.getElementById("groupCount");
const resultLabel = document.getElementById("resultLabel");
const adminPanel = document.getElementById("adminPanel");
const loginDialog = document.getElementById("loginDialog");
const loginForm = document.getElementById("loginForm");
const adminPassword = document.getElementById("adminPassword");
const loginError = document.getElementById("loginError");
const linkForm = document.getElementById("linkForm");
const editingId = document.getElementById("editingId");
const linkTitle = document.getElementById("linkTitle");
const linkIcon = document.getElementById("linkIcon");
const linkIconFile = document.getElementById("linkIconFile");
const iconPreviewWrap = document.getElementById("iconPreviewWrap");
const iconPreview = document.getElementById("iconPreview");
const removeIconButton = document.getElementById("removeIconButton");
const linkUrls = document.getElementById("linkUrls");
let pendingIconImage = "";
const linkDescription = document.getElementById("linkDescription");
const saveLinkButton = document.getElementById("saveLinkButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const adminLinks = document.getElementById("adminLinks");
const toast = document.getElementById("toast");
let isAdmin = false;
let toastTimer;

function getGroups() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored === null ? DEFAULT_GROUPS : JSON.parse(stored);
    return Array.isArray(data) ? data.filter(g => g && typeof g.title === "string" && Array.isArray(g.urls)) : [];
  } catch { return DEFAULT_GROUPS; }
}
function saveGroups(groups) { localStorage.setItem(STORAGE_KEY, JSON.stringify(groups)); }
function safeUrl(raw) {
  try { const url = new URL(raw.trim()); return ["http:", "https:"].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function notify(message) {
  toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function cleanUrls(urls) { return urls.map(s => s.trim()).filter(Boolean).map(safeUrl).filter(Boolean); }
function iconMarkup(group, className = "group-icon") {
  if (group.iconImage && /^data:image\/(png|jpeg|webp);base64,/.test(group.iconImage)) {
    return `<span class="${className} image-icon-wrap"><img src="${group.iconImage}" alt="" class="uploaded-icon"></span>`;
  }
  return `<span class="${className}" aria-hidden="true">${escapeHtml(group.icon || "🔗")}</span>`;
}
function updateIconPreview(dataUrl) {
  pendingIconImage = dataUrl || "";
  iconPreview.src = pendingIconImage;
  iconPreviewWrap.hidden = !pendingIconImage;
}
linkIconFile.addEventListener("change", () => {
  const file = linkIconFile.files && linkIconFile.files[0];
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    linkIconFile.value = ""; notify("Please upload a PNG, JPG, or WEBP image."); return;
  }
  if (file.size > 500 * 1024) {
    linkIconFile.value = ""; notify("Icon image must be 500 KB or smaller."); return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      // Resize uploaded icon to keep localStorage usage reasonable.
      const canvas = document.createElement("canvas");
      const maxSide = 256;
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      updateIconPreview(canvas.toDataURL("image/png"));
    };
    img.onerror = () => notify("Could not read that image. Please try another one.");
    img.src = reader.result;
  };
  reader.onerror = () => notify("Could not read that image. Please try again.");
  reader.readAsDataURL(file);
});
removeIconButton.addEventListener("click", () => {
  linkIconFile.value = "";
  updateIconPreview("");
  notify("Uploaded icon removed. The emoji/symbol will be used.");
});

function renderPublic() {
  const all = getGroups();
  const q = searchInput.value.trim().toLowerCase();
  const filtered = all.map(g => ({...g, urls: g.urls.filter(u => !q || `${g.title} ${g.description || ""} ${u}`.toLowerCase().includes(q))}))
    .filter(g => !q || g.title.toLowerCase().includes(q) || String(g.description || "").toLowerCase().includes(q) || g.urls.length);
  const totalUrls = all.reduce((sum, g) => sum + g.urls.length, 0);
  linkCount.textContent = totalUrls;
  groupCount.textContent = `${all.length} ${all.length === 1 ? "group" : "groups"}`;
  resultLabel.textContent = `${filtered.length} ${filtered.length === 1 ? "group" : "groups"}`;
  linksGrid.innerHTML = filtered.map(g => {
    const urls = g.urls.filter(u => safeUrl(u) && (!q || g.title.toLowerCase().includes(q) || String(g.description || "").toLowerCase().includes(q) || u.toLowerCase().includes(q)));
    return `<article class="group-card">
      <div class="group-heading">
        ${iconMarkup(g)}
        <div class="group-title-wrap"><h3>${escapeHtml(g.title)}</h3><p>${escapeHtml(g.description || `${g.urls.length} backup links available`)}</p></div>
        <span class="group-count">${urls.length}</span>
      </div>
      <div class="url-list">${urls.map((u, i) => `<a class="url-item" href="${escapeHtml(safeUrl(u))}" target="_blank" rel="noopener noreferrer">
        <span class="url-index">${String(i + 1).padStart(2, "0")}</span><span class="url-text">${escapeHtml(u)}</span><span class="url-open" aria-label="Open link">↗</span>
      </a>`).join("")}</div>
    </article>`;
  }).join("");
  emptyState.hidden = filtered.length !== 0;
}
function renderAdmin() {
  const all = getGroups();
  adminLinks.innerHTML = all.length ? all.map(g => `<div class="admin-row">
    ${iconMarkup(g, "admin-group-icon")}
    <span class="admin-row-info"><strong>${escapeHtml(g.title)} · ${g.urls.length} links</strong><small>${escapeHtml(g.urls[0] || "No URLs")}</small></span>
    <span class="admin-actions"><button class="button button-ghost" type="button" data-edit="${escapeHtml(g.id)}">Edit</button><button class="button button-ghost" type="button" data-delete="${escapeHtml(g.id)}">Delete</button></span>
  </div>`).join("") : '<p class="muted">No backup groups saved in this browser yet.</p>';
}
function resetForm() {
  linkForm.reset(); editingId.value = ""; linkIcon.value = "🔗"; linkIconFile.value = "";
  updateIconPreview("");
  saveLinkButton.textContent = "＋ Add backup group"; cancelEditButton.hidden = true;
}
document.getElementById("adminToggle").addEventListener("click", () => {
  if (isAdmin) { adminPanel.hidden = !adminPanel.hidden; if (!adminPanel.hidden) adminPanel.scrollIntoView({behavior:"smooth", block:"start"}); }
  else { loginError.hidden = true; adminPassword.value = ""; loginDialog.showModal(); }
});
document.getElementById("closeLogin").addEventListener("click", () => loginDialog.close());
loginForm.addEventListener("submit", event => {
  event.preventDefault();
  if (adminPassword.value !== DEMO_ADMIN_KEY) { loginError.hidden = false; return; }
  isAdmin = true; loginDialog.close(); adminPanel.hidden = false;
  document.getElementById("adminToggle").textContent = "Admin Panel";
  renderAdmin(); adminPanel.scrollIntoView({behavior:"smooth", block:"start"}); notify("Demo admin panel opened.");
});
document.getElementById("logoutButton").addEventListener("click", () => {
  isAdmin = false; adminPanel.hidden = true; document.getElementById("adminToggle").textContent = "Admin Login";
  resetForm(); notify("Logged out of demo panel.");
});
searchInput.addEventListener("input", renderPublic);
linkForm.addEventListener("submit", event => {
  event.preventDefault(); if (!isAdmin) return;
  const rawUrls = linkUrls.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const urls = cleanUrls(rawUrls);
  if (!linkTitle.value.trim()) { notify("Please enter a group title."); return; }
  if (!urls.length) { notify("Enter at least one valid http:// or https:// URL, one per line."); return; }
  if (urls.length !== rawUrls.length) { notify("Some URLs were invalid and have been skipped."); }
  const groups = getGroups(); const id = editingId.value;
  const oldGroup = groups.find(g => g.id === id);
  const item = {id: id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), title: linkTitle.value.trim(), icon: linkIcon.value.trim() || "🔗", iconImage: pendingIconImage || (oldGroup && oldGroup.iconImage) || "", description: linkDescription.value.trim(), urls};
  const index = groups.findIndex(g => g.id === id);
  if (index >= 0) groups[index] = item; else groups.unshift(item);
  try { saveGroups(groups); } catch { notify("Could not save. Browser storage may be full or disabled."); return; }
  resetForm(); renderPublic(); renderAdmin(); notify(index >= 0 ? "Backup group updated." : "Backup group added.");
});
cancelEditButton.addEventListener("click", resetForm);
adminLinks.addEventListener("click", event => {
  const edit = event.target.closest("[data-edit]"); const del = event.target.closest("[data-delete]");
  if (edit) {
    const g = getGroups().find(x => x.id === edit.dataset.edit); if (!g) return;
    editingId.value = g.id; linkTitle.value = g.title; linkIcon.value = g.icon || "🔗";
    linkUrls.value = g.urls.join("\n"); linkDescription.value = g.description || "";
    linkIconFile.value = ""; updateIconPreview(g.iconImage || "");
    saveLinkButton.textContent = "Save changes"; cancelEditButton.hidden = false;
    linkForm.scrollIntoView({behavior:"smooth", block:"center"});
  }
  if (del) {
    const g = getGroups().find(x => x.id === del.dataset.delete);
    if (!g || !confirm(`Delete the group "${g.title}" and its links?`)) return;
    saveGroups(getGroups().filter(x => x.id !== g.id)); renderPublic(); renderAdmin(); notify("Backup group deleted.");
  }
});
document.getElementById("exportButton").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(getGroups(), null, 2)], {type:"application/json"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "star-management-backup-groups.json"; a.click(); URL.revokeObjectURL(a.href);
});
document.getElementById("importInput").addEventListener("change", async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed)) throw new Error("Expected JSON array");
    const cleaned = parsed.map(g => {
      const urls = Array.isArray(g.urls) ? cleanUrls(g.urls.map(String)) : [];
      if (!String(g.title || "").trim() || !urls.length) return null;
      const iconImage = typeof g.iconImage === "string" && /^data:image\/(png|jpeg|webp);base64,/.test(g.iconImage) ? g.iconImage : "";
      return {id:String(g.id || (crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random())), title:String(g.title).slice(0,80), icon:String(g.icon || "🔗").slice(0,12), iconImage, description:String(g.description || "").slice(0,160), urls};
    }).filter(Boolean);
    if (!confirm(`Import ${cleaned.length} valid groups and replace the current list?`)) return;
    saveGroups(cleaned); renderPublic(); renderAdmin(); notify("Backup groups imported.");
  } catch { notify("Could not import. Please choose a valid JSON backup file."); }
  event.target.value = "";
});
renderPublic();
