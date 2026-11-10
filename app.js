/* ============ VENTAGE MALL — app ============ */
"use strict";

const WA_NUMBER = "240222619606";
const RAYONS = [
  ["todo", "Todo"],
  ["promo", "Ofertas −30%"],
  ["hombre", "Hombre"],
  ["mujer", "Mujer"],
  ["relojes", "Relojes"],
  ["joyas", "Joyas"],
  ["gafas", "Gafas"],
  ["maletas", "Maletas"]
];
const PROMO_END = new Date("2026-12-31T23:59:59+01:00");

const money = new Intl.NumberFormat("fr-FR");
const fmt = n => money.format(n) + " XAF";
const sale = n => Math.round((n * 0.7) / 1000) * 1000;
const pay = p => p.promo ? sale(p.price) : p.price;

/* ---------- State ---------- */
let rayon = "todo", marca = "", sortBy = "featured", query = "";
let cart = JSON.parse(localStorage.getItem("vm_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("vm_wish") || "[]");
let currentProduct = null, currentQty = 1;

/* ---------- Persist ---------- */
const saveCart = () => localStorage.setItem("vm_cart", JSON.stringify(cart));
const saveWish = () => localStorage.setItem("vm_wish", JSON.stringify(wishlist));

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#39;"}[c]));

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

function inShelf(p) {
  if (rayon === "todo") return true;
  if (rayon === "promo") return !!p.promo;
  return p.rayon === rayon;
}

function visible() {
  const q = query.trim().toLowerCase();
  let items = PRODUCTS.filter(p => {
    if (!inShelf(p)) return false;
    if (marca && p.brand !== marca) return false;
    if (!q) return true;
    return (p.brand + " " + p.name + " " + p.rayon).toLowerCase().includes(q);
  });
  switch (sortBy) {
    case "price-asc": items.sort((a,b) => pay(a) - pay(b)); break;
    case "price-desc": items.sort((a,b) => pay(b) - pay(a)); break;
    case "promo": items.sort((a,b) => (b.promo - a.promo) || (pay(a) - pay(b))); break;
    case "brand": items.sort((a,b) => a.brand.localeCompare(b.brand, "es") || a.name.localeCompare(b.name, "es")); break;
  }
  return items;
}

function brands() {
  return [...new Set(PRODUCTS.filter(inShelf).map(p => p.brand))]
    .sort((a,b) => a.localeCompare(b, "es"));
}

/* ---------- Rendering: filters ---------- */
function chip(label, on, fn, extra) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip" + (on ? " on" : "") + (extra ? " " + extra : "");
  b.textContent = label;
  b.onclick = fn;
  return b;
}

function renderFilters() {
  const ray = $("rayons");
  ray.innerHTML = "";
  RAYONS.forEach(([id, label]) =>
    ray.appendChild(chip(label, id === rayon, () => { rayon = id; marca = ""; render(); })));

  const br = $("brands");
  br.innerHTML = "";
  br.appendChild(chip("Todas las marcas", marca === "", () => { marca = ""; render(); }));
  brands().forEach(name =>
    br.appendChild(chip(name, name === marca, () => { marca = marca === name ? "" : name; render(); })));
}

/* ---------- Rendering: grid ---------- */
function heartSVG() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
}

function render() {
  renderFilters();
  const items = visible();
  const label = rayon === "promo" ? "Ofertas · " : (marca ? marca + " · " : "");
  $("count").textContent = label + items.length + (items.length === 1 ? " artículo" : " artículos");

  const grid = $("grid");
  const empty = $("empty");
  if (!items.length) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.innerHTML = "";

  items.forEach(p => {
    const a = document.createElement("article");
    a.className = "card";

    const wished = wishlist.includes(p.id);
    a.innerHTML = `
      <div class="card-photo">
        <img src="${p.image}" alt="${esc(p.brand)} ${esc(p.name)}" loading="lazy">
        ${p.promo ? '<span class="card-badge">−30%</span>' : ''}
        <button class="card-wish${wished ? " active" : ""}" aria-label="Añadir a favoritos">${heartSVG()}</button>
      </div>
      <p class="card-brand">${esc(p.brand)}</p>
      <p class="card-name">${esc(p.name)}</p>
      <div class="card-prices">
        <span class="card-price${p.promo ? " promo" : ""}">${fmt(pay(p))}</span>
        ${p.promo ? `<span class="card-was">${fmt(p.price)}</span>` : ""}
      </div>`;

    a.querySelector(".card-wish").onclick = (e) => { e.stopPropagation(); toggleWish(p.id); };
    a.onclick = () => openProduct(p.id);
    grid.appendChild(a);
  });
}

