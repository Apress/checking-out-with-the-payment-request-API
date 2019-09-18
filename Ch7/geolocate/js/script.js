const methodData = [{
  supportedMethods: 'basic-card',
  data: {
    supportedNetworks: ['visa', 'mastercard', 'amex']
  }
}, {
  supportedMethods: 'https://bobpay.xyz/pay'
}, {
  supportedMethods: 'interledger'
}];

var CookiesShop_lat = 40.725605;
var CookiesShop_long = -74.0049139;
var destination, latitude, longitude, distance;

function GetLocation(dest) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': dest }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();
      console.log("Latitude: " + latitude + "\nLongitude: " + longitude);
      distance = calcDistance(CookiesShop_lat, CookiesShop_long, latitude, longitude);
    } else {
      console.log("Request failed.")
    }
  });
};

function calcDistance(userLat, userLong, placeLat, placeLong) {
  //Earth Ray
  var R = 6371;
  //Get latlong value diferences between two points
  var dLat = (placeLat - userLat) * Math.PI / 180;
  var dLon = (placeLong - userLong) * Math.PI / 180;
  //Calculate distance with Haversine Formula
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(userLat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c;
  return distance;
};

function displayMessage(symbol, status, mesg) {
  document.getElementById("message").classList.remove();
  document.getElementById("message").classList.add(status);
  document.getElementById("message").innerHTML = "<span>" + symbol + "</span>" + mesg;  
}

  function updateDetails(details, shippingAddress, callback, stotal) {
  	destination = shippingAddress.addressLine + " " + shippingAddress.city + " " + shippingAddress.postcode;
  	GetLocation(destination);

  	console.log(CookiesShop_lat + ", " + CookiesShop_long);
  	console.log(latitude + ", " + longitude);
  	console.log("Distance: " + distance);

    let shippingOption = {
      id: '',
      label: '',
      amount: {currency: 'USD', value: '0.00'},
      selected: true,
      pending: false,
    };
    if (shippingAddress.country === 'US') {
      if (distance < 0.5 && shippingAddress.city == "New York") {
        shippingOption.id = 'Localshipping';
        shippingOption.label = 'Local shipping - nearby';
        details.total.amount.value = '1.00';
      } else if (shippingAddress.region === 'CA') {
        shippingOption.id = 'californiaFreeShipping';
        shippingOption.label = 'Free shipping in California';
        details.total.amount.value = (Number(stotal)).toFixed(2);
      } else {
        shippingOption.id = 'unitedStatesStandardShipping';
        shippingOption.label = 'Standard shipping in US';
        shippingOption.amount.value = '3.00';
        details.total.amount.value = (Number(stotal) + Number(3.99)).toFixed(2);
      }
      details.shippingOptions = [shippingOption];
      delete details.error;
    } else {
      // Don't ship outside of US for the purposes of this example.
      shippingOption.label = 'Shipping';
      shippingOption.pending = true;
      details.total.amount.value = (Number(stotal)).toFixed(2);
      details.error = 'Sorry - cannot ship outside of USA.';
      delete details.shippingOptions;
    }
    details.displayItems.splice(1, 1, shippingOption);
    callback(details);
  } 

function initCheckout (e) {
  if(window.PaymentRequest) {
    var subtotal = Number(document.querySelector(".cartamt").innerText);
    var delivery = 3.00;
    var beforetax = (subtotal + delivery)
    var tax = Number( beforetax * 0.0575);
    var total = Number(subtotal + tax + delivery).toFixed(2);

    const paymentDetails = {
      total: {
        label: 'Total due',
        amount: { currency: 'USD', value: total }
      },
      displayItems: [{
        label: 'Sub-total',
        amount: { currency: 'USD', value: subtotal }
      }, {
        label: 'Standard shipping in US',
        amount: { currency: 'USD', value: delivery.toFixed(2) }
      }, {        
        label: 'Sales Tax @ 5.75%',
        amount: { currency: 'USD', value: tax.toFixed(2) }
      }],
        modifiers: [{
          supportedMethods: 'https://bobpay.xyz/pay',
          additionalDisplayItems: [{
            label: 'Processing fee',
            amount: { currency: 'USD', value: '3.00' }
          }],
          total: {
            label: 'Total to pay by card',
            amount: {currency: 'USD', value: Number(total + 3).toFixed(2)}}
        }], shippingOptions: [{
          id: 'standard',
          label: 'Standard shipping in US',
          amount: {currency: 'USD', value: '3.00'},
          selected: true,
        },
        {
          id: 'express',
          label: 'Express delivery (next day)',
          amount: {currency: 'USD', value: '3.99'},
        },
      ],
    };  

    const options = { requestPayerEmail: true, requestShipping: true };
    const request = new PaymentRequest(methodData, paymentDetails, options);
    
    request.addEventListener('shippingaddresschange', function(evt) {
      evt.updateWith(new Promise(function(resolve) {
        updateDetails(paymentDetails, request.shippingAddress, resolve, total);
      }));
    });

    request.addEventListener('shippingoptionchange', function(evt) {
      evt.updateWith(new Promise(function(resolve, reject) {
        updateDetails(paymentDetails, request.shippingOption, resolve, reject, total);
      }));
    });

    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        if (result) {
          request.show().then(function(result) {
            result.complete('success').then(function() {
              displayMessage("\u2714", "success", "Payment received - thanks for your order!");
              
              const additionalDetailsContainer = document.getElementById('instructions');
              additionalDetailsContainer.style.display = 'block';
              additionalDetailsContainer.focus();  
            });      
          }).catch(function(err) {      
            if (err.code == DOMException.ABORT_ERR) {
              console.error(err.message);
              displayMessage("&#128712;", "info", "Request has been cancelled.");        
            } else {
              console.error(err.message);
              displayMessage("\u2716", "failure", "There was a problem with payment");
            }
          });          
        } else {
          console.log('Cannot make payment');
          displayMessage("&#128712;", "info", "Sorry - no valid payment methods available");
        }
      }).catch(function(err) {
        console.log(request, err);
      });
    }
  }     
}


