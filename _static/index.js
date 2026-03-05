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

// Hamburger Menu

document.addEventListener('DOMContentLoaded', function () {
    var myHamburger = document.getElementById('hamburger');
    var myNavMenu = document.getElementById('dropDown');

    function doMenuOpen() {
        myHamburger.setAttribute('aria-expanded', true);
        myNavMenu.style.display='flex';
        document.addEventListener('click', handleClickOutside);
    }

    function doMenuClose() {
        myHamburger.setAttribute('aria-expanded', false);
        myNavMenu.style.display='none';

        document.removeEventListener('click', handleClickOutside);
    }

    function handleClickOutside(event) {
        // click is outside both the button and menu
        if (!myNavMenu.contains(event.target) && !myHamburger.contains(event.target)) {
            doMenuClose();
        }
    }

    function toggleMenu() {
        display = window.getComputedStyle(myNavMenu, null).display;
        if(display == 'none'){
            doMenuOpen();
        } else {
            doMenuClose();
        }
    }
    myHamburger.addEventListener('click', function (event) {
        event.stopPropagation();
        toggleMenu();
    });

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
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


