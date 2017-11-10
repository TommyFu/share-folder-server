'use strict';

const express = require('express');
const multer  = require('multer');
const http = require('http');
const path = require('path');
const config = require('./src/config.js');
const bodyParser = require('body-parser');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const mv = require('mv');

const FILE_TYPE = {
  FOLDER: 'folder',
  FILE: 'file',
};

let app = express();
app.set('port', config.port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname + '/public')));
console.log('Static file: ' + __dirname);

app.get('/file', function(req, res) {
  let subPath = '';
  if(req.query && req.query.path){
    subPath = req.query.path.trim();
  }

  let stat;
  try{
    stat = fs.statSync(path.join(config.publicFolder, subPath));
  } catch(ex){
    res.statusCode = 500;
    res.end(ex);
    return;
  }

  let files;
  if(stat.isFile()){
    res.download(path.join(config.publicFolder, subPath));
    return;
  }else if(stat.isDirectory()){
    try{
      files = fs.readdirSync(path.join(config.publicFolder, subPath));
    } catch(ex){
      res.statusCode = 500;
      res.end(ex);
      return ;
    }
    const ret = [];
    for(let i = 0; i < files.length; i++){
      try{
        stat = fs.statSync(path.join(config.publicFolder, subPath, files[i]));
      } catch(ex){
        continue;
      }
      let item = {
        path: path.join(subPath, files[i]),
        name: files[i],
        date: stat.ctime
      };
      if(stat.isDirectory()) {
        item.type = FILE_TYPE.FOLDER;
      }else if(stat.isFile){
        item.type = FILE_TYPE.FILE;
      }
      ret.push(item);
    }
    res.status(200);
    res.json(ret);
  }
});

app.post('/upload', upload.single('file'), function (req, res, next) {
  let fileInfo = req.file;
  let filePath = req.body.path || '\\';

  if(fileInfo){
    let src = fileInfo.path;
    let dest = path.join(config.publicFolder, filePath, fileInfo.originalname);
  
    mv(src, dest, function(err) {
      if(err){
        res.statusCode = 500;
        res.end(err);
        return;
      }
  
      res.status(200);
      res.json({});
      return;
    });
  }else{
    res.statusCode = 500;
    res.end('Upload Failed');
    return ;
  }
});

app.post('/createFolder', function(req, res) {
  let folderPath = req.body.path;
  let folderName = req.body.name;

  if(folderPath && folderName){
    let fullPath = path.join(config.publicFolder, folderPath, folderName);
    let exists = fs.existsSync(fullPath);
    if(!exists){
      fs.mkdir(fullPath, function(err){
        if(err){
          res.statusCode = 500;
          res.end(err);
          return;
        }
        res.status(200);
        res.json({});
        return;
      })
    }else{
      res.statusCode = 500;
      res.end('This folder is already existing.');
    }
  }else{
    res.statusCode = 500;
    res.end('Create folder failed');
  }

});

http.createServer(app).listen(app.get('port'), function() {
  console.log("Server listening on port " + app.get('port'));
});

module.exports = app;
