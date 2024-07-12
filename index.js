const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    console.log(req.method, req.url);
    next();
});

app.use(express.json());

app.post('/player/login/dashboard', (req, res) => {
    res.redirect('/player/growid/login');
});

app.post('/player/growid/login', (req, res) => {
    res.redirect('/player/growid/login/validate');
});

app.post('/player/growid/login/validate', (req, res) => {
    const dummyTokenData = Buffer.from('_token=&growId=&password=').toString(
        'base64',
    );
    res.send(
        `{"status":"success","message":"Account Validated.","token":"${dummyTokenData}","url":"","accountType":"growtopia"}`,
    );
});

app.post('/player/validate/close', function (req, res) {
    res.send('<script>window.close();</script>');
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(5000, function () {
    console.log('Listening on port 5000');
});
