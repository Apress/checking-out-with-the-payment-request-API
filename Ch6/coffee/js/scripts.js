var ShoppingCart = (function($) {
  "use strict";

  var total=0;
  
  var productsEl = document.querySelector(".products"),
      cartEl =     document.querySelector(".shopping-cart-list"),
      productQuantityEl = document.querySelector(".product-quantity"),
      emptyCartEl = document.querySelector(".empty-cart-btn"),
      cartCheckoutEl = document.querySelector(".cart-checkout"),
      totalPriceEl = document.querySelector(".total-price"),
      paymentEl = document.querySelector(".chkoutbutton"),
      noProductsEl = document.querySelector("div.shopping-cart > p");
  
  var products = [
    {
      id: 0,
      name: "Ristretto",
      description: "100% expresso for a full-on flavor",
      strength: "short",
      imageUrl: "images/black.png",
      price: 0.23
    },
    {
      id: 1,
      name: "Fortissimo",
      description: "A combination of coffees for a round taste with character.",
      strength: "short",      
      imageUrl: "images/red.png",
      price: 0.34
    },
    {
      id: 2,
      name: "Decaffeinato",
      description: "LoveCoffee's house coffee, sans caffeine",
      strength: "long",      
      imageUrl: "images/purple.png",
      price: 0.33
    },
    {
      id: 3,
      name: "Corrugilo",
      description: "Coffee roasted with whiskey, for that full-on Spanish taste",
      strength: "short",  
      imageUrl: "images/yellow.png",
      price: 0.33
    },
    {
      id: 4,
      name: "Africano",
      description: "Caramel-roasted coffee, for a delicate and sweet flavor",
      strength: "latte",      
      imageUrl: "images/brown.png",
      price: 0.37
    },
    {
      id: 5,
      name: "Livanto",
      description: "Rounded and balanced, for a strong flavor",
      strength: "latte",      
      imageUrl: "images/brown.png",
      price: 0.37
    }
  ],
      productsInCart = [];
  
  var generateProductList = function() {
    products.forEach(function(item) {
      var productEl = document.createElement("div");
      productEl.className = "product";
      productEl.innerHTML = `<div class="product-image"><img src="${item.imageUrl}" alt="${item.name}"></div>
                             <div class="product-name">${item.name}</div>
                             <div class="product-description">${item.description}</div>
                             <div class="product-add-to-cart">
                             <div class="product-price">$${item.price}</div>
                             <div class="product-strength"><img src="images/${item.strength}.svg" alt="strength"></div>
                             <a class="button add-to-cart" data-id=${item.id}>Add to Cart</a>
                             </div>
                          </div>`;    
      productsEl.appendChild(productEl);
    });
  }
  
  var generateCartList = function() {
    cartEl.innerHTML = "";
    total = 0;
    productsInCart.forEach(function(item) {
      var li = document.createElement("li");
      var subtotal = (item.quantity * item.product.price).toFixed(2);
      li.innerHTML = `<span class="itemlist"><span class="qtys">${item.quantity}</span> x ${item.product.name}</span>$<span class="subtotal">` + subtotal + `</span>`;
	  
      total = Number(total + item.quantity);
      document.querySelector(".total-capsules").innerHTML = total;

			if (total % 10 == 0) {
				var disc = parseFloat(0.1 * (document.querySelector(".total-price").innerHTML), 2);
				var discMessage = document.querySelector("div > a > p:nth-child(3)");
				var newTotal = Number(subtotal - disc).toFixed(2);

				setTimeout(function() {
					document.querySelector(".total-price").innerText = newTotal;
					discMessage.innerHTML = 'Includes discount of:<span class="discount">' + disc.toFixed(2) + '</span>';	
				}, 50);
			} else {
				var remaining = Number(10-(total % 10));
				document.querySelector("div > a > p:nth-child(3)").innerHTML = "Add " + remaining + " more for a 10% discount";
			}
			    
	
      cartEl.appendChild(li);
    });
    
    productQuantityEl.innerHTML = productsInCart.length;  
    generateCartButtons()
  }
  
  // Function that generates Empty Cart and Checkout buttons based on condition that checks if productsInCart array is empty
  var generateCartButtons = function() {
    if(productsInCart.length > 0) {
      emptyCartEl.style.display = "block";
      paymentEl.classList.remove("disabled");
      totalPriceEl.innerHTML = calculateTotalPrice();
      noProductsEl.style.display = "none";
      cartCheckoutEl.style.display = "block"; 
      paymentEl.removeAttribute("disabled");  
      paymentEl.classList.add("enabled");
    } else {
      emptyCartEl.style.display = "none";
      paymentEl.classList.add("disabled");
      noProductsEl.style.display = "block";
      cartCheckoutEl.style.display = "none";
      paymentEl.setAttribute("disabled", true);
      paymentEl.classList.remove("enabled");
    }
  }
  
  // Setting up listeners for click event on all products and Empty Cart button as well
  var setupListeners = function() {
    productsEl.addEventListener("click", function(event) {
      var el = event.target;
      if(el.classList.contains("add-to-cart")) {
       var elId = el.dataset.id;
       addToCart(elId);
      }
    });
    
    emptyCartEl.addEventListener("click", function(event) {
      if(confirm("Are you sure?")) {
        productsInCart = [];
      }
      generateCartList();
    });
  }
  
  // Adds new items or updates existing one in productsInCart array
  var addToCart = function(id) {
    var obj = products[id];
    if(productsInCart.length === 0 || productFound(obj.id) === undefined) {
      productsInCart.push({product: obj, quantity: 1});
    } else {
      productsInCart.forEach(function(item) {
        if(item.product.id === obj.id) {
          item.quantity++;
        }
      });
    }
    generateCartList();
  }
  
  var productFound = function(productId) {
    return productsInCart.find(function(item) {
      return item.product.id === productId;
    });
  }

  var calculateTotalPrice = function() {
    return productsInCart.reduce(function(total, item) {
      return total + (item.product.price *  item.quantity);
    }, 0).toFixed(2);
  }
  
  var init = function() {
    generateProductList();
    setupListeners();
  }
  
  return {
    init: init
  };
  
})();

ShoppingCart.init();