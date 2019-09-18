const methodData = [{
  supportedMethods: 'basic-card',
  data: {
    supportedNetworks: ['visa', 'mastercard', 'amex']
  }
}];

let amount = document.getElementById("amount");
let subTotalText = document.getElementById("subTotalText");
let qty = parseFloat(document.getElementById("amount").value);

amount.addEventListener("click", function() {
  let subtotal = Number(document.getElementById("amount").value * 4.99).toFixed(2);
  subTotalText.innerText = subtotal;
});

document.querySelector('.pay-button').onclick = function (e) {
  if(window.PaymentRequest) {
    let qty = parseFloat(document.getElementById("amount").value);
    let subtotal = Number(qty * 4.99); 
    let tax = 1.99;
    let shipping = 2.99;

    const details = {
      total: {
        label: 'Total due',
        amount: { currency: 'USD', value: (subtotal + tax + shipping).toFixed(2) }
      },
      displayItems: [{
        label: 'Sub-total',
        amount: { currency: 'USD', value: subtotal.toFixed(2) }
      }, {
        label: 'Delivery',
        amount: { currency: 'USD', value: 3.99 }
      }, {        
        label: 'Sales Tax',
        amount: { currency: 'USD', value: tax.toFixed(2) }
      }]
    };  

  const options = { requestPayerEmail: true };
  const request = new PaymentRequest(methodData, details, options);

  //Show the Native UI
  request
    .show()
    .then(function(result) {
      result.complete('success')
        .then(console.log(JSON.stringify(result)));
    }).catch(function(err) {
      console.error(err.message);
    });
  } else {
    // Fallback to traditional checkout
  }
};