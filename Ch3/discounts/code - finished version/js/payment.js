const paymentMethods = [{
  supportedMethods: 'basic-card',
  data: {
    supportedNetworks: ['visa', 'mastercard', 'amex']
  }
}];

let amount = document.getElementById("amount");
let subTotalText = document.getElementById("subTotalText");
let qty = parseFloat(document.getElementById("amount").value);
let discountamt;

amount.addEventListener("click", function() {
  let subtotal = Number(document.getElementById("amount").value * 4.99).toFixed(2);
  subTotalText.innerText = subtotal;
  
  // apply discount if over 10, or prompt if over 8
  var disc = document.getElementById("amount").value;
  if ((disc > 7)  && (disc < 10)) {
    document.getElementById("getmore").style.display="block";
  } else if (disc == "10") {
    discountamt = Number(0.2 * subtotal);

    document.getElementById("getmore").innerText = "A 20% discount will be applied at checkout"
    document.getElementById("getmore").style.display="block";
  } else {
    document.getElementById("getmore").style.display="none";
  }
});

function displaySuccess() {
  document.getElementById("message").classList.add("success");
  document.getElementById("message").innerHTML = "<span>\u2714</span> Payment received - thanks for your order!";   
}
    
function displayError() {
  document.getElementById("message").classList.add("failure");
  document.getElementById("message").innerHTML = "<span>\u2716</span> There was a problem with payment"; 
}

function displayCancel() {
  document.getElementById("message").classList.add("info");
  document.getElementById("message").innerHTML = "<span>&#128712;</span>Request has been cancelled";   
}

function displayMessage(mesg) {
  document.getElementById("message").classList.add("info");
  document.getElementById("message").innerHTML = "<span>&#128712;</span>" + mesg;  
}

document.querySelector('.pay-button').onclick = function (e) {
  document.getElementById("message").className = '';
  if (window.PaymentRequest) {
    let qty = document.getElementById("amount").value;
    
    if (discountamt == undefined) { discountamt = 0.00; }     
    
    let subtotal = Number(qty * 4.99); 
    let totaldisc = Number(subtotal - discountamt);
    
    let shipping = 2.99;
    let tax = (subtotal + shipping) * 0.175;
    let total = Number(totaldisc) + Number(tax) + Number(shipping);

    const paymentDetails = {
      total: {
        label: 'Total due',
        amount: { currency: 'USD', value: total.toFixed(2) }
      },
      displayItems: [{
        label: 'Goods',
        amount: { currency: 'USD', value: subtotal.toFixed(2) }
      }, {
        label: 'Discount',
        amount: { currency: 'USD', value: discountamt }
      }, {
        label: 'Sub Total (after discount)',
        amount: { currency: 'USD', value: totaldisc.toFixed(2) }
      },{
        label: 'Shipping',
        amount: { currency: 'USD', value: 2.99 }
      }, {        
        label: 'Sales Tax',
        amount: { currency: 'USD', value: tax.toFixed(2) }
      }]
    };  
  
    const paymentOptions = { requestPayerEmail: true};
    let request = new PaymentRequest(paymentMethods, paymentDetails, paymentOptions);
       
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        if (result) {
          //console.log(request);
          request.show().then(function(result) {
            result.complete('success').then(function() {
              console.log(JSON.stringify(result));
              displaySuccess();
              const additionalDetailsContainer = document.getElementById('instructions');
              additionalDetailsContainer.style.display = 'block';
              additionalDetailsContainer.focus();
            });      
          }).catch(function(err) {      
            if (err.message == "Request cancelled") {
              displayCancel();
            } else {
              console.error(err.message);
              displayError();
            }
          });          
        } else {
          console.log('Cannot make payment');
          displayMessage("Sorry - no valid payment methods available");
        }
      }).catch(function(err) {
        console.log(request, err);
      });
    }
   
    /* time out requests after 20 mins of inactivity */
    var paymentTimeout = window.setTimeout(function() {
      window.clearTimeout(paymentTimeout);
      request.abort().then(function() {
        document.getElementById("message").classList.add("info");
        document.getElementById("message").innerHTML = "<span>&#128712;</span> Request has been timed out due to inactivity"; 
        console.log('Payment timed out after 20 mins.');
      }).catch(function() {
        console.log('Unable to abort, because the user is currently in the process of paying.');
      });
    }, 20000 * 60);
  }
};