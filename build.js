var Fs = require("fs");
var Fse = require("fs-extra");
var Path = require("path");
var Less = require("less");

var Stats = require("./data/stats.json");

var head = Fs.readFileSync('./parts/head.html', 'utf8');

var swap = function (s, o) {
    return s.replace(/\{\{([^}]+?)\}\}/g, function (all, token) {
        //console.log(token);
        var content = o[token];

        if (typeof(content) === 'number') {
            content = String(content);
        }

        if (typeof(content) !== 'string') {
            console.error("expected {{%s}}", token);
            throw new Error("invalid input");
        }

        if (!content) {
            console.error("expected {{%s}}", token);
            throw new Error("insufficient input");
        }
        return content;
    });
};

var isNonEmptyString = function (s) {
    return s && typeof(s) === 'string';
};

var write = function (A, dest) {
    Fs.writeFileSync(dest, A.filter(isNonEmptyString).join('\n'));
};

var log = function (s) {
    console.log(s);
};

log("Creating target directories");

var buildPath = './built';
Fse.mkdirpSync(buildPath);

log("Copying static assets");
var staticPath = 'static';
Fse.copySync(staticPath, buildPath);

var DEFAULT_FAVICON = 'images/main-favicon.png';
var DOMAIN = 'cryptpad.org';
var PREVIEW = 'https://cryptypad.org/images/shredder.png';

var templateHead = function (obj) {
    return swap(head, {
        title: obj.title,
        description: obj.description,
        url: obj.url,
        canonical: obj.canonical,

        lang: 'en', // XXX
        image: obj.image || PREVIEW,
        domain: obj.domain || DOMAIN,
        favicon: obj.favicon || DEFAULT_FAVICON,
    });
};

log("Creating home page"); // index.html
write([
    templateHead({
        title: 'CryptPad - the end-to-end encrypted collaboration suite',
        description: 'An overview of the open-source project and its community',
        url: 'https://cryptpad.org',
        canonical: 'https://cryptpad.org/',
    }),
    swap(Fs.readFileSync('parts/index.html', {encoding: 'utf8'}), Stats),
], 'built/index.html');

log("Creating education page"); // education.html
write([
    templateHead({
        title: 'CryptPad - packages for education',
        description: "Protect the personal information of your institution's students and faculty",
        url: 'https://cryptpad.org/education.html',
        canonical: 'https://cryptpad.org/education.html',
    }),
    Fs.readFileSync('parts/education.html', {encoding: 'utf8'}),
], 'built/education.html');


log("Creating enterprise page"); // enterprise.html
write([
    templateHead({
        title: 'CryptPad - packages for enterprise',
        description: "Keep your clients' data safe and have peace of mind",
        url: 'https://cryptpad.org/enterprise.html',
        canonical: 'https://cryptpad.org/enterprise.html',
    }),
    Fs.readFileSync('parts/enterprise.html', {encoding: 'utf8'}),
], 'built/enterprise.html');

log("Creating consulting page"); // consulting.html
write([
    templateHead({
        title: 'CryptPad - consulting services and custom development',
        description: 'Custom projects and training provided by the experienced CryptPad team',
        url: 'https://cryptpad.org/consulting.html',
        canonical: 'https://cryptpad.org/enterprise.html',
    }),
    Fs.readFileSync('parts/consulting.html', 'utf8')
], 'built/consulting.html');

log("Creating error page"); // error.html
write([
    templateHead({
        title: 'CryptPad - Page not found',
        description: 'Page not found',
        url: 'https://cryptpad.org/error.html',
        canonical: 'https://cryptpad.org/error.html',
    }),
    Fs.readFileSync('parts/error.html', 'utf8')
], 'built/error.html');

var instancePart = Fs.readFileSync('parts/instance.html', 'utf8');

log("Creating instance directory page"); // instances.html
write([
    templateHead({
        title: 'CryptPad - publicly available instances',
        description: "Find an instance that suits your needs",
        url: 'https://cryptpad.org/instances.html',
        canonical: 'https://cryptpad.org/instances.html',
    }),
    Fs.readFileSync('parts/instances.html', {encoding: 'utf8'}),
].concat([ // XXX keep a list of manually validated instances
    {
        title: 'CryptPad.fr',
        url: 'https://cryptpad.fr',
        description: 'The flagship instance that is hosted and administrated by the CryptPad core development team.',
    },
    {
        title: 'pad.c3w.at',
        url: 'https://pads.c3w.at',
        description: 'Hosted by the Vienna chapter of the Chaos Computer Club',
    },
    {
        title: 'pad.freifunk.duesseldorf.de',
        url: 'https://pad.freifunk.duesseldorf.de',
        description: 'Hosted by Freifunk Duesseldorf: a wireless community mesh network run by volunteers.',
    },
    {
        title: 'pad.envs.net',
        url: 'https://pad.envs.net',
        description: 'One of many services hosted by envs.net, a minimalist, non-commercial shared linux system.',
    },
    {
        title: 'pad.artemislena.eu',
        url: 'https://pad.artemislena.eu',
        description: 'In Germany. Using nixos, caddy, and podman',
    },
].map(function (data) {
    return swap(instancePart, data);
})), 'built/instances.html');

log("Compiling less");
Less.render(Fs.readFileSync("./styles/main.less", "utf8"), {}, function (err, output) {
    if (err) { return void console.error(err); }
    Fs.writeFileSync(Path.join(buildPath, 'style.css'), output.css);
});

