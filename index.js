//Dependencies

var http = require("http");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;

//Instantiate server

var server = http.createServer(function(req,res){
    unifiedServer(req,res);    
});

//start the server

server.listen(3000, function(){
    console.log('Server is listeneing on port 3000');
});

var unifiedServer = function(req,res){
    //get the url and parse it
    var parsedUrl = url.parse(req.url,true);

    //get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    //get the query string as the object
    var queryStringObject = parsedUrl.query;

    //get the http method
    var method = req.method.toLowerCase();

    //get the headers as an object
    var headers = req.headers;

    //get the payload if any
    var decoder = new StringDecoder("utf-8");
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    });

    req.on('end',function(){
        buffer += decoder.end();

        //choose the handler this request should go to, if not found go to notfound handler
        var chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //construct the data object to send to the handler
        var data = {
            "trimmedPath" : trimmedPath,
            "queryStringObject" : queryStringObject,
            "method":method,
            "headers":headers,
            "payload":buffer
        }

        //route the request specified in the router
        chooseHandler(data,function(statusCode,payload){

            //use the status code called back by the handler, or use the default status code 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            //use the payload called back by the handler, or use the payload as empty object
            payload = typeof(payload) == 'object'?payload:{};

            //convert the payload to a string
            var payloadString = JSON.stringify(payload);

            //return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    }); 
};

//Define the handler
var handlers = {};

//Define ping handler
handlers.hello = function(data,callback){
    callback(200,{'msg' : 'Hello, Welcome to node js master class'});
};

//Not found handler
handlers.notFound = function(data,callback){
    callback(404);
};

//Define a request router
var router = {
    'hello' : handlers.hello
}
