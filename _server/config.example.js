module.exports = { 
    httpAddress: '::',
    httpPort: 3004,
    gitlab: {
        url: 'localhost', // localhost will print to the console instead of sending to gitlab
        token: '', 
        projectID: 0
    },
    cloud: {
        disable: false,
        name: '',
        password: '',
        baseUrl: '',
        webmecanik: ''
    }
};
