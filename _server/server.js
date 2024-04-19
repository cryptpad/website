/*
    globals process
*/

const Express = require('express');
const Path = require('path');
const BodyParser = require('body-parser');
const Axios = require('axios');
const config = require('./config');
const cors = require('cors');

const app = Express();
app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());
app.use(cors());
// Serve the content to test locally
app.use(Express.static(Path.resolve('built')));

// Post to gitlab
const postGitlab = (data, cb) => {
    if (!data) { return cb(new Error("Missing data")); }
    let contact = data.contact;
    let org = data.org || contact;
    let email = data.email;
    let comments = data.comments;
    let plan = data.plan;

    if (['contact', 'email', 'plan'].some((key) => {
        return !data[key];
    })) {
        return cb(new Error("Missing data"));
    }

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
            return res.send({error: err.message || err});
        }
        res.send({});
    });
});

let sendToCloudServer = (method, path, body, cb) => {
    let url = `${config.cloud.baseUrl}${path}`;
    let data;
    console.log(url)
    if (method === 'GET') {
        url += '?' + (new URLSearchParams(body)).toString();
    } else {
        data = JSON.parse(JSON.stringify(body));
    }
    
    Axios({
      method: method,
      url: url,
      auth: {
        username: config.cloud.name,
        password: config.cloud.password
      },
      data: data
    }).then(response => {
        if (response.ok) { return response.json(); }
        cb(response);
    }).then(json => {
        cb(void 0, json);
    }).catch(err => {
        cb(err);
    });
};

function validateInstanceName(data) {
    let instanceName = data.instanceName;
    if (instanceName.trim() === '') {
        console.log("Please input your instance name.");
        return false;
    } else if (instanceName.length > 200){
        console.log("Instance name is too long.");
        return false;
    }
    else if(typeof instanceName !== 'string'){
    console.log("Instance name should be a string")
    return false;
    }

    return true;
}
const util = require('util');

app.post('/cloud/available', (req, res) => {
    let body = req.body;    
     // Validate form fields
  

// Inside the /cloud/available route handler
    
     if (!validateInstanceName(body)) {
        return res.status(400).json({ error: "Invalid form data" });
    }
    let url = "/instances/available"

    sendToCloudServer('GET', url, body, (err, json) => {
        console.log("error:", err);
        if (err) {
            return res.status(400).send(err);
        }
        res.json(json);
    })
});

// Start the server
app.listen(config.httpPort, config.httpAddress, () => {
    console.log(['CryptPad.org Gitlab Connector', 'listening on port '+ config.httpPort]);
});

