'use strict';
const http = require('http');
const uri = require('url');
const fs = require('fs');
const path = require('path');
let mimes = {
  '.htm':'text/html',
  '.css':'text/css',
  '.js' : 'text/javascript',
  '.gif' : 'image/gif',
  '.jpg' : 'image/jpeg',
  '.png' : 'image/png',
}

function webserver(req, res){
 // if the route is requested is '/', then load 'index.htm' or else
 // load the requested file(s)

  let baseURI = url.parse(req.url);
  let filepath = __dirname + (baseURI.pathname === '/'? 'index.htm':baseURI.pathname);


  // check if the requested file is accessible or not
  fs.access(filepath, fs.F_OK, error=>{
      if(!error){
        // Resolve the content Type
        let contentType = mimes[path.extname(filepath)];//mimes['.css']=text/css

        // Read and Serve the file over the response
       res.writeHead(200, {'Content-type':contentType})
       res.end(content, 'utf-8');
        fs.readFile(filepath, (error, content)=>{
            if(!error){
               
            }else{
                // Serve a 500
                res.writeHead(500);
                res.end('the Server could not find the requested file')
            }
        })

      }else{
          // Serve a 404
          res.writeHead(404);
          res.end('Content Not Found!');
      }
  })
}

http.createServer(webserver).listen(3000, ()=>{
    console.log("Web Server running on port 3000");
})