/* ---------- Product sheet ---------- */
function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;
  currentQty = 1;
  $("qtyVal").textContent = "1";

  $("simg").src = p.image;
  $("simg").alt = p.brand + " " + p.name;
  $("sbrand").textContent = p.brand;
  $("sname").textContent = p.name;
  $("sbadge").hidden = !p.promo;
  const sp = $("sprice");
  sp.textContent = fmt(pay(p));
  sp.classList.toggle("promo", !!p.promo);
  const sw = $("swas");
  sw.hidden = !p.promo;
  sw.textContent = p.promo ? fmt(p.price) : "";
  $("swish").classList.toggle("active", wishlist.includes(p.id));

  // Similar products: same rayon or same brand, excluding current
  const sim = PRODUCTS.filter(x => x.id !== p.id && (x.rayon === p.rayon || x.brand === p.brand))
    .sort((a,b) => (b.brand === p.brand) - (a.brand === p.brand))
    .slice(0, 3);
  const simWrap = $("similarWrap");
  const simRow = $("similar");
  simRow.innerHTML = "";
  if (sim.length) {
    simWrap.hidden = false;
    sim.forEach(s => {
      const d = document.createElement("div");
      d.className = "similar-card";
      d.innerHTML = `<img src="${s.image}" alt="${esc(s.brand)} ${esc(s.name)}"><p>${esc(s.brand)}</p><p class="p">${fmt(pay(s))}</p>`;
      d.onclick = () => openProduct(s.id);
      simRow.appendChild(d);
    });
  } else {
    simWrap.hidden = true;
  }

  history.pushState({ id }, "", "#" + id);
  showSheet();
}

function showSheet() {
  $("sheetOverlay").hidden = false;
  $("sheet").hidden = false;
  requestAnimationFrame(() => {
    $("sheetOverlay").classList.add("show");
    $("sheet").classList.add("show");
  });
  document.body.style.overflow = "hidden";
}

function hideSheet() {
  $("sheetOverlay").classList.remove("show");
  $("sheet").classList.remove("show");
  setTimeout(() => {
    $("sheetOverlay").hidden = true;
    $("sheet").hidden = true;
  }, 300);
  document.body.style.overflow = "";
  if (history.state && history.state.id) history.pushState(null, "", location.pathname);
}

function waLink(text) {
  return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
}

function reserveText(p, qty) {
  const priceLine = p.promo
    ? "Precio promo −30%: " + fmt(pay(p)) + " (antes " + fmt(p.price) + ")"
    : "Precio: " + fmt(p.price);
  return "Hola Ventage Mall, quiero reservar: " + p.brand + " — " + p.name +
    ". Cantidad: " + qty + ". " + priceLine + ".";
}

/* ---------- Cart ---------- */
function cartQty() { return cart.reduce((s, i) => s + i.qty, 0); }
function cartTotal() { return cart.reduce((s, i) => {
  const p = PRODUCTS.find(x => x.id === i.id);
  return p ? s + pay(p) * i.qty : s;
}, 0); }

function addToCart(id, qty) {
  const line = cart.find(i => i.id === id);
  if (line) line.qty += qty;
  else cart.push({ id, qty });
  saveCart();
  updateCartBadge();
  renderCart();
  toast("Añadido a la cesta");
}

