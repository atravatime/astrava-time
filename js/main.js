// ============================
// Astrava Time – Main JS (FIXED & STABLE)
// ============================

/* ============================
   IMAGE CLEANER
============================ */
function cleanImage(url) {
  if (!url) return "";
  return url
    .replace(/\r?\n|\r/g, "")
    .trim()
    .replace(/^"+|"+$/g, "")
    .replace(/\.jpg\.jpg$/i, ".jpg")
    .replace(/\.png\.png$/i, ".png");
}

/* ============================
   CSV SAFE SPLIT
============================ */
function csvSplit(row) {
  return row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(c =>
    c.replace(/^"|"$/g, "").trim()
  ) || [];
}

/* ============================
   FETCH PRODUCTS
============================ */
async function getProducts() {
  const sheetURL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMeQomla92HiTZJTJzcYxsBIWwOAdGB2QcZg_YzShV-cMAFtyr3xO8Qic0GKdQ-dmpy2VldE_ZKIg5/pub?output=csv";

  const res = await fetch(sheetURL);
  const text = await res.text();

  const rows = text.split("\n").slice(1);

  return rows
    .map(row => {
      const cols = csvSplit(row);

      return {
        id: cols[0],
        name: cols[1],
        price: cols[2],
        images: cols.slice(3).map(cleanImage).filter(Boolean)
      };
    })
    .filter(p => p.id && p.name);
}

/* ============================
   SHOP PAGE
============================ */
async function loadShopProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const products = await getProducts();
  grid.innerHTML = "";

  products.forEach(p => {
    if (!p.images.length) return;

    const card = document.createElement("a");
    card.href = `product.html?id=${p.id}`;
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.images[0]}" alt="${p.name}">
      <div class="product-info">
        <h3>${p.name}</h3>
        <span>₹${p.price}</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ============================
   SEARCH (SHOP)
============================ */
function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const val = input.value.toLowerCase();
    document.querySelectorAll(".product-card").forEach(card => {
      card.style.display = card.innerText.toLowerCase().includes(val)
        ? ""
        : "none";
    });
  });
}

/* ============================
   PRODUCT PAGE
============================ */
async function loadProductPage() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;

  const products = await getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const carousel = document.getElementById("productImages");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const formProduct = document.getElementById("formProduct");
  const formPrice = document.getElementById("formPrice");

  if (!carousel) return;

  productName.textContent = product.name;
  productPrice.textContent = `₹${product.price}`;
  formProduct.value = product.name;
  formPrice.value = product.price;

  carousel.innerHTML = "";

  product.images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = i === 0 ? "active" : "";
    carousel.appendChild(img);
  });

  const imgs = carousel.querySelectorAll("img");
  let index = 0;

  if (imgs.length < 2) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    return;
  }

  function show(i) {
    imgs.forEach(img => img.classList.remove("active"));
    imgs[i].classList.add("active");
  }

  prevBtn.onclick = () => {
    index = (index - 1 + imgs.length) % imgs.length;
    show(index);
  };

  nextBtn.onclick = () => {
    index = (index + 1) % imgs.length;
    show(index);
  };
}

/* ============================
   ORDER FORM (GOOGLE FORM)
============================ */
function setupOrderForm() {
  const form = document.getElementById("orderForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    fetch(
      "https://docs.google.com/forms/d/e/1FAIpQLSf_flo6YyS3GHwTwc88i--LELY_IyIA9IiYUF4YP8wF0y2wgw/formResponse",
      {
        method: "POST",
        mode: "no-cors",
        body: new FormData(form)
      }
    ).then(() => {
      location.href = "success.html";
    });
  });
}

/* ============================
   INIT
============================ */
document.addEventListener("DOMContentLoaded", () => {
  loadShopProducts();
  setupSearch();
  loadProductPage();
  setupOrderForm();
});
