'use strict';

//const configExample = require("../../_server/config.example");

window.addEventListener('load', function () {
  let form = document.querySelector('form');
  let instanceNameInput = document.getElementById('subdomain'); 

  let postToServer = (url, params, cb) => {
    fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(response => {
        if (response.ok) { return response.json(); }
        cb(response);
    }).then(json => {
        cb(void 0, json);
    });
};

 instanceNameInput.addEventListener('change', function () {
    let url = "http://localhost:3004/cloud/available";
    let params = {
      instanceName: instanceNameInput.value
    };
    postToServer(url, params, (err, json) => {
      console.log(json)
        if (err || json.error) {
          // Handle error
          console.log("Errorrr");
          return;
        }
        console.log(json.status)
        if (json.status) {
          // Handle available name
          console.log("The name is available");
          return;
        }
        // Handle unavailable name
        console.log("The name is not available");
    });
  
});

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (validateForm()) {
      console.log("Form validation successfull.");
    } else {
      console.log("Form validation failed. Please check your inputs.");
    }
});

function validateForm() {
  let firstName = document.getElementById('firstName').value;
  let lastName = document.getElementById('lastName').value;
  let phoneNumber = document.getElementById('phoneNumber').value;
  let problem = document.getElementById('problem').value;
  
  const maxLengths = {
    firstName: 50,
    lastName: 50,
    email: 100,
    problem: 500
  };

  if (firstName.trim() === '') {
    console.log("Please input your first name.");
    return false;
  } else if (firstName.length > maxLengths.firstName){
    console.log("First name is too long.");
    return false;
  }

  if (lastName.trim() === '') {
    console.log("Please input your last name.");
    return false;
  } else if (lastName.length > maxLengths.lastName){
    console.log("Last name is too long.");
    return false;
  }

  const phonePattern = /^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3,}$/;//for international phone formats
  if (phoneNumber.trim() === '') {
    console.log("Please input your phone number.");
    return false;
  } else if (!phonePattern.test(phoneNumber)) {
    console.log("Invalid phone number format.");
    return false;
  }

   if(problem.length > maxLengths.problem){
    console.log("Please limit your problem description to 500 characters.");
    return false;
   }

  return true;
}

});
