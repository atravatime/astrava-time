// ============================
// Astrava Time – Main JS
// ============================

// IMAGE CLEANER (CRITICAL)
function cleanImage(url) {
  if (!url) return "";
  return url
    .replace(/\r?\n|\r/g, "")
    .trim()
    .replace(/^"+|"+$/g, "")
    .replace(/\.jpg\.jpg$/i, ".jpg")
    .replace(/\.png\.png$/i, ".png");
}

// ============================
// FETCH PRODUCTS
// ============================
async function getProducts() {
  const sheetURL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMeQomla92HiTZJTJzcYxsBIWwOAdGB2QcZg_YzShV-cMAFtyr3xO8Qic0GKdQ-dmpy2VldE_ZKIg5/pub?output=csv";

  const res = await fetch(sheetURL);
  const text = await res.text();
  const rows = text.split("\n").slice(1);

  return rows.map(row => {
    const cols = row.split(",");
    return {
      id: cols[0]?.trim(),
      name: cols[1]?.trim(),
      price: cols[2]?.trim(),
      images: cols.slice(3).map(i => cleanImage(i)).filter(Boolean)
    };
  });
}

// ============================
// SHOP PAGE
// ============================
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
      <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      <div class="product-info">
        <h3>${p.name}</h3>
        <span>₹${p.price}</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ============================
// PRODUCT PAGE
// ============================
async function loadProductPage() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;

  const products = await getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  productName.textContent = product.name;
  productPrice.textContent = `₹${product.price}`;
  formProduct.value = product.name;
  formPrice.value = product.price;

  // Images
  const carousel = document.getElementById("productImages");
  carousel.innerHTML = "";

  product.images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = product.name;
    if (i === 0) img.classList.add("active");
    carousel.appendChild(img);
  });

  let index = 0;
  prevBtn.onclick = () => changeImg(-1);
  nextBtn.onclick = () => changeImg(1);

  function changeImg(dir) {
    const imgs = carousel.querySelectorAll("img");
    imgs[index].classList.remove("active");
    index = (index + dir + imgs.length) % imgs.length;
    imgs[index].classList.add("active");
  }

  // Variants
  ["Black", "Silver", "Brown"].forEach(v => {
    const s = document.createElement("span");
    s.className = "size";
    s.textContent = v;
    s.onclick = () => {
      document.querySelectorAll(".size").forEach(x => x.classList.remove("active"));
      s.classList.add("active");
      formSize.value = v;
    };
    sizeContainer.appendChild(s);
  });
  sizeContainer.firstChild.click();
}

// ============================
// ORDER FORM
// ============================
function setupOrderForm() {
  if (!orderForm) return;

  orderForm.addEventListener("submit", e => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("entry.1639427243", orderForm.name.value);
    fd.append("entry.1232107661", orderForm.phone.value);
    fd.append("entry.1179661157", orderForm.product.value);
    fd.append("entry.1102739931", orderForm.size.value);
    fd.append("entry.129241642", orderForm.price.value);
    fd.append("entry.1604223165", orderForm.address.value);

    fetch(
      "https://docs.google.com/forms/d/e/1FAIpQLSf_flo6YyS3GHwTwc88i--LELY_IyIA9IiYUF4YP8wF0y2wgw/formResponse",
      { method: "POST", mode: "no-cors", body: fd }
    ).then(() => {
      window.location.href = "success.html";
    });
  });
}

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", () => {
  loadShopProducts();
  loadProductPage();
  setupOrderForm();
});
