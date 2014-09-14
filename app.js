var express = require('express');
var app = express();

app.use(express.static(__dirname));

var server = app.listen(3005, function () {
    console.log('Listening on port %d', server.address().port);
});
