/* =========================
   ASTRAVA – Main JS
   ========================= */

// Save product name when clicking Buy
function buyProduct(productName) {
  localStorage.setItem("astravaProduct", productName);
  window.location.href = "checkout.html";
}

// Autofill product name on checkout page
document.addEventListener("DOMContentLoaded", function () {
  const productInput = document.getElementById("product-name");
  if (productInput) {
    productInput.value = localStorage.getItem("astravaProduct") || "";
  }
});

// Simple confirmation redirect
function orderPlaced() {
  window.location.href = "success.html";
}
