window.onload = function(e) {
  const payCardMethods = [{
    supportedMethods: 'basic-card',
    data: {
      supportedNetworks: ['visa', 'mastercard', 'amex']
    }
  }];

  const payBobMethods = [{
    supportedMethods: 'https://localhost:8000/pay'
  }];

  function displaySuccess() {
    document.getElementById("message").classList.add("success");
    document.getElementById("message").innerHTML = "<span>\u2714</span> Payment received - thanks for your order!";   }
      
  function displayError() {
    document.getElementById("message").classList.add("failure");
    document.getElementById("message").innerHTML = "<span>\u2716</span> There was a problem with payment"; }

  function displayMessage(mesg) {
    document.getElementById("message").classList.add("info");
    document.getElementById("message").innerHTML = "<span>&#128712;</span>" + mesg;  
  }

  // configure payment request API
  document.querySelector(".pay-button").addEventListener("click", function(e) {
    document.getElementById("message").className = '';
    
    if (window.PaymentRequest) {
      let subtotal = Number(document.querySelector(".total-price").innerText);
      let shipping = 2.99;
      let tax = (subtotal + shipping) * 0.175;
      let total = Number(subtotal) + Number(tax) + Number(shipping);

      const payCardDetails = {
        total: {
          label: 'Total due',
          amount: { currency: 'USD', value:  total.toFixed(2) }
        },
        displayItems: [{
          label: 'Coffee capsules',
          amount: { currency: 'USD', value: subtotal.toFixed(2) }
        },{
          label: 'Shipping',
          amount: { currency: 'USD', value: 2.99 }
        }, {        
          label: 'Sales Tax',
          amount: { currency: 'USD', value: tax.toFixed(2) }
        }],
      };   
    
      const payCardOptions = { requestPayerEmail: true };
      let request = new PaymentRequest(payCardMethods, payCardDetails, payCardOptions);
         
      if (request.canMakePayment) {
        request.canMakePayment().then(function(result) {
          if (result) {
            request.show().then(function(result) {
              result.complete('success').then(function() {
                console.log(JSON.stringify(result));
                displaySuccess();
              });      
            }).catch(function(err) {     
              if (err.code == DOMException.ABORT_ERR) {
                displayMessage("Request has been cancelled");
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
    }
  });

  document.querySelector(".pay-bob").addEventListener("click", function(e) {
    document.getElementById("message").className = '';
    
    if (window.PaymentRequest) {
      let subtotal = Number(document.querySelector(".total-price").innerText);
      let shipping = 2.99;
      let tax = (subtotal + shipping) * 0.175;
      let total = Number(subtotal) + Number(tax) + Number(shipping);

      const payBobDetails = {
        total: {
          label: 'Total due',
          amount: { currency: 'USD', value:  total.toFixed(2) }
        },
        displayItems: [{
          label: 'Coffee capsules',
          amount: { currency: 'USD', value: subtotal.toFixed(2) }
        },{
          label: 'Shipping',
          amount: { currency: 'USD', value: 2.99 }
        }, {        
          label: 'Sales Tax',
          amount: { currency: 'USD', value: tax.toFixed(2) }
        }],
      };   
    
      const payBobOptions = { requestPayerEmail: true };
      let request = new PaymentRequest(payBobMethods, payBobDetails, payBobOptions);
         
      if (request.canMakePayment) {
        request.canMakePayment().then(function(result) {
          //if (result) {
            request.show().then(function(result) {
              result.complete('success').then(function() {
                console.log(JSON.stringify(result));
                displaySuccess();
              });      
            }).catch(function(err) { 
              if (err.code == DOMException.ABORT_ERR) {
                displayMessage("Request has been cancelled");
              } else {
                displayError();
                console.log('Cannot make payment');
              }

              if (err.code == DOMException.NOT_SUPPORTED_ERR) {
                displayMessage("Sorry - BobPay isn't installed: redirecting...");
                setTimeout(function() {
                  window.location.href = 'https://bobpay.xyz/#download';
                }, 5000)
              }
            });          
          //} else {
          //}
        });
      }
    }
  });

}