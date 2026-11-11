/* ============================================================================
   VENTAGE MALL — app.js
   ----------------------------------------------------------------------------
   CÓMO SE MUESTRA UN NUEVO PRODUCTO EN LA GRID
   ----------------------------------------------------------------------------
   1. Añade el objeto al array PRODUCTS en products.js:
      {
        id: "nuevo-articulo",            // único, kebab-case
        brand: "Marca",
        name: "Nombre del artículo",
        rayon: "hombre",                 // hombre|mujer|relojes|gafas|joyas|maletas
        price: 42000,                    // precio original en XAF (number)
        promo: false,                    // true → badge −30 % y precio tachado
        image: "assets/products/nuevo-articulo.jpg",
        sizes: ["S","M","L","XL"]        // o ["40".."44"] para calzado, ["Única"] para accesorios
      }
   2. Coloca la foto en assets/products/nuevo-articulo.jpg (mismo nombre que id).
   3. Recarga la página. El producto aparece automáticamente:
      - en la grid del rayon correspondiente
      - en los filtros de marca y talla
      - en la búsqueda
      - en "Destacados" de la home si está entre los primeros
   No hace falta tocar este archivo ni el HTML.
   ============================================================================ */
"use strict";

const WA_NUMBER = "240222619606";
const RAYON_LABELS = {
  hombre: "Hombre",
  mujer: "Mujer",
  ninos: "Niños",
  relojes: "Relojes",
  gafas: "Gafas",
  joyas: "Joyas",
  accesorios: "Accesorios",
  maletas: "Maletas"
};
const RAYON_ORDER = ["hombre", "mujer", "ninos", "relojes", "gafas", "joyas", "accesorios", "maletas"];
const PROMO_END = new Date("2026-12-31T23:59:59+01:00");

const money = new Intl.NumberFormat("fr-FR");
const fmt = n => money.format(n) + " XAF";
/* Si promo === true: el precio mostrado es `price` (ya es el precio final −30 %).
   El precio tachado (antes) se reconstruye: Math.round(price / 0.7). */
const wasPrice = p => Math.round(p.price / 0.7);