const products = [
  {id: 1,title: 'Cherry Bakewell', price: 0.75, qty: 1, image: './images/cbakewell.png'},  
  {id: 2,title: 'Coconut',price: 0.75, qty: 1,image: './images/coconut.png'},  
  {id: 3,title: 'Dark Choc',price: 0.75,qty: 1,image: './images/dark-choc.png'},  
  {id: 4,title: 'Double Choc',price: 0.75, qty: 1, image: './images/double-choc.png'},  
  {id: 5,title: 'Jaffa', price: 0.75, qty: 1, image: './images/jaffa.png'},  
  {id: 6,title: 'Oatmeal & Raisin',price: 0.75, qty: 1,image: './images/oatmeal-rasin.png'},  
  {id: 7,title: 'Raspberry & White Choc',price: 0.75,qty: 1,image: './images/rasberry-white-choc.png'},  
  {id: 8,title: 'Toffee',price: 0.75, qty: 1, image: './images/toffee.png'}
];

function formatNumber(n, c, d, t){
  var c = isNaN(c = Math.abs(c)) ? 2 : c, 
      d = d === undefined ? '.' : d, 
      t = t === undefined ? ',' : t, 
      s = n < 0 ? '-' : '', 
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
      j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
}

Vue.filter('formatCurrency', function (value) {
  return formatNumber(value, 2, '.', ',');
});
    
Vue.component('shopping-cart', {
  props: ['items'],

  computed: {
    Total: function() {
      var total = 0;
      this.items.forEach(item => {
        total += (item.price * item.qty);
      });
      return total;
    }
  },

  methods: {
    removeItem(index) {
      this.items.splice(index, 1)
    }
  }
})

const vm = new Vue({
  el: '#app',
  
  data: {
    cartItems: [],
    items : products
  },
  
  methods: {
    checkout: function(event) {
      console.log("Checkout");
      initCheckout();
    },

    addToCart(itemToAdd) {
      var found = false;

      // Check if the item was already added to cart
      // If so them add it to the qty field
      this.cartItems.forEach(item => {
        if (item.id === itemToAdd.id) {
          found = true;
          item.qty += itemToAdd.qty;
        }
      });

      if (found === false) {
        this.cartItems.push(Vue.util.extend({}, itemToAdd));
      }
      
      itemToAdd.qty = 1;
    }
  }
});
