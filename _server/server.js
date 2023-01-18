/*
    globals process
*/

const Express = require('express');
const Path = require('path');
const BodyParser = require('body-parser');
const Axios = require('axios');
const config = require('./config');

const app = Express();
app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());

// Serve the content to test locally
app.use(Express.static(Path.resolve('built')));

// Post to gitlab
const postGitlab = (data, cb) => {
    let org = data.org;
    let contact = data.contact;
    let email = data.email;
    let comments = data.comments;
    let plan = data.plan;

    let content = {
        title: `${plan}: ${org}`,
        labels: "from cryptpad.org",
        description: `
## Contact\n
${contact}\n
## Email\n
${email}\n
## Org\n
${org}\n
## Comments\n
${comments}`
    };

    // Local testing: don't push to gitlab
    if (config.gitlab.url === 'localhost') {
        console.log(content);
        return cb();
    }

    Axios.post(`${config.gitlab.url}/api/v4/projects/${config.gitlab.projectID}/issues`, content, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${config.gitlab.token}`
        }
    }).then(() => {
        cb();
    }).catch((e) => {
        console.error("Error while creating GitLab issue");
        console.error(e);
        cb(e);
    });
};

// Listen for post requests
app.post('/post', (req, res) => {
    postGitlab(req.body, (err) => {
        if (err) {
            return res.send({error: err});
        }
        res.send({});
    });
});

// Start the server
app.listen(config.httpPort, config.httpAddress, () => {
    console.log(['CryptPad.org Gitlab Connector', 'listening on port '+ config.httpPort]);
});