/* ---------- Estado ---------- */
let currentView = "home";           // "home" | "rayon"
let currentRayon = "todo";          // rayon activo en la grid
let marca = "";                     // filtro marca (una sola)
let sortBy = "featured";
let query = "";
let priceMin = "", priceMax = "";
let onlyPromo = false;
let talla = "";                     // filtro talla
let cart = JSON.parse(localStorage.getItem("vm_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("vm_wish") || "[]");
let currentProduct = null;
let currentQty = 1;
let selectedSize = "";

/* ---------- Persistencia ---------- */
const saveCart = () => localStorage.setItem("vm_cart", JSON.stringify(cart));
const saveWish = () => localStorage.setItem("vm_wish", JSON.stringify(wishlist));

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Filtro base por rayon ---------- */
function inShelf(p) {
  if (currentRayon === "todo") return true;
  if (currentRayon === "promo") return !!p.promo;
  return p.rayon === currentRayon;
}

/* ---------- Productos visibles (filtros + búsqueda + orden) ---------- */
function visible() {
  const q = query.trim().toLowerCase();
  let items = PRODUCTS.filter(p => {
    if (!inShelf(p)) return false;
    if (marca && p.brand !== marca) return false;
    if (onlyPromo && !p.promo) return false;
    if (talla && !p.sizes.includes(talla)) return false;
    if (priceMin !== "" && p.price < Number(priceMin)) return false;
    if (priceMax !== "" && p.price > Number(priceMax)) return false;
    if (!q) return true;
    return (p.brand + " " + p.name + " " + p.rayon).toLowerCase().includes(q);
  });
  switch (sortBy) {
    case "price-asc": items.sort((a,b) => a.price - b.price); break;
    case "price-desc": items.sort((a,b) => b.price - a.price); break;
    case "promo": items.sort((a,b) => (b.promo - a.promo) || (a.price - b.price)); break;
    case "brand": items.sort((a,b) => a.brand.localeCompare(b.brand, "es") || a.name.localeCompare(b.name, "es")); break;
  }
  return items;
}

/* ---------- Marcas reales del rayon actual ---------- */
function brandsInRayon() {
  return [...new Set(PRODUCTS.filter(inShelf).map(p => p.brand))]
    .sort((a,b) => a.localeCompare(b, "es"));
}

/* ---------- Tallas disponibles en el rayon actual ---------- */
function sizesInRayon() {
  const set = new Set();
  PRODUCTS.filter(inShelf).forEach(p => p.sizes.forEach(s => set.add(s)));
  const arr = [...set];
  if (arr.length <= 1 && arr[0] === "Única") return [];
  const num = arr.filter(s => /^\d+$/.test(s)).sort((a,b) => Number(a) - Number(b));
  const order = ["S","M","L","XL"];
  const lett = arr.filter(s => !/^\d+$/.test(s)).sort((a,b) => order.indexOf(a) - order.indexOf(b));
  return [...num, ...lett];
}

/* ---------- Precio min/max del rayon ---------- */
function priceRange() {
  const items = PRODUCTS.filter(inShelf);
  if (!items.length) return [0, 0];
  return [Math.min(...items.map(p => p.price)), Math.max(...items.map(p => p.price))];
}

/* ---------- Render: cards de producto ---------- */
function heartSVG() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
}

function makeCard(p, eager) {
  const a = document.createElement("article");
  a.className = "card";
  const wished = wishlist.includes(p.id);
  const loading = eager ? "eager" : "lazy";
  const priority = eager ? "high" : "auto";
  a.innerHTML = ''
    + '<div class="card-photo">'
    +   '<img src="' + p.image + '" alt="' + esc(p.brand) + ' ' + esc(p.name) + '" width="600" height="800" loading="' + loading + '" fetchpriority="' + priority + '" decoding="async">'
    +   (p.promo ? '<span class="card-badge">−30 %</span>' : '')
    +   '<button class="card-wish' + (wished ? ' active' : '') + '" aria-label="Añadir a favoritos">' + heartSVG() + '</button>'
    + '</div>'
    + '<div class="card-info">'
    +   '<p class="card-brand">' + esc(p.brand) + '</p>'
    +   '<p class="card-name">' + esc(p.name) + '</p>'
    +   '<div class="card-prices">'
    +     '<span class="card-price' + (p.promo ? ' promo' : '') + '">' + fmt(p.price) + '</span>'
    +     (p.promo ? '<span class="card-was">' + fmt(wasPrice(p)) + '</span>' : '')
    +   '</div>'
    + '</div>';
  a.querySelector(".card-wish").onclick = (e) => { e.stopPropagation(); toggleWish(p.id); };
  a.onclick = () => openProduct(p.id);
  return a;
}

/* ---------- Render: grid principal ---------- */
function renderGrid() {
  const items = visible();
  const label = currentRayon === "promo" ? "Ofertas · " : (marca ? marca + " · " : "");
  $("gridCount").textContent = label + items.length + (items.length === 1 ? " artículo" : " artículos");
  $("rayonCount").textContent = items.length + (items.length === 1 ? " artículo" : " artículos");

  const grid = $("grid");
  const empty = $("empty");
  if (!items.length) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.innerHTML = "";
  items.forEach((p, i) => grid.appendChild(makeCard(p, i < 4)));
}

/* ---------- Render: filtros sidebar ---------- */
function checkRow(label, checked, fn) {
  const l = document.createElement("label");
  l.className = "check-row";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.onchange = fn;
  const span = document.createElement("span");
  span.textContent = label;
  l.append(input, span);
  return l;
}

function radioRow(label, checked, fn, name) {
  const l = document.createElement("label");
  l.className = "check-row";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = name;
  input.checked = checked;
  input.onchange = fn;
  const span = document.createElement("span");
  span.textContent = label;
  l.append(input, span);
  return l;
}

function renderFilters() {
  // Rayon (radio)
  const fr = $("fRayons");
  fr.innerHTML = "";
  const rayons = [["todo", "Todo"], ["promo", "Ofertas"]].concat(RAYON_ORDER.map(r => [r, RAYON_LABELS[r]]));
  rayons.forEach(([id, label]) => {
    fr.appendChild(radioRow(label, currentRayon === id, () => {
      currentRayon = id; marca = ""; talla = ""; priceMin = ""; priceMax = "";
      $("fPriceMin").value = ""; $("fPriceMax").value = "";
      renderAll();
    }, "f-rayon"));
  });

  // Marca (checkbox, una sola seleccionada)
  const fb = $("fBrands");
  fb.innerHTML = "";
  brandsInRayon().forEach(name => {
    fb.appendChild(checkRow(name, marca === name, (e) => {
      marca = e.target.checked ? name : "";
      renderAll();
    }));
  });

  // Talla
  const sizes = sizesInRayon();
  const fsBlock = $("fSizesBlock");
  const fs = $("fSizes");
  fs.innerHTML = "";
  if (sizes.length) {
    fsBlock.hidden = false;
    sizes.forEach(s => {
      fs.appendChild(checkRow(s, talla === s, (e) => {
        talla = e.target.checked ? s : "";
        renderAll();
      }));
    });
  } else {
    fsBlock.hidden = true;
  }

  // Rango precio placeholder
  const range = priceRange();
  $("fPriceMin").placeholder = "Mín " + money.format(range[0]);
  $("fPriceMax").placeholder = "Máx " + money.format(range[1]);
}

function renderAll() {
  renderFilters();
  renderGrid();
  const title = currentRayon === "todo" ? "Todo" :
                currentRayon === "promo" ? "Ofertas" :
                RAYON_LABELS[currentRayon];
  $("rayonTitle").textContent = title;
  $("crumbRayon").textContent = title;
}

/* ---------- Render: home ---------- */
function renderHome() {
  const catRow = $("catRow");
  catRow.innerHTML = "";
  RAYON_ORDER.forEach(r => {
    const items = PRODUCTS.filter(p => p.rayon === r);
    if (!items.length) return;
    const card = document.createElement("div");
    card.className = "cat-card";
    card.innerHTML = ''
      + '<img src="' + items[0].image + '" alt="' + RAYON_LABELS[r] + '" width="300" height="400" loading="lazy" decoding="async">'
      + '<div class="cat-card-info"><strong>' + RAYON_LABELS[r] + '</strong><span>' + items.length + '</span></div>';
    card.onclick = () => goRayon(r);
    catRow.appendChild(card);
  });

  const feat = PRODUCTS.slice().sort((a,b) => (b.promo - a.promo) || (a.price - b.price)).slice(0, 12);
  const featGrid = $("featuredGrid");
  featGrid.innerHTML = "";
  feat.forEach((p, i) => featGrid.appendChild(makeCard(p, i < 2)));

  const brandOrder = ["Calvin Klein", "BOSS", "EA7", "Love Moschino", "ALDO", "Jack & Jones", "Fossil", "ONLY", "LIU JO", "TOUS"];
  const fresh = brandOrder
    .map(brand => PRODUCTS.slice().reverse().find(p => p.brand === brand))
    .filter(Boolean);
  const freshGrid = $("newArrivalsGrid");
  if (freshGrid) {
    freshGrid.innerHTML = "";
    fresh.forEach((p) => freshGrid.appendChild(makeCard(p, false)));
  }
}

/* ---------- Navigation vues ---------- */
function goHome() {
  currentView = "home";
  $("view-home").hidden = false;
  $("view-rayon").hidden = true;
  document.querySelectorAll(".main-nav button").forEach(item => item.classList.toggle("is-active", item.classList.contains("nav-home")));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goRayon(rayon) {
  currentView = "rayon";
  document.querySelectorAll(".main-nav button").forEach(item => item.classList.toggle("is-active", item.dataset.rayon === rayon));
  currentRayon = rayon;
  marca = ""; talla = ""; priceMin = ""; priceMax = ""; onlyPromo = false;
  $("fPriceMin").value = ""; $("fPriceMax").value = ""; $("fOnlyPromo").checked = false;
  $("view-home").hidden = true;
  $("view-rayon").hidden = false;
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Fiche produit ---------- */
function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;
  currentQty = 1;
  selectedSize = p.sizes.length === 1 ? p.sizes[0] : "";
  $("qtyVal").textContent = "1";

  $("simg").src = p.image;
  $("simg").alt = p.brand + " " + p.name;
  $("sbrand").textContent = p.brand;
  $("sname").textContent = p.name;
  $("sbadge").hidden = !p.promo;
  const sp = $("sprice");
  sp.textContent = fmt(p.price);
  sp.classList.toggle("promo", !!p.promo);
  const sw = $("swas");
  sw.hidden = !p.promo;
  sw.textContent = p.promo ? fmt(wasPrice(p)) : "";
  $("swish").classList.toggle("active", wishlist.includes(p.id));

  // Tailles
  const sizesRow = $("sizesRow");
  sizesRow.innerHTML = "";
  p.sizes.forEach(s => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "size-chip" + (selectedSize === s ? " on" : "");
    b.textContent = s;
    b.onclick = () => {
      selectedSize = s;
      sizesRow.querySelectorAll(".size-chip").forEach(c => c.classList.remove("on", "error"));
      b.classList.add("on");
    };
    sizesRow.appendChild(b);
  });

  // Similaires : 4 del mismo rayon, otro id
  const sim = PRODUCTS.filter(x => x.id !== p.id && x.rayon === p.rayon).slice(0, 4);
  const simWrap = $("similarWrap");
  const simRow = $("similar");
  simRow.innerHTML = "";
  if (sim.length) {
    simWrap.hidden = false;
    sim.forEach(s => {
      const d = document.createElement("div");
      d.className = "similar-card";
      d.innerHTML = ''
        + '<img src="' + s.image + '" alt="' + esc(s.brand) + ' ' + esc(s.name) + '" width="150" height="200" loading="lazy" decoding="async">'
        + '<p>' + esc(s.brand) + '</p><p class="p">' + fmt(s.price) + '</p>';
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

function reserveText(p, qty, tallaSel) {
  return "Hola Ventage Mall, quiero reservar: " + p.name + " (" + p.brand +
    "), talla " + tallaSel + ", cantidad " + qty + ", precio " + p.price + " XAF.";
}

/* ---------- Cesta ---------- */
function cartQty() { return cart.reduce((s, i) => s + i.qty, 0); }
function cartTotal() {
  return cart.reduce((s, i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return p ? s + p.price * i.qty : s;
  }, 0);
}

function addToCart(id, qty, tallaSel) {
  const line = cart.find(i => i.id === id && i.talla === tallaSel);
  if (line) line.qty += qty;
  else cart.push({ id, qty, talla: tallaSel });
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
    row.innerHTML = ''
      + '<img src="' + p.image + '" alt="' + esc(p.brand) + ' ' + esc(p.name) + '" width="64" height="84">'
      + '<div class="cart-item-info">'
      +   '<p class="cart-item-brand">' + esc(p.brand) + '</p>'
      +   '<p class="cart-item-name">' + esc(p.name) + '</p>'
      +   '<p class="cart-item-size">Talla: ' + esc(item.talla) + '</p>'
      +   '<p class="cart-item-price">' + fmt(p.price) + '</p>'
      + '</div>'
      + '<div class="cart-item-side">'
      +   '<div class="cart-item-qty">'
      +     '<button data-a="minus" aria-label="Menos">−</button>'
      +     '<span>' + item.qty + '</span>'
      +     '<button data-a="plus" aria-label="Más">+</button>'
      +   '</div>'
      +   '<button class="cart-item-remove" data-a="remove">Quitar</button>'
      + '</div>';
    row.querySelector('[data-a="minus"]').onclick = () => {
      item.qty = Math.max(1, item.qty - 1); saveCart(); updateCartBadge(); renderCart();
    };
    row.querySelector('[data-a="plus"]').onclick = () => {
      item.qty++; saveCart(); updateCartBadge(); renderCart();
    };
    row.querySelector('[data-a="remove"]').onclick = () => {
      cart = cart.filter(i => !(i.id === item.id && i.talla === item.talla));
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
    return "• " + p.name + " (" + p.brand + "), talla " + item.talla +
      " x" + item.qty + " = " + fmt(p.price * item.qty);
  }).filter(Boolean);
  return "Hola Ventage Mall, quiero reservar:\n" + lines.join("\n") +
    "\nTotal de la cesta: " + fmt(cartTotal()) + "\nGracias.";
}

/* ---------- Favoritos ---------- */
function toggleWish(id) {
  const i = wishlist.indexOf(id);
  if (i >= 0) { wishlist.splice(i, 1); toast("Quitado de favoritos"); }
  else { wishlist.push(id); toast("Guardado en favoritos"); }
  saveWish();
  updateWishBadge();
  if (currentView === "home") renderHome();
  renderGrid();
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
    row.innerHTML = ''
      + '<img src="' + p.image + '" alt="' + esc(p.brand) + ' ' + esc(p.name) + '" width="64" height="84">'
      + '<div class="cart-item-info">'
      +   '<p class="cart-item-brand">' + esc(p.brand) + '</p>'
      +   '<p class="cart-item-name">' + esc(p.name) + '</p>'
      +   '<p class="cart-item-price">' + fmt(p.price) + '</p>'
      + '</div>'
      + '<div class="cart-item-side">'
      +   '<button class="cart-item-remove" data-a="rm">Quitar</button>'
      + '</div>';
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
  ["cart", "wish", "filters"].forEach(w => {
    $(w + "Overlay").classList.remove("show");
    $(w + "Drawer").classList.remove("show");
    setTimeout(() => { $(w + "Overlay").hidden = true; $(w + "Drawer").hidden = true; }, 300);
  });
  document.body.style.overflow = "";
}

/* ---------- Panneau filtres mobile ---------- */
function openFiltersMobile() {
  const src = $("filtersCol");
  const dst = $("filtersMobileContent");
  dst.innerHTML = "";
  Array.from(src.children).forEach(n => {
    if (n.nodeType === 1 && !n.classList.contains("btn-clear-filters")) {
      dst.appendChild(n.cloneNode(true));
    }
  });
  bindFilterEvents(dst);
  const clearBtn = document.createElement("button");
  clearBtn.className = "btn-clear-filters";
  clearBtn.textContent = "Limpiar";
  clearBtn.style.marginTop = "16px";
  clearBtn.onclick = clearFilters;
  dst.appendChild(clearBtn);
  openDrawer("filters");
}

function bindFilterEvents(container) {
  const rayons = ["todo", "promo"].concat(RAYON_ORDER);
  const radios = container.querySelectorAll("#fRayons input[type=radio]");
  radios.forEach((inp, i) => {
    inp.onchange = () => {
      currentRayon = rayons[i]; marca = ""; talla = ""; priceMin = ""; priceMax = "";
      renderAll();
      if (window.innerWidth < 1000) openFiltersMobile();
    };
  });
  const brands = brandsInRayon();
  container.querySelectorAll("#fBrands input[type=checkbox]").forEach((inp, i) => {
    inp.onchange = () => {
      marca = inp.checked ? brands[i] : "";
      renderAll();
      if (window.innerWidth < 1000) openFiltersMobile();
    };
  });
  const pmin = container.querySelector("#fPriceMin");
  const pmax = container.querySelector("#fPriceMax");
  if (pmin) pmin.oninput = (e) => { priceMin = e.target.value; renderGrid(); };
  if (pmax) pmax.oninput = (e) => { priceMax = e.target.value; renderGrid(); };
  const op = container.querySelector("#fOnlyPromo");
  if (op) op.onchange = (e) => { onlyPromo = e.target.checked; renderAll(); };
  const sizes = sizesInRayon();
  container.querySelectorAll("#fSizes input[type=checkbox]").forEach((inp, i) => {
    inp.onchange = () => {
      talla = inp.checked ? sizes[i] : "";
      renderAll();
      if (window.innerWidth < 1000) openFiltersMobile();
    };
  });
}

function clearFilters() {
  marca = ""; talla = ""; priceMin = ""; priceMax = ""; onlyPromo = false;
  $("fPriceMin").value = ""; $("fPriceMax").value = ""; $("fOnlyPromo").checked = false;
  renderAll();
  closeDrawers();
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

/* ---------- Événements ---------- */
$("q").addEventListener("input", (e) => {
  query = e.target.value;
  $("clearQ").hidden = !query;
  if (currentView === "home" && query.trim()) {
    goRayon("todo");
  }
  renderGrid();
});
$("clearQ").onclick = () => { $("q").value = ""; query = ""; $("clearQ").hidden = true; renderGrid(); };
$("sort").onchange = (e) => { sortBy = e.target.value; renderGrid(); };
$("resetFilters").onclick = clearFilters;
$("fClear").onclick = clearFilters;

$("fPriceMin").oninput = (e) => { priceMin = e.target.value; renderGrid(); };
$("fPriceMax").oninput = (e) => { priceMax = e.target.value; renderGrid(); };
$("fOnlyPromo").onchange = (e) => { onlyPromo = e.target.checked; renderAll(); };

$("logoLink").onclick = (e) => { e.preventDefault(); goHome(); };
$("crumbHome").onclick = (e) => { e.preventDefault(); goHome(); };
$("promoCta").onclick = () => goRayon("promo");
document.querySelectorAll("[data-rayon]").forEach(button => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const rayon = button.dataset.rayon || "todo";
    goRayon(rayon);
    document.querySelectorAll(".main-nav button").forEach(item => item.classList.toggle("is-active", item === button));
  });
});
document.querySelectorAll("[data-brand]").forEach(button => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    goRayon("todo");
    marca = button.dataset.brand;
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
document.querySelectorAll("[data-scroll-to]").forEach(button => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.getElementById(button.dataset.scrollTo);
    if (target) {
      if (currentView !== "home") {
        goHome();
        window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});
document.querySelectorAll("[data-home-link]").forEach(link => {
  link.addEventListener("click", (event) => { event.preventDefault(); goHome(); });
});
const mobileSearchBtn = $("mobileSearchBtn");
if (mobileSearchBtn) mobileSearchBtn.onclick = () => {
  goHome();
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(() => $("q").focus(), 250);
};
const mobileCartBtn = $("mobileCartBtn");
if (mobileCartBtn) mobileCartBtn.onclick = () => { renderCart(); openDrawer("cart"); };
$("filtersToggle").onclick = openFiltersMobile;
$("filtersClose").onclick = closeDrawers;
$("filtersOverlay").onclick = closeDrawers;

window.addEventListener("scroll", () => {
  $("header").classList.toggle("scrolled", window.scrollY > 8);
}, { passive: true });

$("sheetClose").onclick = hideSheet;
$("sheetOverlay").onclick = hideSheet;
$("qtyMinus").onclick = () => { currentQty = Math.max(1, currentQty - 1); $("qtyVal").textContent = currentQty; };
$("qtyPlus").onclick = () => { currentQty++; $("qtyVal").textContent = currentQty; };

$("swa").onclick = () => {
  if (!currentProduct) return;
  if (currentProduct.sizes.length > 1 && !selectedSize) {
    $("sizesRow").querySelectorAll(".size-chip").forEach(c => c.classList.add("error"));
    toast("Elige una talla");
    return;
  }
  const tallaSel = selectedSize || currentProduct.sizes[0];
  window.open(waLink(reserveText(currentProduct, currentQty, tallaSel)), "_blank", "noreferrer");
};

$("sadd").onclick = () => {
  if (!currentProduct) return;
  if (currentProduct.sizes.length > 1 && !selectedSize) {
    $("sizesRow").querySelectorAll(".size-chip").forEach(c => c.classList.add("error"));
    toast("Elige una talla");
    return;
  }
  const tallaSel = selectedSize || currentProduct.sizes[0];
  addToCart(currentProduct.id, currentQty, tallaSel);
  hideSheet();
  setTimeout(() => openDrawer("cart"), 350);
};

$("swish").onclick = () => { if (currentProduct) toggleWish(currentProduct.id); };

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

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { hideSheet(); closeDrawers(); }
});

window.addEventListener("popstate", () => {
  const id = (location.hash || "").slice(1);
  const p = PRODUCTS.find(x => x.id === id);
  if (p) openProduct(p.id);
  else { hideSheet(); closeDrawers(); }
});

/* ---------- Hero spotlight: mouse-only, scoped to the hero ---------- */
const heroSpotlight = document.querySelector(".hero");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (heroSpotlight && finePointer.matches && !reducedMotion.matches) {
  let spotlightFrame = 0;
  let spotlightX = 62;
  let spotlightY = 38;
  const paintSpotlight = () => {
    heroSpotlight.style.setProperty("--hero-spot-x", spotlightX + "%");
    heroSpotlight.style.setProperty("--hero-spot-y", spotlightY + "%");
    spotlightFrame = 0;
  };
  heroSpotlight.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const rect = heroSpotlight.getBoundingClientRect();
    spotlightX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    spotlightY = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    if (!spotlightFrame) spotlightFrame = window.requestAnimationFrame(paintSpotlight);
  }, { passive: true });
  heroSpotlight.addEventListener("pointerleave", () => {
    spotlightX = 62;
    spotlightY = 38;
    if (!spotlightFrame) spotlightFrame = window.requestAnimationFrame(paintSpotlight);
  }, { passive: true });
}

