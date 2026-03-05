'use strict';


window.addEventListener('load', function () {
  let form = document.querySelector('form');
  let instanceNameInput = document.getElementById('subdomain');
  let spinner = document.getElementById('spinner');
  let checkmark = document.getElementById('checkmark');
  let problemTextarea = document.getElementById('problem');
  let charCount = document.getElementById('charCount');

  checkmark.style.display = 'none';
  spinner.style.display = 'none';

  function hideStatus() {
    spinner.style.display = 'none';
    checkmark.style.display = 'none';
  }

  function displaySubmitButtonError(message) {
    const errorContainer = document.getElementById('submitButtonError');
    errorContainer.innerHTML = `<i data-lucide="circle-alert"></i><span>${message}</span>`;
  }

  function displayFieldError(fieldId, message) {
    clearFieldError(fieldId); // Clear any previous errors of the same type
    hideStatus();
    let field = document.getElementById(fieldId);
    let errorContainer = document.createElement('div');
    let errorIcon = document.createElement('i');
    let errorMessage = document.createElement('span');
    errorIcon.setAttribute('data-lucide', 'circle-alert');
    errorMessage.textContent = message;
    errorContainer.appendChild(errorIcon);
    errorContainer.appendChild(errorMessage);
    errorContainer.classList.add('error-container');
    field.parentNode.insertBefore(errorContainer, field.nextSibling);
    field.classList.add('error');
    lucide.createIcons();
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

function updateCharCount() {
  charCount.textContent = `Character count: ${problemTextarea.value.length} / 700`;
}

problemTextarea.addEventListener('input', updateCharCount);


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

instanceNameInput.addEventListener('input', function () {
  let url = "/cloud/available";
  let instanceName =  instanceNameInput.value;
  let params = {
      instanceName: instanceNameInput.value
  };
  clearFieldError("urlContainer");


  if(checkmark.style.display === 'none'){
    spinner.style.display = 'inline-block';
  }

  if(instanceName.length <= 4){
    displayFieldError("urlContainer", "Instance name should contain more than 4 characters");
    return;
  }
  else if(instanceName.length >= 64){
    displayFieldError("urlContainer", "Instance name should not exceed 65 characters");
    return;
  }

  postToServer(url, params, (err, json) => {
    if (err || json.error) {
      displayFieldError("urlContainer", "Error checking instance name availability");
      return;
    }

    if (json.errorType == "subdomain_contains_special_chars") {
      displayFieldError("urlContainer", "Instance name should not contain capital letters or special characters");
      return;
    }

    if (json?.offline) {
        return;
    }
    if (json?.status) {
        console.log("The name is available");
        spinner.style.display = 'none';
        checkmark.style.display = 'inline-block';
        return;
    }
    displayFieldError("urlContainer","The name is not available");
});


});

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearAllFieldErrors();
    let url = "/cloud/create";
    let params = {
        instanceName: document.getElementById('subdomain').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        company:  document.getElementById('organization').value,
        lang: "en",
        instanceType: "cryptpad",
        limits: "Products.CryptadDemoPlan",
        newsletter: document.getElementById('newsletter').checked,
        '_deployment': document.getElementById('deployment').value,
        '_teamSize': document.getElementById('teamSize').value,
        '_solution': document.getElementById('solution').value,
        '_problem': document.getElementById('problem').value
    };
    if (validateForm()) {
      const submit = document.getElementById('submitBtn');
      if (submit) { submit.setAttribute('disabled', 'disabled'); }
      postToServer(url, params, (err, json) => {
        if (json?.offline) {
            displaySubmitButtonError("The demo service is not available at the moment. Your information was sent and we will contact you as soon as demos are available again.");
            return;
        }

        if (submit) { submit.removeAttribute('disabled'); }
        if (err) {
          console.error(err);
          displaySubmitButtonError("Some errors prevented this form from being submitted.");
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
    displayFieldError('lastName', "The last name should not be empty");
    return false;
  } else if (lastName.length > maxLengths.lastName){
    displayFieldError('lastName', "The last name is too long");
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
