'use strict';


window.addEventListener('load', function () {
  let form = document.querySelector('form');
  let instanceNameInput = document.getElementById('subdomain');

  function displaySubmitButtonError(message) {
    const errorContainer = document.getElementById('submitButtonError');
    errorContainer.innerHTML = `<span><i class="fa fa-exclamation-circle"></i></span><div>${message}</div>`;
  }

  function displayFieldError(fieldId, message) {
    clearFieldError(fieldId); // Clear any previous errors of the same type
    let field = document.getElementById(fieldId);
    let errorContainer = document.createElement('div');
    let errorElement = document.createElement('span');
    let errorMessage = document.createElement('div');
    errorElement.innerHTML = '<i class="fa fa-exclamation-circle"></i>';
    errorMessage.textContent = message;
    errorContainer.appendChild(errorElement);
    errorContainer.appendChild(errorMessage);
    errorContainer.classList.add('error-container');
    field.parentNode.insertBefore(errorContainer, field.nextSibling);
    field.classList.add('error');
}



function clearFieldError(fieldId) {
  let errorContainers = document.querySelectorAll(`#${fieldId} + .error-container`);
  errorContainers.forEach(container => {
      container.parentNode.removeChild(container);
  });
  let field = document.getElementById(fieldId);
  field.classList.remove('error');
}


function clearAllFieldErrors() {
  let formFields = form.querySelectorAll('input, textarea');
  formFields.forEach(field => {
      clearFieldError(field.id);
  });
}


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
  let instanceName =  instanceNameInput.value;
  let params = {
      instanceName: instanceNameInput.value
  };
  clearFieldError("urlContainer");

  if(instanceName.length <= 4){
    displayFieldError("urlContainer", "Instance name should contain more than 4 characters");
    return;
  }
  else if(instanceName.length > 70){
    displayFieldError("urlContainer", "Instance name should not exceed 70 characters");
    return;
  }

  postToServer(url, params, (err, json) => {
  if (err || json.error) {
    displayFieldError("urlContainer", "Error checking instance name availability");
    return;
  }

  if (json.errorType == "subdomain_contains_special_chars") {
    displayFieldError("urlContainer", "Instance name should not contain special characters");
    return;
  }

  if (json.status) {
      console.log("The name is available");
      return;
  }
  displayFieldError("urlContainer","The name is not available");
});


});

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearAllFieldErrors();
    let instanceName = document.getElementById('submitBtn');
    let url = "http://localhost:3004/cloud/create";
    let params = {
        instanceName: document.getElementById('subdomain').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        company:  document.getElementById('organization').value,
        lang: "en",
        instanceType: "cryptpad",
        limits:  "Products.CryptadDemoPlan"
    };
    if (validateForm()) {
      postToServer(url, params, (err, json) => {
        if (err) {
          displayFieldError('submitButton',"Some errors prevented this form from being submitted.");
          return;
        }

        if (json.instanceCreationStatus) {
            localStorage.setItem('jsonData', JSON.stringify(json));
            window.location.href = "/demo-loading";
            return;
        }
        displaySubmitButtonError("Some errors prevented this form from being submitted.");

      });
    } else {
      displaySubmitButtonError("Some errors prevented this form from being submitted.");
    }
});

function validateForm() {
  let instanceNameInput = document.getElementById('subdomain');
  let firstName = document.getElementById('firstName').value;
  let lastName = document.getElementById('lastName').value;
  let phoneNumber = document.getElementById('phoneNumber').value;
  let problem = document.getElementById('problem').value;
  let email = document.getElementById('email').value;

  const maxLengths = {
    firstName: 50,
    lastName: 50,
    email: 100,
    problem: 500
  };

  if(instanceNameInput.value === ""){
    displayFieldError('urlContainer', "Please input a name for your instance!");
    return false;
  }
  if (typeof firstName !== 'string'|| !isNaN(parseFloat(firstName))){
    displayFieldError('firstName', "The first name should only be composed of characters");
    return false;
  }
  else if(firstName.trim() === '') {
    displayFieldError('firstName', "The first name should not be empty");
    return false;
  } else if (firstName.length > maxLengths.firstName){
    displayFieldError('firstName', "The first name is too long");
    return false;
  }

  if (typeof lastName !== 'string' || !isNaN(parseFloat(lastName))){
    displayFieldError('lastName', "The last name should only be composed of characters");
    return false;
  }
  else if (lastName.trim() === '') {
    displayFieldError('firstName', "The last name should not be empty");
    return false;
  } else if (lastName.length > maxLengths.lastName){
    displayFieldError('firstName', "The last name is too long");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    displayFieldError('email', "Wrong e-mail format");
    return false;
}

  const phonePattern = /^\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3,}$/;//for international phone formats
  if (phoneNumber.trim() === '') {
    displayFieldError('phoneNumber', "The phone number should not be empty");
    return false;
  } else if (!phonePattern.test(phoneNumber)) {
    displayFieldError('phoneNumber', "Wrong phone number format");
    return false;
  }

   if(problem.length > maxLengths.problem){
    displayFieldError('problem', "The problem description should not exceed 500 characters");
    return false;
   }

  return true;
}

});
