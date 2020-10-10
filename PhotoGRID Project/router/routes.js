'use strict';


module.exports = (express, app, formidable, fs, os, gm, knoxClient, mongoose,io) => {
    var Socket;
    io.on('connection', function(socket){
        Socket = socket;
    })
    
    var singleImage = new mongoose.Schema({
        filename:String,
        votes:Number
    })

    var singleImageModel = mongoose.model('singleImage', singleImage); 
    
    var router = express.Router();

router.get('/', function(req, res, next){
    res.render('index', {host:app.get('host')});
})

router.get('/upload', function(req, res, next){
    // File Upload
    function generateFilename(filename){
        var ext_regex = /(?:\.([^.]+))?$/;
        var ext = ext_regex.exec(filename)[1];
        var date = new Date().getTime();
        var charBank = "abcdefghijklmnopqrstuvwxyz";
        var fstring='';
        for(var i=0; i <15; i++){
            fstring +=charBank[parseInt(Math.random()*26)];
        }
        return (fstring += date +'.'+ext);
    }

    var tmpfile, newfile, fname;
    var newForm = new Formidable.IncomingForm();
    newForm.keepExtensions = true;
    newForm.parse(req, function(err, fields, files){
        tmpFile = files.upload.path;
        fname = generateFilename(files.upload.name);
        newfile = os.tmpDir() + '/' + fname;
        res.writeHead(200, {'Content-type':'text/plain'});
        res.end();
    })

    newForm.on('end', function(){
        fs.rename(tmpFile, newfile, function(){
            // Resize the image and upload this file into the S3 bucket
         gm(newfile).resize(300).write(newfile, function(){
             // upload to the server
             fs.readFile(newfile, function(err, buf){
                 var req = knoxClient.put(fname, {
                     'Content-Length': buf.length,
                     'Content-Type': 'image/jpeg'
                 })

                 req.on('response', function(res){
                     if(res.statusCode == 200){
                         // This means that the file is in the S3 Bucket!
                       var newImage = new singleImageModel({
                           filename:fname,
                           votes:0
                       }).save();
                       Socket.emit('status', {'msg':'Saved!!', 'delay':3000});
                       Socket.emit('doUpdate', {})

                       // Delete the Local File
                    fs.unlink(newfile, function(){
                        console.log("local file deleted");
                    })
                     }
                 })

                 req.end(buf);
             })
         })
        })
    router.get('/getimages', function(req, res, next){
        singleImageModel.find({},null, {sort:{votes:-1}} function(err, result){
            res.send(JSON.stringify(result))
        })
    })

    router.get('/voteup/:id', function(req, res, next){
       singleImageModel.findByIdAndUpdate(req.params.id, {$inc:{votes:1}}, function(err, result){
           res.send(200, {votes:result.votes});
       })
    })
    })
})

app.use('/', router);
}