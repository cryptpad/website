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

// trying solution to cors error found here: https://www.reddit.com/r/react/comments/uc90b7/hi_im_consuming_an_api_form_an_express_server_my/
const whitelist = ["http://localhost:3004"]; 

const corsOptions = { 
    origin: (origin, callback) => { 
        if (!origin || whitelist.includes(origin)) { 
            callback(null, true); 
        } else { 
            callback(new Error("Not allowed by CORS")); 
        } 
    }, 
    credentials: true, 
}; 
app.use(cors(corsOptions));
// end temp solution 

// app.use(cors());
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

    url += '?' + (new URLSearchParams(body)).toString();

    Axios({
        method: method,
        url: url,
        auth: {
          username: config.cloud.name,
          password: config.cloud.password
        },
        data: data
      }).then(res => {
          cb(void 0, res.data);
      }).catch(err => {
          cb(err);
      });
};


function validateInstanceName(data) {
    let instanceName = data.instanceName;
    if (typeof(instanceName) !== "string" || !instanceName.trim() || instanceName.length > 200  || instanceName === instanceName.toUpperCase()) {
        return false;
    }
    return true;
}

app.post('/cloud/available', (req, res) => {
    let body = req.body;
     if (!validateInstanceName(body)) {
        return res.status(400).json({ error: "Invalid form data" });
    }
    let url = "/instances/available"

    sendToCloudServer('GET', url, body, (err, json) => {
        if (err) {
            console.log(err)
            return res.status(400).send(err);
        }
        res.json(json);
    })

});

app.post('/cloud/create', (req, res) => {
    let body = req.body;
    let url = "/create";
    sendToCloudServer('PUT', url, body, (err, json) => {
        if (err) {
            return res.status(400).send(err);
        }
        console.log("Instance creation started. Checking status...");
        res.json(json);
    });
});

app.get('/cloud/create/:jobId/progress', (req, res) => {
    const jobId = req.params.jobId;
    const url = `${config.cloud.baseUrl}/instances/${jobId}/state`;
    Axios.get(url, {
        auth: {
            username: config.cloud.name,
            password: config.cloud.password
        }
    }).then(response => {
        const { creationProgressInfo } = response.data;
        const progress = creationProgressInfo.progress;
        if (progress === 1) {
            res.json({ progress, instanceURL: creationProgressInfo.instanceURL, installToken: creationProgressInfo.instanceInstallationToken });
        } else {
            res.json({ progress });
        }
    }).catch(error => {
        console.error('Error fetching progress data:', error);
        res.status(500).json({ error: 'Error fetching progress data' });
    });
});




// Start the server
app.listen(config.httpPort, config.httpAddress, () => {
    console.log(['CryptPad.org Gitlab Connector', 'listening on port '+ config.httpPort]);
});

