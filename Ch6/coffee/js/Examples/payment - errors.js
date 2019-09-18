window.onload = function(e) {
  const paymentMethods = [{
    supportedMethods: 'basic-card',
    data: {
      supportedNetworks: ['visa', 'mastercard', 'amex']
    }
  }];

  function displayMessage(symbol, state, mesg) {
    document.getElementById("message").classList.add(state);
    document.getElementById("message").innerHTML = "<span>" + symbol + "</span>" + mesg;  
  }
  
  // configure payment request API
  document.querySelector(".chkoutbutton").addEventListener("click", function(e) {
    if (document.querySelector(".chkoutbutton").classList.contains("enabled")) {
      document.getElementById("message").className = '';
      
      if (window.PaymentRequest) {
        let subtotal = Number(document.querySelector(".total-price").innerText);
        let shipping = 2.99;
        let tax = (subtotal + shipping) * 0.175;
        let total = Number(subtotal) + Number(tax) + Number(shipping);

        const paymentDetails = {
          total: {
            label: 'Total to pay by card',
            amount: { currency: 'USD', value:  total.toFixed(2) }
          },
          displayItems: [{
            label: 'Coffee capsules',
            amount: { currency: 'USD', value: subtotal.toFixed(2) }
          },{        
            label: 'Standard shipping in US',
            amount: { currency: 'USD', value: shipping.toFixed(2) }
          }, {        
            label: 'Sales Tax',
            amount: { currency: 'USD', value: tax.toFixed(2) }
          }],  
        };   

        const paymentOptions = { requestPayerEmail: true };
        let request = new PaymentRequest(paymentMethods, paymentDetails, paymentOptions);

        if (request.canMakePayment) {
          request.canMakePayment().then(function(result) {
            if (result) {
              request.show().then(function(result) {
                result.complete('success').then(function() {
                  console.log(JSON.stringify(result));
                  displayMessage("\u2714", "success", "Payment received - thanks for your order!");
                });      
              }).catch(function(err) {    
                if (err.code == DOMException.ABORT_ERR) {
                  displayMessage("&#128712;", "info", "Request has been cancelled");
                } else {
                  console.error(err.message);
                  displayMessage("\u2716", "error", "There was a problem with payment");
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
  });
};
