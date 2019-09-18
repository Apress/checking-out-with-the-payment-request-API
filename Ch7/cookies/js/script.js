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

function displayMessage(symbol, status, mesg) {
  document.getElementById("message").classList.remove();
  document.getElementById("message").classList.add(status);
  document.getElementById("message").innerHTML = "<span>" + symbol + "</span>" + mesg;  
}

function updateDetails(details, shippingOption, resolve, stotal) {
  if (shippingOption === 'standard') {
    selectedOption = details.shippingOptions[0];
    otherOption = details.shippingOptions[1];
    details.total.amount.value = stotal;
  } else {
    selectedOption = details.shippingOptions[1];
    otherOption = details.shippingOptions[0];
    details.total.amount.value = (Number(stotal) + Number(3.99)).toFixed(2);
  }
  selectedOption.selected = true;
  otherOption.selected = false;
  details.displayItems.splice(1, 1, selectedOption);
  resolve(details);
}

function initCheckout (e) {
  if(window.PaymentRequest) {
    var subtotal = Number(document.querySelector(".cartamt").innerText);
    var delivery = 0.00;
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
        label: 'FREE Delivery (3-5 days)',
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
          label: 'FREE delivery (3-5 days)',
          amount: {currency: 'USD', value: '0.00'},
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
      evt.updateWith(new Promise(function(resolve) {
        updateDetails(paymentDetails, request.shippingOption, resolve, total);
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
      this.items.splice(index, 1);
    }
  }
});

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
