
function buyProduct(productName) {
  localStorage.setItem("selectedProduct", productName);
  window.location.href = "../checkout.html";
}

document.addEventListener("DOMContentLoaded", function () {
  const product = localStorage.getItem("selectedProduct");

  if (product && document.getElementById("productName")) {
    document.getElementById("productName").innerText = product;
    document.getElementById("productField").value = product;
  }
});

function submitOrder() {
  setTimeout(() => {
    window.location.href = "success.html";
  }, 500);
  return true;
}
