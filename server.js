const http = require('http');
  
const PORT = 3000;
 
let db = {};
let id = 0;
  
function getReqMethod(request) {
    const method = request.method.toUpperCase();
    return method === 'GET' || method === 'POST' || method === 'PUT' || method === 'DELETE' ? method : '';
}

function getResponse() {
    return "<html><head><title>Sample HTML Page</title></head><body><h1>Hello, World!</h1><img src='src/cat.jpg' alt='Random Image'></body></html>";
}

function postResponse(postData) {
    id++;
    db[id.toString()] = postData;
    let htmlResp = "<html><head><title>Sample HTML Page</title></head><body>";
    for (const [key, value] of Object.entries(db)) {
        console.log(key + ":" + value);
        htmlResp += "<li>" + key + ":" + value + "</li>";
    }
    htmlResp += "</body></html>";
    return htmlResp;
}

function delResponse(reqId) {
    const parsedId = reqId.replace(/\W/g, ''); 
    console.log("ID: " + parsedId);
    let htmlResp = "";
    if (db.hasOwnProperty(parsedId)) {
        delete db[parsedId];
        htmlResp = "<html><head><title>Sample HTML Page</title></head><body>";
        for (const [key, value] of Object.entries(db)) {
            console.log(key + ":" + value);
            htmlResp += "<li>" + key + ":" + value + "</li>";
        }
        htmlResp += "</body></html>";
    }
    return htmlResp;
}

function getReqData(request) {
    const data = request.body || '';
    const finalData = data.split("").join("").split('{').join('');
    return finalData;
}

function handleRequest(request, response) {
    const method = getReqMethod(request); 
    let resp = "";
    if (method === 'GET') {
        resp = getResponse();
    } else if (method === 'POST') {
        const data = getReqData(request);
        console.log("REQ DATA: " + data);
        resp = postResponse(data);
    } else {
        const data = getReqData(request);
        console.log("REQ DATA: " + data);
        resp = delResponse(data);
    } 

    if (resp !== "") {
        response.writeHead(200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
        });
        response.end(resp);
    } else {
        const dynamicContent = "<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>";
        response.writeHead(404, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
        });
        response.end(dynamicContent);
    }
}

const server = http.createServer((request, response) => {
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });

    request.on('end', () => {
        request.body = body;
        handleRequest(request, response);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
});
