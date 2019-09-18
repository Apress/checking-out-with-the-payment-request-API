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

// -----------------------------------------------------------------

if (request.canMakePayment) {
  request.canMakePayment().then(function(result) {
    if (result) {
      //console.log(request);
      request.show().then(function(result) {
        result.complete('success').then(function() {
          console.log(JSON.stringify(result));
          displaySuccess();
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

// -----------------------------------------------------------------

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
}, 20000 * 60);  /* 20 minutes */