function updateCartBadge() {
  const n = cartQty();
  const b = $("cartCount");
  b.hidden = n === 0;
  b.textContent = n;
}

function renderCart() {
  const body = $("cartItems");
  $("cartHeadCount").textContent = cart.length ? "· " + cartQty() : "";
  if (!cart.length) {
    body.innerHTML = '<p class="drawer-empty">Tu cesta está vacía.<br>Explora el catálogo y añade artículos.</p>';
    $("cartFoot").style.display = "none";
    return;
  }
  $("cartFoot").style.display = "";
  body.innerHTML = "";
  cart.forEach(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    if (!p) return;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${p.image}" alt="${esc(p.brand)} ${esc(p.name)}">
      <div class="cart-item-info">
        <p class="cart-item-brand">${esc(p.brand)}</p>
        <p class="cart-item-name">${esc(p.name)}</p>
        <p class="cart-item-price">${fmt(pay(p))}</p>
      </div>
      <div class="cart-item-side">
        <div class="cart-item-qty">
          <button data-a="minus" aria-label="Menos">−</button>
          <span>${item.qty}</span>
          <button data-a="plus" aria-label="Más">+</button>
        </div>
        <button class="cart-item-remove" data-a="remove">Quitar</button>
      </div>`;
    row.querySelector('[data-a="minus"]').onclick = () => {
      item.qty = Math.max(1, item.qty - 1); saveCart(); updateCartBadge(); renderCart();
    };
    row.querySelector('[data-a="plus"]').onclick = () => {
      item.qty++; saveCart(); updateCartBadge(); renderCart();
    };
    row.querySelector('[data-a="remove"]').onclick = () => {
      cart = cart.filter(i => i.id !== item.id);
      saveCart(); updateCartBadge(); renderCart();
    };
    body.appendChild(row);
  });
  $("cartTotal").textContent = fmt(cartTotal());
}

function cartWhatsAppText() {
  const lines = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    if (!p) return "";
    const priceLine = p.promo
      ? fmt(pay(p)) + " (antes " + fmt(p.price) + ")"
      : fmt(p.price);
    return "• " + p.brand + " — " + p.name + " x" + item.qty + " = " + priceLine;
  }).filter(Boolean);
  return "Hola Ventage Mall, quiero reservar:
" + lines.join("
") +
    "
Total estimado: " + fmt(cartTotal()) + "
Gracias.";
}

/* ---------- Wishlist ---------- */
function toggleWish(id) {
  const i = wishlist.indexOf(id);
  if (i >= 0) { wishlist.splice(i, 1); toast("Quitado de favoritos"); }
  else { wishlist.push(id); toast("Guardado en favoritos"); }
  saveWish();
  updateWishBadge();
  render();
  renderWish();
  if (currentProduct) $("swish").classList.toggle("active", wishlist.includes(currentProduct.id));
}

function updateWishBadge() {
  const b = $("wishCount");
  b.hidden = wishlist.length === 0;
  b.textContent = wishlist.length;
}

function renderWish() {
  const body = $("wishItems");
  if (!wishlist.length) {
    body.innerHTML = '<p class="drawer-empty">No tienes favoritos todavía.<br>Toca el corazón en cualquier artículo.</p>';
    return;
  }
  body.innerHTML = "";
  wishlist.forEach(id => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${p.image}" alt="${esc(p.brand)} ${esc(p.name)}">
      <div class="cart-item-info">
        <p class="cart-item-brand">${esc(p.brand)}</p>
        <p class="cart-item-name">${esc(p.name)}</p>
        <p class="cart-item-price">${fmt(pay(p))}</p>
      </div>
      <div class="cart-item-side">
        <button class="cart-item-remove" data-a="rm">Quitar</button>
      </div>`;
    row.querySelector('[data-a="rm"]').onclick = () => toggleWish(id);
    row.querySelector("img").onclick = () => { closeDrawers(); openProduct(id); };
    body.appendChild(row);
  });
}

