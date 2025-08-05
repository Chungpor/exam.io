const { products } = require("./products");

// These variables must be declared globally
let activeCategory = "All";
let searchQuery = "";
let cart = [];
let currentSlide = 0;
let slideInterval;
const totalSlides = 2;

$(document).ready(function () {
  showProducts();
  setupEvents();
  setupSmoothScroll();
  startSlider();
  setupSliderControls();
});

function showProducts() {
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  $("#products-grid").empty();

  if (filteredProducts.length === 0) {
    $("#no-products").removeClass("hidden");
  } else {
    $("#no-products").addClass("hidden");
    filteredProducts.forEach((product) => {
      $("#products-grid").append(`
        <div data-aos="fade-up" data-aos-duration="1500">
          <div class="overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
            <img src="${product.image}" alt="${
        product.name
      }" class="object-cover w-full h-72 transition-transform duration-500 hover:scale-105">
            <div class="p-4">
              <h3 class="mb-2 text-xl font-bold">${product.name}</h3>
              <p class="mb-2 text-gray-600">${product.description}</p>
              <div class="flex items-center justify-between">
                <span class="text-2xl font-bold text-orange-600">$${product.price.toFixed(
                  2
                )}</span>
                <button class="px-4 py-2 text-white transition-colors bg-orange-600 rounded add-to-cart hover:bg-orange-700" data-id="${
                  product.id
                }">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      `);
      AOS.refresh();
    });
  }
}

function updateCartCounts() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems > 0) {
    $("#cart-count, #cart-count-mobile").text(totalItems).removeClass("hidden");
  } else {
    $("#cart-count, #cart-count-mobile").addClass("hidden");
  }
}

function updateCart() {
  let $cartItemsContainer = $("#cart-items");
  $cartItemsContainer.empty();

  let total = 0;

  if (cart.length === 0) {
    $("#empty-cart-message").removeClass("hidden");
    $("#cart-footer").addClass("hidden");
  } else {
    $("#empty-cart-message").addClass("hidden");
    $("#cart-footer").removeClass("hidden");

    cart.forEach(function (item) {
      total += item.price * item.quantity;

      let cartItemHTML = `
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <img src="${item.image}" alt="${
        item.name
      }" class="w-16 h-16 mr-4 rounded object-cover ">
            <div>
              <h4 class="text-lg font-semibold">${item.name}</h4>
              <p class="text-sm text-gray-600">$${item.price.toFixed(2)} x ${
        item.quantity
      }</p>
              <div class="flex items-center mt-1 space-x-2">
                <button class="decrease-qty px-2 py-1 text-sm bg-gray-200 rounded" data-id="${
                  item.id
                }">-</button>
                <span>${item.quantity}</span>
                <button class="increase-qty px-2 py-1 text-sm bg-gray-200 rounded" data-id="${
                  item.id
                }">+</button>
              </div>
            </div>
          </div>
          <button class="remove-item text-red-500" data-id="${
            item.id
          }">&times;</button>
        </div>
      `;
      $cartItemsContainer.append(cartItemHTML);
    });
  }

  $("#cart-total").text(`$${total.toFixed(2)}`);
  updateCartCounts();
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
  openCart();
}

function openCart() {
  $("#cart-panel").addClass("open");
  $("#cart-overlay").removeClass("hidden");
}

function closeCart() {
  $("#cart-panel").removeClass("open");
  $("#cart-overlay").addClass("hidden");
}

function startSlider() {
  slideInterval = setInterval(nextSlide, 4000);
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  showSlide(currentSlide);
}

function showSlide(slideIndex) {
  $(".slide").removeClass("opacity-100").addClass("opacity-0");
  $(".slide").eq(slideIndex).removeClass("opacity-0").addClass("opacity-100");
  $(".slide-indicator")
    .removeClass("bg-white")
    .addClass("bg-white bg-opacity-50");
  $(".slide-indicator")
    .eq(slideIndex)
    .removeClass("bg-opacity-50")
    .addClass("bg-white");
  currentSlide = slideIndex;
}

function setupEvents() {
  $("#cart-btn").click(openCart);
  $("#close-cart, #cart-overlay, #continue-shopping").click(closeCart);

  $(".category-btn").click(function () {
    activeCategory = $(this).data("category");
    $(".category-btn")
      .removeClass("bg-orange-600 text-white")
      .addClass("bg-gray-200 text-gray-700");
    $(this)
      .removeClass("bg-gray-200 text-gray-700")
      .addClass("bg-orange-600 text-white");
    showProducts();
  });

  $("#menu-search").on("input", function () {
    searchQuery = $(this).val();
    showProducts();
  });

  $(document).on("click", ".add-to-cart", function () {
    addToCart(parseInt($(this).data("id")));
  });

  $(document).on("click", ".increase-qty", function () {
    const productId = parseInt($(this).data("id"));
    const item = cart.find((item) => item.id === productId);
    if (item) {
      item.quantity += 1;
      updateCart();
    }
  });

  $(document).on("click", ".decrease-qty", function () {
    const productId = parseInt($(this).data("id"));
    const item = cart.find((item) => item.id === productId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      updateCart();
    }
  });

  $(document).on("click", ".remove-item", function () {
    const productId = parseInt($(this).data("id"));
    cart = cart.filter((item) => item.id !== productId);
    updateCart();
  });

  $("#clear-cart").click(function () {
    cart = [];
    updateCart();
  });

  $("#checkout-btn").click(function () {
    Swal.fire({
      title: "Thank you for your order!",
      text: "Total: " + $("#cart-total").text(),
      icon: "success",
      confirmButtonColor: "#eb590c",
    });
    cart = [];
    updateCart();
    closeCart();
  });

  $("#contact-form").submit(function (e) {
    e.preventDefault();
    $("#form-success").removeClass("hidden");
    this.reset();
    setTimeout(() => $("#form-success").addClass("hidden"), 3000);
  });

  // Mobile events
  $("#mobile-menu-btn").click(() => {
    $("#mobile-menu").stop(true, true).slideToggle(300);
  });
  $(".mobile-nav-link").click(() => $("#mobile-menu").addClass("hidden"));
  $("#cart-btn-mobile").click(openCart);
}

function setupSliderControls() {
  $("#prev-slide").click(() => {
    clearInterval(slideInterval);
    prevSlide();
    startSlider();
  });

  $("#next-slide").click(() => {
    clearInterval(slideInterval);
    nextSlide();
    startSlider();
  });

  $(".slide-indicator").click(function () {
    clearInterval(slideInterval);
    const slideIndex = parseInt($(this).data("slide"));
    showSlide(slideIndex);
    startSlider();
  });
}

function setupSmoothScroll() {
  $('a[href^="#"]').click(function (e) {
    e.preventDefault();
    const target = $(this.getAttribute("href"));
    if (target.length) {
      $("html, body").animate({ scrollTop: target.offset().top - 80 }, 800);
    }
  });
}
