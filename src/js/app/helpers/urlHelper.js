function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter, defaultvalue) {
    var urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
}

export function getCredentials() {
    // TODO: Add channel, host and port into URL (as optional parameters)
    // Suggestion: Use JWT insted of exposed credentials
    // Simulator server can provide the JWT token
    const storedCredentials = localStorage.getItem('pera-swarm-credentials');
    const key = getUrlParam('key', false);

    const username = getUrlParam('username', false);
    const password = getUrlParam('password', false);
    const channel = getUrlParam('channel', false);
    const port = getUrlParam('port', false);
    const server = getUrlParam('server', false);
    clearParams();

    setTimeout(() => {
        if (server !== false) {
            localStorage.setItem('pera-swarm-server', server);
        }
        if (channel !== false) {
            localStorage.setItem('pera-swarm-channel', channel);
        }
        if (port !== false) {
            localStorage.setItem('pera-swarm-port', port);
        }
        if (key !== false) {
            localStorage.setItem('pera-swarm-key', key);
        }
    }, 2000);

    // Load the credentails
    if (key !== false) {
        // Having JWT Token
        // TODO: manage token expiring

        // Default: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjcmVhdGVkQXQiOiIyMDIxLTA0LTE1IDEyOjU0OjI0IiwiZXhwaXJlZEF0IjoiMjAyMS0wNC0xNSAwMTo1NDoyNCIsImhvc3QiOiJ3ZWJzZXJ2aWNlcy5jZXlrb2QuY29tIiwicG9ydCI6ODg4MywicGF0aCI6IlwvbXF0dCIsImNoYW5uZWwiOiJ2MSIsInVzZXIiOiJzd2FybV91c2VyIiwicGFzcyI6InN3YXJtX3VzZXJlMTUifQ.F1jqHyu1jE0zTa03yYTwwdy8AJofBLXWLvYMYLNlna6dUjTkz6WdtwjBcrF_zDARM95r67RykOiWJCHDiWM52MQFx3EivqTYUNnA5fyNfsdJgrBR0q7eESM28MTSFoxnVi7memIKCSnkju3qDRZuZZdB5jaLP2BYg7ipgEFzt7E
        console.log('Credentails: Loaded from JWT');

        const credentials = parseJwt(key);
        const username = credentials.user;
        const password = credentials.pass;
        const channel = credentials.channel;

        if (credentials.host !== undefined) localStorage.setItem('pera-swarm-server', credentials.host);
        if (credentials.port !== undefined) localStorage.setItem('pera-swarm-port', parseInt(credentials.port));
        if (credentials.path !== undefined) localStorage.setItem('pera-swarm-path', credentials.path);
        if (credentials.channel !== undefined) localStorage.setItem('pera-swarm-channel', credentials.channel);

        localStorage.setItem('pera-swarm-credentials', JSON.stringify({ username, password, channel }));

        return {
            username,
            password,
            channel
        };
    } else if (username !== false && password !== false) {
        // Having URL parameters
        console.log('Credentails: Loaded from URL parameters');
        localStorage.setItem('pera-swarm-credentials', JSON.stringify({ username, password, channel }));
        return {
            username,
            password,
            channel
        };
    } else if (username === false && password === false && storedCredentials !== null) {
        // Having stored credentials
        console.log('Credentails: Loaded from local storage');
        return JSON.parse(storedCredentials);
    }
    return -1;
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
}

function clearParams() {
    const path = window.location.origin + window.location.pathname;
    window.history.pushState({}, document.title, path);
}
