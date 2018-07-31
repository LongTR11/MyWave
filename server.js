require('dotenv').load();

const express = require('express');
const req = require('request');
const path = require('path');
let app = express(),
    port = process.env.PORT || 3000;

app.use(express.static('assets'));
app.listen(port);

console.log(`app running on ${port}`);

app.route('/').get(function(request, response) {
    response.sendFile(path.join(__dirname + '/index.html'));
});
app.route('/point').get(function(request, response) {
    const lat = request.query.lat
    const lng = request.query.lng
    const start = request.query.start
    req.get({
        url:`https://api.stormglass.io/point?lat=${lat}&lng=${lng}&start=${start}`,
        headers: {
            'Authorization': process.env.STORMGLASS_KEY
        }
    }, function(error, res, body) {
        if (!error && res.statusCode == 200) {
            response.json(body);
        }
    })
});