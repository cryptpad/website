/*
    globals process
*/

const Express = require('express');
const Path = require('path');
const BodyParser = require('body-parser');
const Axios = require('axios');
const config = require('./config');
const cors = require('cors');
const Mail = require('./mail');

const app = Express();
app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());
app.use(cors());
// Serve the content to test locally
app.use(Express.static(Path.resolve('built')));

const XNNG_DISABLED = !!config.cloud?.disable;

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

let postWebmecanik = (data, xnngDown) => {
    let url = config.cloud.webmecanik;
    if (!url) { return; }

    if (XNNG_DISABLED || xnngDown) {
        data.company = `[ERROR DEMO NOT LAUNCHED] ${data.company}`;
    }

    const CPtoWM = {
        firstName: 'mauticform[first_name]',
        lastName: 'mauticform[last_name]',
        email: 'mauticform[email]',
        phoneNumber: 'mauticform[phone]',
        company: 'mauticform[companyorganisation]',
        instanceName: 'mauticform[instance_name]',
        newsletter: 'mauticform[newsletter_opt_in]',
        '_teamSize': 'mauticform[what_is_the_size_of_your]',
        '_deployment': 'mauticform[for_what_type_of_deployme]',
        '_solution': 'mauticform[what_solution_would_bette]',
        '_problem': 'mauticform[describe_your_project_in]',
    };
    const formData  = new FormData();
    for(const name in CPtoWM) {
        if (data[name]) {
            let newName = CPtoWM[name];
            formData.append(newName, data[name]);
        }
    }

    let id = new URL(url).searchParams.get('formId');
    formData.append('mauticform[formId]', id);
    formData.append('mauticform[language]', 'en');
    formData.append('mauticform[instance_type]', 'cryptpad');
    formData.append('mauticform[return]', '');
    formData.append('mauticform[formName]', 'cryptpadclouddemocreationen');
    formData.append('mauticform[messenger]', 1);

    Axios.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).catch(error => {
        console.error("Error while posting to webmecanik");
        console.error(url);
        console.error(formData);
        console.error(error.response?.data || error.message);
        console.error(error.response?.status);
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
    if (XNNG_DISABLED) {
        return res.json({
            offline: true
        });
    }
    let body = req.body;
     if (!validateInstanceName(body)) {
        return res.status(400).json({ error: "Invalid form data" });
    }
    let url = "/instances/available"
    sendToCloudServer('GET', url, body, (err, json) => {
        if (err) {
            console.log(err)
            return res.json({
                offline: true // hide server errors
            });
            //return res.status(400).send(err);
        }
        res.json(json);
    })

});

app.post('/cloud/create', (req, res) => {
    let body = req.body;
    let url = "/create";

    let webMecData = JSON.parse(JSON.stringify(body));

    const sendMail = (error) => {
        let subject = `CryptPad.org Cloud form: ${body.company}`;
        let content = JSON.stringify(body, 0, 2);
        Mail.send(subject, content, (err, info) => {
            if (err) {
                res.status(400).send(error);
                return void postWebmecanik(webMecData, true);
            }
            res.json({
                offline: true
            });
        });
    };

    if (XNNG_DISABLED) {
        return void sendMail();
    }

    delete body._deployment;
    delete body._teamSize;
    delete body._solution;
    delete body._problem;

    sendToCloudServer('PUT', url, body, (err, json) => {
        if (err) {
            return void sendMail(err);
        }
        postWebmecanik(webMecData);
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

