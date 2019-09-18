window.onload = function(e) {
  const paymentMethods = [{
    supportedMethods: 'basic-card',
    data: {
      supportedNetworks: ['visa', 'mastercard', 'amex']
    }
  }];

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
                });      
              }).catch(function(err) {    
                console.error(err.message);
              });          
            } else {
              console.log('Cannot make payment');
            }
          }).catch(function(err) {
            console.log(request, err);
          });
        }
      }
    }
  });
};
