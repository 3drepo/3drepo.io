/*global require*/

var http = require("http");
var nodestatic = require('node-static');
var fileServer = new nodestatic.Server('./base_html');
var sys = require('util');

require('http').createServer(function(request, response) {
    "use strict";
    request.addListener('end', function() {
        fileServer.serve(request, response, function(err, result) {
            if (err) { // There was an error serving the file
                sys.error("Error serving " + request.url + " - " + err.message);

                // Respond to the client
                response.writeHead(err.status, err.headers);
                response.end();
            }
        });
    }).resume();
}).listen(8080);

