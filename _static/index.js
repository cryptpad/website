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

document.addEventListener('DOMContentLoaded', function () {
    var myHamburger = document.getElementById('hamburger');
    var myNavMenu = document.getElementById('navMenu');
    var navButtons = document.querySelector('.navButtons');

    function doMenuOpen() {
        myHamburger.setAttribute('aria-expanded', true);
        myNavMenu.classList.remove('vh', 'hidden');
    }

    function doMenuClose() {
        myHamburger.setAttribute('aria-expanded', false);
        myNavMenu.classList.add('hidden');
    }

    function toggleMenu() {
        if (myNavMenu.classList.contains('hidden')) {
            doMenuOpen();
        } else {
            doMenuClose();
        }
    }

    myHamburger.addEventListener('click', toggleMenu);
    var isSmallScreen = window.innerWidth <= 1000;
    myHamburger.style.display = isSmallScreen ? 'block' : 'none';
    myNavMenu.style.display = isSmallScreen ? 'flex' : 'none';
    navButtons.style.display = isSmallScreen ? 'none' : 'flex';


    window.addEventListener('resize', function () {
        var isSmallScreen = window.innerWidth <= 1000;
        myHamburger.style.display = isSmallScreen ? 'block' : 'none';

        if (isSmallScreen) {
            myNavMenu.style.display = 'flex';
            navButtons.style.display = 'none';
            if (!myNavMenu.classList.contains('hidden')) {
                doMenuClose();
            }
        } else {
            myNavMenu.style.display = 'none';
            navButtons.style.display = 'flex';
            myNavMenu.classList.add('hidden');
        }
    });
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


