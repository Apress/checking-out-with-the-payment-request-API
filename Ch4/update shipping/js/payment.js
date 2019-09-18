window.onload = function(e) {
  const paymentMethods = [{
    supportedMethods: 'basic-card',
    data: {
      supportedNetworks: ['visa', 'mastercard', 'amex']
    }
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
      let shipping = 0;
      let tax = (subtotal + shipping) * 0.175;
      let total = Number(subtotal) + Number(tax) + Number(shipping);

      const paymentDetails = {
        total: {
          label: 'Total due',
          amount: { currency: 'USD', value:  total.toFixed(2) }
        },
        displayItems: [{
          label: 'Coffee capsules',
          amount: { currency: 'USD', value: subtotal.toFixed(2) }
        }, {        
          label: 'FREE delivery (3-5 days)',
          amount: { currency: 'USD', value: shipping.toFixed(2) }
        },{        
          label: 'Sales Tax',
          amount: { currency: 'USD', value: tax.toFixed(2) }
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
 
      const paymentOptions = { requestPayerEmail: true, requestShipping: true };
      let request = new PaymentRequest(paymentMethods, paymentDetails, paymentOptions);

      request.addEventListener('shippingaddresschange', function(e) {
        e.updateWith(new Promise(function(resolve) {
          // No changes in price based on shipping address change.
          resolve(paymentDetails);
        }));
      });

      if (request.canMakePayment) {
        request.canMakePayment().then(function(result) {
          if (result) {
            request.show().then(function(result) {
              result.complete('success').then(function() {
                //console.log(JSON.stringify(result));
                displaySuccess();
              });      
            }).catch(function(err) {      
              if (err.message == "Request cancelled") {
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
}