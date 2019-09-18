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

  function updateDetails(details, shippingAddress, callback, stotal) {
    let shippingOption = {
      id: '',
      label: '',
      amount: {currency: 'USD', value: '0.00'},
      selected: true,
      pending: false,
    };
    if (shippingAddress.country === 'US') {
      if (shippingAddress.region === 'CA') {
        shippingOption.id = 'californiaFreeShipping';
        shippingOption.label = 'Free shipping in California';
        details.total.amount.value = (Number(stotal).toFixed(2);
      } else {
        shippingOption.id = 'unitedStatesStandardShipping';
        shippingOption.label = 'Standard shipping in US';
        shippingOption.amount.value = '3.99';
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
  		    label: 'Shipping',
          amount: { currency: 'USD', value: shipping.toFixed(2) }
        },{        
          label: 'Sales Tax',
          amount: { currency: 'USD', value: tax.toFixed(2) }
        }]
      }; 
 
      const paymentOptions = { requestPayerEmail: true, requestShipping: true };
      let request = new PaymentRequest(paymentMethods, paymentDetails, paymentOptions);

      request.addEventListener('shippingaddresschange', function(evt) {
        evt.updateWith(new Promise(function(resolve) {
          updateDetails(paymentDetails, request.shippingAddress, resolve, total);
        }));
      });

      if (request.canMakePayment) {
        request.canMakePayment().then(function(result) {
          if (result) {
            request.show().then(function(result) {
              result.complete('success').then(function() {
                console.log(JSON.stringify(result));
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