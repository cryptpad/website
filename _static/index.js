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
        el.addEventListener('submit', function (e) {
            e.preventDefault();

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
                if (data && data.error) {
                    console.error(data.error);
                    if (window.replaceDialog) { replaceDialog('dialog-contact-error'); }
                    return;
                }
                if (window.replaceDialog) { replaceDialog('dialog-contact-success'); }
            }).catch(function (error) {
                console.error(error);
                if (window.replaceDialog) { replaceDialog('dialog-contact-error'); }
            });

            return false;
        });
    });
};


document.onreadystatechange = function () {
    if (document.readyState !== 'complete') { return; }
    addAnchors();
    try {
        addFormHandlers();
    } catch (e) {
        console.error(e);
    }
};
