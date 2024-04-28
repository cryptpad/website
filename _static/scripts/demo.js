'use strict';


window.addEventListener('load', function () {
  let form = document.querySelector('form');
  let instanceNameInput = document.getElementById('subdomain'); 

  function displayGlobalError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.textContent = message;
    errorMessage.classList.add('global-error-message');
    const submitButton = document.getElementById('submitBtn');
    submitButton.parentNode.insertBefore(errorMessage, submitButton.nextSibling);
}


  function clearGlobalError() {
      const globalErrorMessage = document.querySelector('.global-error-message');
      if (globalErrorMessage) {
          globalErrorMessage.parentNode.removeChild(globalErrorMessage);
      }
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
  let params = {
      instanceName: instanceNameInput.value
  };
  clearFieldError("urlContainer");

  postToServer(url, params, (err, json) => {
    if (err) {
        displayFieldError("urlContainer", "Error checking instance name availability");
        return;
    }
    else if(json.error){
      displayFieldError("urlContainer", json.error);
      return;
    }
    if (json.status) {
        console.log("The name is available");
        return;
    }
    console.log(json)
    displayFieldError("urlContainer","The name is not available");
  });

});

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearGlobalError();
    clearAllFieldErrors();

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
          displayGlobalError("Some errors prevented this form from being submitted.");
          return;
        }
        console.log(json)
        console.log(json.instanceCreationStatus)
        if (json.instanceCreationStatus) {
            localStorage.setItem('jsonData', JSON.stringify(json));
            console.log("The instance is being created and data was saved to local storage");
            window.location.href = "/demo_loading";
            return;
        }
        displayGlobalError("Some errors prevented this form from being submitted.");

      });
    } else {
      displayGlobalError("Some errors prevented this form from being submitted.");
      console.log("Failed because of validation error");
    }
});

function validateForm() {
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
