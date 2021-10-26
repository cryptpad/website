var Fs = require("fs");
var Fse = require("fs-extra");
var Path = require("path");
var Less = require("less");

var Stats = require("./data/stats.json");

var head = Fs.readFileSync('./parts/head.html', 'utf8');

var swap = function (s, o) {
    return s
    .replace(/\{\{([^}]+?)\}\}/g, function (all, token) {
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
    var content = A
        .filter(isNonEmptyString)
        .join('\n')
        .replace(/<!\-\-[\s\S]+?\-\->/g, '')
        .replace(/\n[ \t]+?\n/mg, '')
        .replace(/\n+/g, '\n');
    Fs.writeFileSync(Path.join(tmpPath, dest), content);
};

var log = function (s) {
    console.log(s);
};

log("Creating target directories");

var buildPath = './built';
var tmpPath = 'CRYPTPAD_TEMP_BUILD';
// remove tmp path so we start fresh
Fse.removeSync(tmpPath);
// make a new temp path
Fse.mkdirpSync(tmpPath);

log("Copying static assets");
var staticPath = 'static';
Fse.copySync(staticPath, tmpPath);

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
], 'index.html');

log("Creating research page"); // research.html
write([
    templateHead({
        title: 'CryptPad - research projects',
        description: "Research projects",
        url: 'https://cryptpad.org/research.html',
    }),
    swap(Fs.readFileSync('parts/research.html', {encoding: 'utf8'}), Stats),
    footerPart,
], 'research.html');

log("Creating education page"); // education.html
write([
    templateHead({
        title: 'CryptPad - packages for education',
        description: "Protect the personal information of your institution's students and faculty",
        url: 'https://cryptpad.org/education.html',
    }),
    Fs.readFileSync('parts/education.html', {encoding: 'utf8'}),
    footerPart,
], 'education.html');


log("Creating enterprise page"); // enterprise.html
write([
    templateHead({
        title: 'CryptPad - packages for enterprise',
        description: "Keep your clients' data safe and have peace of mind",
        url: 'https://cryptpad.org/enterprise.html',
    }),
    Fs.readFileSync('parts/enterprise.html', {encoding: 'utf8'}),
    footerPart,
], 'enterprise.html');

log("Creating consulting page"); // consulting.html
write([
    templateHead({
        title: 'CryptPad - consulting services and custom development',
        description: 'Custom projects and training provided by the experienced CryptPad team',
        url: 'https://cryptpad.org/consulting.html',
    }),
    Fs.readFileSync('parts/consulting.html', 'utf8'),
    footerPart,
], 'consulting.html');

log("Creating support page"); // support.html
write([
    templateHead({
        title: 'CryptPad - premium support packages',
        description: 'Support packages and private installations provided by the experienced CryptPad team',
        url: 'https://cryptpad.org/support.html',
    }),
    Fs.readFileSync('parts/support.html', 'utf8'),
    footerPart,
], 'support.html');

log("Creating error page"); // error.html
write([
    templateHead({
        title: 'CryptPad - Page not found',
        description: 'Page not found',
        url: 'https://cryptpad.org/error.html',
    }),
    Fs.readFileSync('parts/error.html', 'utf8'),
    footerPart,
], 'error.html');

var instancePart = Fs.readFileSync('parts/instance.html', 'utf8');
var Instances = require("./data/instances.json");

var instanceParts = Instances.map(function (data) {
    return swap(instancePart, data);
}).join('\n');

log("Creating instance directory page"); // instances.html
write([
    templateHead({
        title: 'CryptPad - publicly available instances',
        description: "Find an instance that suits your needs",
        url: 'https://cryptpad.org/instances.html',
    }),
    Fs.readFileSync('parts/instances.html', {encoding: 'utf8'}),
    instanceParts,
    footerPart,
], 'instances.html');

log("Compiling less");
Less.render(Fs.readFileSync("./styles/main.less", "utf8"), {}, function (err, output) {
    if (err) { return void console.error(err); }
    Fs.writeFileSync(Path.join(tmpPath, 'style.css'), output.css);
    Fse.removeSync(buildPath);
    Fs.renameSync(tmpPath, buildPath);
});

