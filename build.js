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
        canonical: obj.url, //obj.canonical,

        lang: 'en', // XXX
        image: obj.image || PREVIEW,
        domain: obj.domain || DOMAIN,
        favicon: obj.favicon || DEFAULT_FAVICON,
    });
};

var footerPart = Fs.readFileSync('./parts/footer.html', 'utf8');

log("Creating home page"); // index.html
write([
    templateHead({
        title: 'CryptPad - the end-to-end encrypted collaboration suite',
        description: 'An overview of the open-source project and its community',
        url: 'https://cryptpad.org',
        canonical: 'https://cryptpad.org/',
    }),
    [
        'intro',
        'what',
        'users',
        'testimonials',
        'open-source',
        'sustainability',
        'services',
        'governance',
        'contribute',
    ].map(function (part) {
        return swap(Fs.readFileSync('parts/' + part + '.html', 'utf8'), Stats);
    }).join('\n'),
    footerPart,
], 'built/index.html');

log("Creating research page"); // research.html
write([
    templateHead({
        title: 'CryptPad - research projects',
        description: "Research projects",
        url: 'https://cryptpad.org/research.html',
    }),
    Fs.readFileSync('parts/research.html', {encoding: 'utf8'}),
    footerPart,
], 'built/research.html');

log("Creating education page"); // education.html
write([
    templateHead({
        title: 'CryptPad - packages for education',
        description: "Protect the personal information of your institution's students and faculty",
        url: 'https://cryptpad.org/education.html',
    }),
    Fs.readFileSync('parts/education.html', {encoding: 'utf8'}),
    footerPart,
], 'built/education.html');


log("Creating enterprise page"); // enterprise.html
write([
    templateHead({
        title: 'CryptPad - packages for enterprise',
        description: "Keep your clients' data safe and have peace of mind",
        url: 'https://cryptpad.org/enterprise.html',
    }),
    Fs.readFileSync('parts/enterprise.html', {encoding: 'utf8'}),
    footerPart,
], 'built/enterprise.html');

log("Creating consulting page"); // consulting.html
write([
    templateHead({
        title: 'CryptPad - consulting services and custom development',
        description: 'Custom projects and training provided by the experienced CryptPad team',
        url: 'https://cryptpad.org/consulting.html',
    }),
    Fs.readFileSync('parts/consulting.html', 'utf8'),
    footerPart,
], 'built/consulting.html');

log("Creating support page"); // support.html
write([
    templateHead({
        title: 'CryptPad - premium support packages',
        description: 'Support packages and private installations provided by the experienced CryptPad team',
        url: 'https://cryptpad.org/support.html',
    }),
    Fs.readFileSync('parts/support.html', 'utf8'),
    footerPart,
], 'built/support.html');

log("Creating error page"); // error.html
write([
    templateHead({
        title: 'CryptPad - Page not found',
        description: 'Page not found',
        url: 'https://cryptpad.org/error.html',
    }),
    Fs.readFileSync('parts/error.html', 'utf8'),
    footerPart,
], 'built/error.html');

var instancePart = Fs.readFileSync('parts/instance.html', 'utf8');

log("Creating instance directory page"); // instances.html
write([
    templateHead({
        title: 'CryptPad - publicly available instances',
        description: "Find an instance that suits your needs",
        url: 'https://cryptpad.org/instances.html',
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
}).concat([footerPart])
), 'built/instances.html');

log("Compiling less");
Less.render(Fs.readFileSync("./styles/main.less", "utf8"), {}, function (err, output) {
    if (err) { return void console.error(err); }
    Fs.writeFileSync(Path.join(buildPath, 'style.css'), output.css);
});

