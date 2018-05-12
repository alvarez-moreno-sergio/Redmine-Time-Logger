const http = require("http");
const fs = require("fs");
const path = require("path");
const mime = require("mime");

const redmineModule = require('./redmineModule');
const config = require('../config');

let cache = {};

function send404(response){
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("Error 404. Page not found.");
    response.end();
}

exports.sendContent = function (response, content){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(`Content found: ${content}`);
    response.end();
};

function sendFile(response, filePath, fileContents){
    response.writeHead(200, {"Content-Type": mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

function serveStatic(response, cache, absPath){
    console.log(`==> Serving content ${absPath}.`);

    let state = 0;
    if (cache[absPath]){
        // state = 1; //sendFile
        sendFile(response, absPath, cache[absPath]);
    }
    else {
        fs.exists(absPath, function(exists) {
            if (exists){
                fs.readFile(absPath, function(err, data) {
                    if (err){
                        // state = -1; //404
                        send404(response);
                    }
                    else {
                        cache[absPath] = data;
                        // state = 1;
                        sendFile(response, absPath, cache[absPath]);
                    }
                });
            }
            else {
                // state = -1;
                send404(response);
            }

            // switch(state){
            // 	case -1:
            // 		send404(response);
            // 		break;
            // 	case 0:
            // 		break;
            // 	case 1:
            // 		sendFile(response, absPath, cache[absPath]);
            // 		break;
            // }


        });
    }
}

exports.startServer = function() {
    let server = http.createServer(function (request, response) {
            console.log(`<== Received request from ${response.socket.remoteAddress}.`);
            if (request.url === '/sendTimeEntries' && request.method === 'POST') {
                redmineModule.createAndSendTimeEntry(request, response);
            }
            else {
                let filePath = "";
                if (request.url === "/" || request.url === "/index.html") {
                    filePath = "./index.html";
                }
                else {
                    filePath = "." + request.url;
                }

                serveStatic(response, cache, filePath);
            }
        });

        server.listen(config.serverPort);
        console.log(`Listening on port: ${config.serverPort}`);
        console.log(`-${config.companyshortName} Redmine Time Logger Tool-`);
};