/* ---------- Dimensional satin ribbon: damped pendulum + live fabric mesh ---------- */
const ribbonHero = document.querySelector(".hero");
const ribbonScene = document.querySelector(".hero-ribbon-scene");
const ribbonSvg = ribbonScene?.querySelector("svg");
const ribbonTag = document.querySelector(".hero-ribbon-tag");
const ribbonCord = document.getElementById("heroRibbonCord");
const ribbonCordGlint = document.getElementById("heroRibbonCordGlint");
const ribbonKnot = document.getElementById("heroRibbonKnot");
const ribbonKnotShadow = document.getElementById("heroRibbonKnotShadow");
const satinShadow = document.getElementById("heroSatinShadow");
const satinFabric = document.getElementById("heroSatinFabric");
const satinClip = document.getElementById("heroSatinClip");
const satinTop = document.getElementById("heroSatinTopEdge");
const satinBottom = document.getElementById("heroSatinBottomEdge");
const satinFoldShadows = document.getElementById("heroSatinFoldShadows");
const satinFoldHighlights = document.getElementById("heroSatinFoldHighlights");
const satinFineHighlights = document.getElementById("heroSatinFineHighlights");
const satinGloss = document.getElementById("heroSatinGloss");

if (ribbonHero && ribbonScene && ribbonSvg && ribbonTag && ribbonCord && satinFabric && !reducedMotion.matches) {
  const mobileRibbon = window.matchMedia("(max-width: 760px)");
  const clampRibbon = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const WIDTH = 620;
  const HEIGHT = 540;
  const POINTS = 23;
  const X0 = -34;
  const X1 = 654;

  let pointerActive = false;
  let pointerX = 0;
  let pointerY = 0;
  let pointerVX = 0;
  let pointerVY = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let lastPointerTime = 0;

  let cardX = 0;
  let cardY = 0;
  let cardVX = 0;
  let cardVY = 0;
  let cardAngle = 0;
  let cardOmega = 0;
  let cardTiltX = 0;
  let cardTiltY = 0;

  let lastFrameTime = 0;
  let ribbonFrame = 0;
  let heroVisible = true;
  let previousGeometry = null;

  const smoothPath = (points) => {
    if (!points.length) return "";
    let d = "M " + points[0].x.toFixed(2) + " " + points[0].y.toFixed(2);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += " C " + c1x.toFixed(2) + " " + c1y.toFixed(2) +
        ", " + c2x.toFixed(2) + " " + c2y.toFixed(2) +
        ", " + p2.x.toFixed(2) + " " + p2.y.toFixed(2);
    }
    return d;
  };

  const closedBand = (top, bottom) => {
    const topD = smoothPath(top);
    const bottomD = smoothPath(bottom.slice().reverse()).replace(/^M/, "L");
    return topD + " L " + bottom[bottom.length - 1].x.toFixed(2) + " " +
      bottom[bottom.length - 1].y.toFixed(2) + " " + bottomD + " Z";
  };

  const lineAtFraction = (top, bottom, fraction, phase, amplitude) => {
    return top.map((point, i) => {
      const lower = bottom[i];
      const t = i / (top.length - 1);
      const ripple = Math.sin(t * 13.2 + phase + fraction * 8.5) *
        Math.sin(Math.PI * t) * amplitude;
      return {
        x: point.x,
        y: point.y + (lower.y - point.y) * fraction + ripple
      };
    });
  };

  const setPath = (element, value) => {
    if (element) element.setAttribute("d", value);
  };

  const updateCord = (anchorX, anchorY) => {
    const rect = ribbonSvg.getBoundingClientRect();
    const cardRect = ribbonTag.getBoundingClientRect();
    const endX = ((cardRect.left + cardRect.width * .5 - rect.left) / (rect.width || 1)) * WIDTH;
    const endY = ((cardRect.top + 2 - rect.top) / (rect.height || 1)) * HEIGHT;
    const dx = endX - anchorX;
    const dy = endY - anchorY;
    const sag = clamp(Math.abs(dx) * .12 + Math.abs(dy) * .08, 18, 52);
    const midX = anchorX + dx * .52;
    const midY = anchorY + dy * .58 + sag;
    const path = "M " + anchorX.toFixed(2) + " " + anchorY.toFixed(2) +
      " C " + (anchorX + dx * .14).toFixed(2) + " " + (anchorY + sag * .7).toFixed(2) +
      ", " + (midX + cardVX * .18).toFixed(2) + " " + midY.toFixed(2) +
      ", " + endX.toFixed(2) + " " + endY.toFixed(2);
    ribbonCord.setAttribute("d", path);
    if (ribbonCordGlint) ribbonCordGlint.setAttribute("d", path);
  };

  const drawFabric = (now, windX, windY, energy, angle) => {
    const seconds = now * .001;
    const phase = seconds * 1.55;
    const top = [];
    const bottom = [];
    const mid = [];

    for (let i = 0; i < POINTS; i++) {
      const t = i / (POINTS - 1);
      const x = X0 + (X1 - X0) * t;
      const envelope = Math.sin(Math.PI * t);
      const slowDrape =
        Math.sin(t * 4.5 + .2) * 48 +
        Math.sin(t * 9.2 - .6) * 22 +
        Math.sin(t * 15.3 + phase * .16) * 6;
      const travelingWave =
        Math.sin(t * 12.8 - phase * 1.85) * (5.5 + energy * 23) * envelope +
        Math.sin(t * 6.4 - phase * .72) * (3.2 + energy * 8) * envelope;
      const fineRipple =
        Math.sin(t * 34 - phase * 3.2) * (2.2 + energy * 5.2) * envelope;
      const windBend = (windY * 12 + windX * 8.5) * Math.pow(t, 1.25);
      const tugBend = (cardY * .17 + cardVX * .34 + angle * 1.25) * Math.pow(t, 1.65);
      const center = 105 + slowDrape + travelingWave + fineRipple + windBend + tugBend;
      const width = 91 +
        Math.sin(t * 6.9 + phase * .5) * 15 +
        Math.sin(t * 15.8 - phase * .8) * (5 + energy * 4);
      const edgeNoise = Math.sin(t * 31 + phase * 1.9) * (1.8 + energy * 3.3) * envelope;
      const topPoint = { x, y: center - width * .5 + edgeNoise };
      const bottomPoint = { x, y: center + width * .5 - edgeNoise * .72 };
      top.push(topPoint);
      bottom.push(bottomPoint);
      mid.push({ x, y: center });
    }

    const band = closedBand(top, bottom);
    setPath(satinFabric, band);
    setPath(satinClip, band);
    setPath(satinShadow, band);

    setPath(satinTop, smoothPath(top));
    setPath(satinBottom, smoothPath(bottom));

    const darkLines = [
      lineAtFraction(top, bottom, .19, phase, 6.4),
      lineAtFraction(top, bottom, .49, phase + 2.1, 5.8),
      lineAtFraction(top, bottom, .79, phase + 4.3, 5.2)
    ];
    const brightLines = [
      lineAtFraction(top, bottom, .10, phase + .7, 4.8),
      lineAtFraction(top, bottom, .35, phase + 3.0, 5.8),
      lineAtFraction(top, bottom, .63, phase + 5.1, 5.2),
      lineAtFraction(top, bottom, .91, phase + 1.7, 3.8)
    ];
    const fineLines = [
      lineAtFraction(top, bottom, .15, phase + 1.1, 2.7),
      lineAtFraction(top, bottom, .42, phase + 4.2, 2.4),
      lineAtFraction(top, bottom, .72, phase + 2.6, 2.8)
    ];

    setPath(satinFoldShadows, darkLines.map(smoothPath).join(" "));
    setPath(satinFoldHighlights, brightLines.map(smoothPath).join(" "));
    setPath(satinFineHighlights, fineLines.map(smoothPath).join(" "));
    setPath(satinGloss, smoothPath(lineAtFraction(top, bottom, .31, phase + 1.8, 10)));

    const crossShadow = [];
    const crossHighlight = [];
    [.14,.31,.49,.68,.86].forEach((t,index) => {
      const pointIndex = Math.round(t * (POINTS - 1));
      const up = top[pointIndex];
      const down = bottom[pointIndex];
      const centerY = (up.y + down.y) * .5;
      const bow = Math.sin(phase * 1.15 + index * 1.7) * (7 + energy * 8);
      const c1x = up.x + bow;
      const c2x = down.x - bow * .55;
      crossShadow.push(
        "M " + up.x.toFixed(2) + " " + up.y.toFixed(2) +
        " C " + c1x.toFixed(2) + " " + (centerY - 10).toFixed(2) +
        ", " + c2x.toFixed(2) + " " + (centerY + 10).toFixed(2) +
        ", " + down.x.toFixed(2) + " " + down.y.toFixed(2)
      );
      crossHighlight.push(
        "M " + (up.x - 2).toFixed(2) + " " + (up.y + 5).toFixed(2) +
        " C " + (c1x - 2).toFixed(2) + " " + (centerY - 8).toFixed(2) +
        ", " + (c2x - 2).toFixed(2) + " " + (centerY + 6).toFixed(2) +
        ", " + (down.x - 2).toFixed(2) + " " + (down.y - 5).toFixed(2)
      );
    });
    setPath(document.getElementById("heroSatinCrossShadows"), crossShadow.join(" "));
    setPath(document.getElementById("heroSatinCrossHighlights"), crossHighlight.join(" "));

    const tieIndex = Math.round((.735) * (POINTS - 1));
    const tiePoint = mid[tieIndex];
    const tieY = tiePoint.y + 24;
    if (ribbonKnot) ribbonKnot.setAttribute("transform", "translate(468 " + tieY.toFixed(2) + ")");
    if (ribbonKnotShadow) {
      ribbonKnotShadow.setAttribute("cx", "468");
      ribbonKnotShadow.setAttribute("cy", (tieY + 3).toFixed(2));
    }
    updateCord(468, tieY + 8);
  };

  const applyCardTransform = () => {
    ribbonTag.style.setProperty("--tag-x", cardX.toFixed(2) + "px");
    ribbonTag.style.setProperty("--tag-y", cardY.toFixed(2) + "px");
    ribbonTag.style.setProperty("--tag-rotation", cardAngle.toFixed(2) + "deg");
    ribbonTag.style.setProperty("--tag-tilt-x", cardTiltX.toFixed(2) + "deg");
    ribbonTag.style.setProperty("--tag-tilt-y", cardTiltY.toFixed(2) + "deg");
  };

  const animateRibbon = (now) => {
    if (!heroVisible || document.visibilityState === "hidden") {
      ribbonFrame = 0;
      lastFrameTime = 0;
      return;
    }
    if (lastFrameTime && now - lastFrameTime < 30) {
      ribbonFrame = window.requestAnimationFrame(animateRibbon);
      return;
    }
    const dt = lastFrameTime ? clamp((now - lastFrameTime) / 16.667, .65, 2.2) : 1;
    lastFrameTime = now;

    const isMobile = mobileRibbon.matches;
    const maxTravelX = isMobile ? 26 : 74;
    const maxTravelY = isMobile ? 22 : 54;

    let collisionX = 0;
    let collisionY = 0;
    let proximity = 0;
    if (pointerActive) {
      const rect = ribbonTag.getBoundingClientRect();
      const centerX = rect.left + rect.width * .5;
      const centerY = rect.top + rect.height * .4;
      const dx = centerX - pointerX;
      const dy = centerY - pointerY;
      const distance = Math.max(1, Math.hypot(dx, dy));
      proximity = clamp(1 - distance / (isMobile ? 155 : 230), 0, 1);
      const hit = proximity * proximity;
      const cursorSpeed = Math.min(1.8, Math.hypot(pointerVX, pointerVY) / 34);
      const impulse = hit * (3.6 + cursorSpeed * 3.4);
      collisionX = (dx / distance) * impulse;
      collisionY = (dy / distance) * impulse;
      if (document.activeElement === ribbonTag) {
        collisionX *= .18;
        collisionY *= .18;
      }
    }

    const ambient = isMobile ? .75 : .55;
    const breezeX = pointerActive ? pointerVX * .07 : Math.sin(now * .00072) * ambient;
    const breezeY = pointerActive ? pointerVY * .055 : Math.sin(now * .00091 + 1.1) * ambient;
    const springX = -.018 * cardX;
    const springY = -.021 * cardY;
    const pointerPushX = collisionX + breezeX * (pointerActive ? .42 : .2);
    const pointerPushY = collisionY + breezeY * (pointerActive ? .36 : .16);

    cardVX += (springX + pointerPushX) * dt;
    cardVY += (springY + pointerPushY + .018 * Math.sin(now * .0011)) * dt;
    cardVX *= Math.pow(.935, dt);
    cardVY *= Math.pow(.925, dt);
    cardX = clamp(cardX + cardVX * dt, -maxTravelX, maxTravelX);
    cardY = clamp(cardY + cardVY * dt, -maxTravelY, maxTravelY);

    const cardCenter = ribbonTag.getBoundingClientRect();
    const leverX = pointerX - (cardCenter.left + cardCenter.width * .5);
    const leverY = pointerY - (cardCenter.top + cardCenter.height * .45);
    const torque = pointerActive
      ? (collisionX * leverY - collisionY * leverX) * .00135 + breezeX * .055
      : breezeX * .025;
    cardOmega += (-cardAngle * .024 - cardOmega * .082 + torque) * dt;
    cardOmega *= Math.pow(.955, dt);
    cardAngle = clamp(cardAngle + cardOmega * dt, -22, 22);

    const rect = ribbonTag.getBoundingClientRect();
    const heroRect = ribbonHero.getBoundingClientRect();
    const normalizedX = pointerActive ? clamp((pointerX - heroRect.left) / heroRect.width - .5, -.5, .5) : 0;
    const normalizedY = pointerActive ? clamp((pointerY - heroRect.top) / heroRect.height - .5, -.5, .5) : 0;
    const desiredTiltX = pointerActive ? clamp(-normalizedY * 10 - cardVY * .24, -8, 8) : Math.sin(now * .001) * .65;
    const desiredTiltY = pointerActive ? clamp(normalizedX * 12 + cardVX * .28, -10, 10) : Math.sin(now * .00083 + .7) * .8;
    cardTiltX += (desiredTiltX - cardTiltX) * .085 * dt;
    cardTiltY += (desiredTiltY - cardTiltY) * .085 * dt;

    applyCardTransform();

    const energy = clamp(Math.hypot(breezeX, breezeY) * .11 +
      Math.hypot(cardVX, cardVY) * .075 + Math.abs(cardAngle) * .018 + proximity * .48, 0, 1.5);
    drawFabric(now, breezeX + cardVX * .09, breezeY + cardVY * .08, energy, cardAngle);

    pointerVX *= Math.pow(.88, dt);
    pointerVY *= Math.pow(.88, dt);

    ribbonFrame = window.requestAnimationFrame(animateRibbon);
  };

  const pointerMove = (event) => {
    if (event.pointerType !== "mouse") return;
    const now = performance.now();
    if (lastPointerTime) {
      const elapsed = Math.max(8, now - lastPointerTime);
      const scale = 16.667 / elapsed;
      const rawX = clamp((event.clientX - lastPointerX) * scale, -72, 72);
      const rawY = clamp((event.clientY - lastPointerY) * scale, -72, 72);
      pointerVX = pointerVX * .32 + rawX * .68;
      pointerVY = pointerVY * .32 + rawY * .68;
    }
    pointerX = event.clientX;
    pointerY = event.clientY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    lastPointerTime = now;
    pointerActive = true;
    if (!ribbonFrame && heroVisible) ribbonFrame = window.requestAnimationFrame(animateRibbon);
  };

  const pointerLeave = () => {
    pointerActive = false;
    lastPointerTime = 0;
  };

  if (finePointer.matches) {
    ribbonHero.addEventListener("pointermove", pointerMove, { passive: true });
    ribbonHero.addEventListener("pointerleave", pointerLeave, { passive: true });
    ribbonTag.addEventListener("focus", () => {
      cardVY -= 1.2;
      cardOmega -= 1.0;
      if (!ribbonFrame && heroVisible) ribbonFrame = window.requestAnimationFrame(animateRibbon);
    });
  }

  const startRibbon = () => {
    if (!ribbonFrame && heroVisible && document.visibilityState !== "hidden") {
      ribbonFrame = window.requestAnimationFrame(animateRibbon);
    }
  };
  const stopRibbon = () => {
    if (ribbonFrame) window.cancelAnimationFrame(ribbonFrame);
    ribbonFrame = 0;
    lastFrameTime = 0;
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      heroVisible = entries.some(entry => entry.isIntersecting);
      if (heroVisible) startRibbon();
      else stopRibbon();
    }, { threshold: .04 });
    observer.observe(ribbonHero);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopRibbon();
    else startRibbon();
  });
  window.addEventListener("resize", () => {
    if (!ribbonFrame && heroVisible) startRibbon();
  }, { passive: true });

  startRibbon();
}

/* ---------- Init ---------- */
updateCartBadge();
updateWishBadge();
renderCart();
renderWish();
renderHome();
renderAll();
tickPromo();
setInterval(tickPromo, 60000);

const initialId = (location.hash || "").slice(1);
if (initialId) {
  const p = PRODUCTS.find(x => x.id === initialId);
  if (p) openProduct(p.id);
}
