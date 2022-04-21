var Fs = require("fs");
var Fse = require("fs-extra");
var Path = require("path");
var Less = require("less");

var Stats = require("./data/stats.json");
var cachebuster = Stats.cachebuster = +new Date();

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

    var path = Path.join(tmpPath, dest);
    var dirPath = Path.dirname(path);
    Fse.mkdirpSync(dirPath);
    Fs.writeFileSync(path, content);
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

var DEFAULT_FAVICON = '/images/main-favicon.png';
var DOMAIN = 'cryptpad.org';
var PREVIEW = 'https://cryptpad.org/images/shredder.png';

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
        cachebuster: cachebuster,
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
        'home/hero',
        'home/suite',
        'home/e2ee',
        'home/open-source',


/*
        'users',
        'testimonials',
        'open-source',
        'sustainability',
        'services',
        'governance',
        'contribute',
*/
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
        url: 'https://cryptpad.org/research/',
    }),
    swap(Fs.readFileSync('parts/research.html', {encoding: 'utf8'}), Stats),
    footerPart,
], 'research/index.html');

log("Creating education page"); // education.html
write([
    templateHead({
        title: 'CryptPad - packages for education',
        description: "Protect the personal information of your institution's students and faculty",
        url: 'https://cryptpad.org/education/',
    }),
    Fs.readFileSync('parts/education.html', {encoding: 'utf8'}),
    footerPart,
], 'education/index.html');


log("Creating enterprise page"); // enterprise.html
write([
    templateHead({
        title: 'CryptPad - packages for enterprise',
        description: "Keep your clients' data safe and have peace of mind",
        url: 'https://cryptpad.org/enterprise.html',
    }),
    Fs.readFileSync('parts/enterprise.html', {encoding: 'utf8'}),
    footerPart,
], 'enterprise/index.html');

log("Creating consulting page"); // consulting.html
write([
    templateHead({
        title: 'CryptPad - consulting services and custom development',
        description: 'Custom projects and training provided by the experienced CryptPad team',
        url: 'https://cryptpad.org/consulting/',
    }),
    Fs.readFileSync('parts/consulting.html', 'utf8'),
    footerPart,
], 'consulting/index.html');

log("Creating support page"); // support.html
write([
    templateHead({
        title: 'CryptPad - premium support packages',
        description: 'Support packages and private installations provided by the experienced CryptPad team',
        url: 'https://cryptpad.org/support/',
    }),
    Fs.readFileSync('parts/support.html', 'utf8'),
    footerPart,
], 'support/index.html');

log("Creating error page"); // error.html
write([
    templateHead({
        title: 'CryptPad - Page not found',
        description: 'Page not found',
        url: 'https://cryptpad.org/error/',
    }),
    Fs.readFileSync('parts/error.html', 'utf8'),
    footerPart,
], 'error.html');

var instancePart = Fs.readFileSync('parts/instance.html', 'utf8');
var Instances = require("./data/instances.json");

var str = s => typeof(s) === 'string';
var Url = u => {
    try {
        return Boolean(new URL(u).href);
    } catch (err) {
        return false;
    }
};

var instanceAttributes  = {
    title: str,
    url: Url,
    description: str,
    location: str,
};

var instanceParts = Instances
.map(data => {
    data.title = data.title || data.url;
    return data;
})
.filter(data => {
    return  Object.keys(instanceAttributes).every(k => {
        return instanceAttributes[k](data[k]);
    });
})
.map(function (data) {
    data.id = data.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    //data.description = data.description.replace(/\n/g, '<br>');
    return swap(instancePart, data);
}).join('\n');

log("Creating instance directory page"); // instances.html
write([
    templateHead({
        title: 'CryptPad - publicly available instances',
        description: "Find an instance that suits your needs",
        url: 'https://cryptpad.org/instances/',
    }),
    Fs.readFileSync('parts/instances.html', {encoding: 'utf8'}),
    instanceParts,
    footerPart,
], 'instances/index.html');


var testimonialPart = Fs.readFileSync('parts/testimonial.html', 'utf8');
var testimonials = require("./data/testimonials.js");

log("Creating testimonials page"); // testimonials.html
write([
    templateHead({
        title: 'CryptPad - Testimonials',
        description: "Hear what others have to say",
        url: 'https://cryptpad.org/testimonials/',
    }),
    Fs.readFileSync('parts/testimonials.html', {encoding: 'utf8'}),
    '<section class="half" id="testimonials"><div class="contain">',
    testimonials.filter(t => {
        return t.text && t.name;
    }).sort(() => {
        return Math.random() > 0.5? 1: -1;
    }).slice(0, 10)
    .map(t => {
        t.id = t.text.slice(0, 10);
        t.extra = !t.org?" ": `<p class="org name"><i>${t.org}</i></p>`;
        return swap(testimonialPart, t);
    }).join('\n'),
    '</div></section>',
    footerPart,
], 'testimonials/index.html');

log("Compiling less");
Less.render(Fs.readFileSync("./styles/main.less", "utf8"), {}, function (err, output) {
    if (err) { return void console.error(err); }
    Fs.writeFileSync(Path.join(tmpPath, 'style.css'), output.css);
    Fse.removeSync(buildPath);
    Fs.renameSync(tmpPath, buildPath);
});

