(function () {
  // Switch out the test key here with your own
  let stripe = Stripe('<INSERT API TOKEN HERE>');
  let paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Total to pay',
        amount: 2495,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,            
      shippingOptions: [
      {
        id: 'free-shipping',
        label: 'Free shipping',
        detail: 'Arrives in 5 to 7 days',
        amount: 0,
      },
    ],
  });
  
  // Check the availability of the Payment Request API first.
  paymentRequest.canMakePayment().then(function(result) {
    let button = document.getElementById('payment-request-button');
    if (result) {
      button.style.display = 'inline-block';
      button.addEventListener('click', paymentRequest.show);      
    } else {
      button.style.display = 'none';
    }
  });
  
  paymentRequest.on('token', function(ev) {
    document.getElementById('payment-token').innerText = ev.token.id;
    document.getElementById('payment-token-message').style.display = 'block';

    ev.complete('success');
  });
})();