/* ---------- Drawers ---------- */
function openDrawer(which) {
  closeDrawers();
  const ov = $(which + "Overlay"), dr = $(which + "Drawer");
  ov.hidden = false; dr.hidden = false;
  requestAnimationFrame(() => { ov.classList.add("show"); dr.classList.add("show"); });
  document.body.style.overflow = "hidden";
}
function closeDrawers() {
  ["cart", "wish"].forEach(w => {
    $(w + "Overlay").classList.remove("show");
    $(w + "Drawer").classList.remove("show");
    setTimeout(() => { $(w + "Overlay").hidden = true; $(w + "Drawer").hidden = true; }, 300);
  });
  document.body.style.overflow = "";
}

/* ---------- Promo countdown ---------- */
function promoLeft() {
  const ms = PROMO_END - new Date();
  if (ms <= 0) return "La promo cierra hoy";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = n => String(n).padStart(2, "0");
  return "Quedan " + d + " días · " + pad(h) + " h " + pad(m) + " min";
}
function tickPromo() { $("promoTimer").textContent = promoLeft(); }

/* ---------- Events ---------- */
$("q").addEventListener("input", (e) => {
  query = e.target.value;
  $("clearQ").hidden = !query;
  render();
});
$("clearQ").onclick = () => { $("q").value = ""; query = ""; $("clearQ").hidden = true; render(); };
$("sort").onchange = (e) => { sortBy = e.target.value; render(); };
$("resetFilters").onclick = () => {
  rayon = "todo"; marca = ""; query = ""; $("q").value = ""; $("clearQ").hidden = true;
  render();
};

$("logoLink").onclick = (e) => {
  e.preventDefault();
  rayon = "todo"; marca = ""; query = ""; $("q").value = ""; $("clearQ").hidden = true;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

$("promoCta").onclick = () => {
  rayon = "promo"; marca = "";
  render();
  $("catalogo").scrollIntoView({ behavior: "smooth" });
};

/* Sheet events */
$("sheetClose").onclick = hideSheet;
$("sheetOverlay").onclick = hideSheet;
$("qtyMinus").onclick = () => { currentQty = Math.max(1, currentQty - 1); $("qtyVal").textContent = currentQty; };
$("qtyPlus").onclick = () => { currentQty++; $("qtyVal").textContent = currentQty; };
$("swa").onclick = () => {
  if (!currentProduct) return;
  window.open(waLink(reserveText(currentProduct, currentQty)), "_blank", "noreferrer");
};
$("sadd").onclick = () => {
  if (!currentProduct) return;
  addToCart(currentProduct.id, currentQty);
  hideSheet();
  setTimeout(() => openDrawer("cart"), 350);
};
$("swish").onclick = () => { if (currentProduct) toggleWish(currentProduct.id); };

/* Drawer events */
$("cartBtn").onclick = () => { renderCart(); openDrawer("cart"); };
$("wishBtn").onclick = () => { renderWish(); openDrawer("wish"); };
$("cartClose").onclick = closeDrawers;
$("wishClose").onclick = closeDrawers;
$("cartOverlay").onclick = closeDrawers;
$("wishOverlay").onclick = closeDrawers;
$("cartWa").onclick = () => {
  if (!cart.length) { toast("Tu cesta está vacía"); return; }
  window.open(waLink(cartWhatsAppText()), "_blank", "noreferrer");
};

/* Keyboard */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { hideSheet(); closeDrawers(); }
});

/* Deep link: #product-id */
window.addEventListener("popstate", () => {
  const id = (location.hash || "").slice(1);
  const p = PRODUCTS.find(x => x.id === id);
  if (p) openProduct(p.id);
  else { hideSheet(); closeDrawers(); }
});

/* ---------- Init ---------- */
updateCartBadge();
updateWishBadge();
renderCart();
renderWish();
render();
tickPromo();
setInterval(tickPromo, 60000);

const initialId = (location.hash || "").slice(1);
if (initialId) {
  const p = PRODUCTS.find(x => x.id === initialId);
  if (p) openProduct(p.id);
}
