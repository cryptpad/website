var each = function (A, f) { return [].slice.call(A).forEach(f); };
var find = function (sel, root) { return (root || document).querySelectorAll(sel); };
var el = function (name, opt, text) {
    opt = opt || {};
    var el = document.createElement(name);
    Object.keys(opt).forEach(function (attr) {
        el.setAttribute(attr, opt[attr]);
    });
    if (text) { el.innerText = text; }
    return el;
};

var addAnchors = function () {
    each(find('[id]'), function (block) {
        var id = block.getAttribute('id');
        if (!id) { return; }
        each(find(':is(h2, h3)', block), function (heading, i) {
            if (i) { return; }
            var text = heading.innerText;
            var a = el('a', {
                href: '#' + id,
            }, text);
            heading.innerText = '';
            heading.appendChild(a);
        });
    });
    each(find('[data-url]'), function (block) {
        var url = block.getAttribute('data-url');
        if (!url) { return; }
        var link = block.querySelector('[href]');
        if (!link) { return; }
        link.onclick = function (ev) { ev.stopPropagation(); };
        block.onclick = function (ev) {
            ev.preventDefault();
            console.log(url);
            link.click();
        };
    });

};

var addFormHandlers = function () {
    var els = document.getElementsByClassName('contact-form');
    Array.prototype.forEach.call(els, function(el) {
        var sending = false;
        el.addEventListener('submit', function (e) {
            e.preventDefault();
            if (sending) { return; }
            sending = true;

            // Get form data
            var data = new FormData(el);
            var body = JSON.stringify({
                org: data.get('org'),
                contact: data.get('contact'),
                email: data.get('email'),
                comments: data.get('comments').replace(/\n/g, '\n\n'),
                plan: data.get('plan'),
            });

            // Post the data
            fetch('/post', {
                method: 'POST',
                body: body,
                headers: {
                  'Content-Type': 'application/json'
                },
            }).then(function (response) {
                if (response.ok) { return response.json(); }
                return Promise.reject(response);
            }).then(function (data) {
                sending = false;
                if (data && data.error) {
                    console.error(data.error);
                    if (window.replaceDialog) { replaceDialog('dialog-contact-error'); }
                    return;
                }
                if (window.replaceDialog) { replaceDialog('dialog-contact-success'); }
            }).catch(function (error) {
                sending = false;
                console.error(error);
                if (window.replaceDialog) { replaceDialog('dialog-contact-error'); }
            });

            return false;
        });
    });
};

window.addEventListener('load', function () {
    let myHamburger = document.getElementById('hamburger'),
    myNavMenu = document.getElementById('navMenu'),
    closeNavMenu = document.getElementById('closeNavMenu'),
    main = document.querySelector('main'),
    myMenuLinks = document.querySelectorAll('nav button, nav a'),
    transitionTime = 400, // This matches what's in the CSS for the transition
    overlay = document.createElement('div');

document.body.appendChild(overlay);

function doMenuOpen () {
  myHamburger.setAttribute('aria-expanded', true);
  myNavMenu.classList.remove('vh');
  myNavMenu.classList.remove('hidden');
  main.classList.add('menuOpen');
  myHamburger.classList.add('menuOpen');
  myHamburger.classList.add('hamburger-z');
  window.setTimeout(function () {
    closeNavMenu.focus();
    overlay.classList.add('overlay');
    overlay.addEventListener('click', function () {
      doMenuClose();
    }, false);

    document.addEventListener('keyup', function (e) {
      // 27 = ESC key
      if (e.keyCode === 27) {
        doMenuClose();
      }
    }, false);
  }, transitionTime);
}

function doMenuClose () {
  myHamburger.setAttribute('aria-expanded', false);
  myNavMenu.classList.add('hidden');
  main.classList.remove('menuOpen');
  myHamburger.classList.remove('menuOpen');
  overlay.classList.remove('overlay');
  window.setTimeout(function () {
    myNavMenu.classList.add('vh');
    myHamburger.focus();
    overlay.classList.remove('overlay');
    myHamburger.classList.remove('hamburger-z');
  }, transitionTime);
}

myHamburger.addEventListener('click', function () {
  if (myNavMenu.classList.contains('hidden')) {
    doMenuOpen();
  } else {
    doMenuClose();
  }
}, false);

closeNavMenu.addEventListener('click', function () {
  doMenuClose();
}, false);
});


document.onreadystatechange = function () {
    if (document.readyState !== 'complete') { return; }
    addAnchors();
    try {
        addFormHandlers();
    } catch (e) {
        console.error(e);
    }
};

