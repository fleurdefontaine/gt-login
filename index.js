const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimiter = require('express-rate-limit');
const compression = require('compression');

function cv_json(jsonObj) {
    return Object.entries(jsonObj)
        .map(([key, value]) => `${key}|${value}`)
        .join('\n');
}

app.use(compression({
    level: 5,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100, headers: true }));

app.all('/player/login/dashboard', function (req, res) {
    const tData = {};

    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).send('Invalid request body');
        }

        const uData = JSON.stringify(req.body).split('"')[1].split('\\n');
        const [uName, uPass] = [uData[0].split('|'), uData[1].split('|')];

        uData.forEach(line => {
            const [key, value] = line.split('|');
            tData[key] = value;
        });

        if (tData._token) {
            tData._token = cv_json(JSON.parse(tData._token));
        }

        if (uName[1] && uPass[1]) {
            return res.redirect('/player/growid/login/validate');
        }
    } catch (error) {
        console.error(`Error processing login request: ${error.message}`);
    }

    res.render(__dirname + '/public/html/dashboard.ejs', { data: tData });
});

app.all('/player/growid/login/validate', (req, res) => {
    const _token = req.body._token;
    const growId = req.body.growId;
    const password = req.body.password;

    const token = Buffer.from(
        `_token=${_token}&growId=${growId}&password=${password}`,
    ).toString('base64');

    res.send(
        `{"status":"success","message":"Account Validated.","token":"${token}","url":"","accountType":"growtopia"}`,
    );
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(5000, function () {
    console.log('Listening on port 5000');
});