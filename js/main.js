// ============================
// Astrava Time – MAIN JS (FINAL)
// ============================

/* ============================
   HELPERS
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

function csvSplit(row) {
  return row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(c =>
    c.replace(/^"|"$/g, "").trim()
  ) || [];
}

/* ============================
   FETCH PRODUCTS (GOOGLE SHEET)
============================ */
async function getProducts() {
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMeQomla92HiTZJTJzcYxsBIWwOAdGB2QcZg_YzShV-cMAFtyr3xO8Qic0GKdQ-dmpy2VldE_ZKIg5/pub?output=csv";

  const res = await fetch(SHEET_URL);
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
   SEARCH
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

  // Elements
  const nameEl = document.getElementById("productName");
  const priceEl = document.getElementById("productPrice");
  const carousel = document.getElementById("productImages");

  // Set text
  nameEl.textContent = product.name;
  priceEl.textContent = `₹${product.price}`;

  // Inject images
  carousel.innerHTML = `
    <button class="carousel-btn left" id="prevImg">‹</button>
    <button class="carousel-btn right" id="nextImg">›</button>
  `;

  product.images.forEach((img, i) => {
    const image = document.createElement("img");
    image.src = img;
    if (i === 0) image.classList.add("active");
    carousel.appendChild(image);
  });

  // Carousel logic
  let current = 0;
  const imgs = carousel.querySelectorAll("img");

  function show(index) {
    imgs.forEach((img, i) =>
      img.classList.toggle("active", i === index)
    );
  }

  document.getElementById("prevImg").onclick = () => {
    current = (current - 1 + imgs.length) % imgs.length;
    show(current);
  };

  document.getElementById("nextImg").onclick = () => {
    current = (current + 1) % imgs.length;
    show(current);
  };

  // Fill hidden form fields
  document.getElementById("formProduct").value = product.name;
  document.getElementById("formPrice").value = product.price;
}

/* ============================
   ORDER FORM (GOOGLE FORM)
============================ */
function setupOrderForm() {
  const form = document.getElementById("orderForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const fd = new FormData();

    fd.append("entry.1639427243", form.name.value);      // Name
    fd.append("entry.1232107661", form.phone.value);     // Phone
    fd.append("entry.1604223165", form.address.value);   // Address
    fd.append("entry.1179661157", form.product.value);   // ✅ PRODUCT ID
    fd.append("entry.129241642", form.price.value);      // Price
    fd.append("entry.1102739931", form.pincode.value);   // Pincode
    fd.append("entry.5720000000", form.instagram.value); // Instagram

    fetch(
      "https://docs.google.com/forms/d/e/1FAIpQLSf_flo6YyS3GHwTwc88i--LELY_IyIA9IiYUF4YP8wF0y2wgw/formResponse",
      { method: "POST", mode: "no-cors", body: fd }
    ).then(() => {
      window.location.href = "success.html";
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
