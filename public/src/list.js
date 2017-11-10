requirejs([], function() {
  'use strict';

  function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
  }

  function buildList(res){
    var $ul = $($('.file-list > ul')[0]);
    for(var i = 0; i < res.length; i++){
      var curr = res[i];
      var $li = $(document.createElement('li'));
      $li.addClass('list-group-item');
      $ul.append($li);

      var $icon = $(document.createElement('span'));
      if(curr.type === 'folder'){
        $icon.addClass('oi oi-folder file-list-folder');
      }else{
        $icon.addClass('oi oi-file file-list-file');
      }
      $icon.addClass('file-list-icon');
      $li.append($icon);

      var $a = $(document.createElement('a'));  
      $a.html(curr.name);
      $li.append($a);
      if(curr.type === 'folder'){
        $a.attr('href', '/list.html?path=' + curr.path);
      }else{
        $a.attr('href', '/file?path=' + curr.path);
      }
    }
  }

  function refresh(path){
    var redirectUrl = "list.html"; 
    if(path){
      redirectUrl += "?path=" + path;
    }
    window.location.href = redirectUrl;
  }

  function createFolder(path){
    var folderName = $("#file-folder-name").val().trim();
    var data = {
      path: path ? path : '/',
      name: folderName
    };
    var dataStr = '';
    try{
      dataStr =JSON.stringify(data);
    }catch(ex){}
    $.ajax({
      type: 'POST',
      url: '/createFolder',
      data: dataStr,
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: function (arg) {
        refresh(path);
      },
      error: function (arg) {
        if(arg.responseText){
          alert(arg.responseText);
        }else{
          alert('Create folder failed');
        }
      }
    });
  }

  function upload(path){
    var xhrOnProgress = function(cb) {
        xhrOnProgress.onprogress = cb;
        return function() {
          var xhr = $.ajaxSettings.xhr();
          if (xhrOnProgress.onprogress 
            && typeof xhrOnProgress.onprogress === 'function'
            && xhr.upload) {
              xhr.upload.onprogress = xhrOnProgress.onprogress;
          }
          return xhr;
        }
    }

    var file = $("#file-uploader-selector")[0].files[0];
    var form = new FormData();
    form.append('file', file);
    form.append('path', path ? path : '/');
    $.ajax({
      type: 'POST',
      url: '/upload',
      data: form,
      processData: false,
      contentType: false,
      xhr: xhrOnProgress(function(e){
        var percent = e.loaded / e.total;
        $("#file-uploader-bar").css("width", percent * 100 + '%');
      }),
      success: function (arg) {
        refresh(path);
      },
      error: function (arg) {
        if(arg.responseText){
          alert(arg.responseText);
        }else{
          alert('Upload failed');
        }
      }
    });
  }

  $(document).ready(function(){
    var path = getUrlParam('path');
    var url = path ? ('/file?path=' + path) : '/file';

    $.ajax({ 
      url: url,
      success: function(res){
        if(res && res.length){
          buildList(res);
        }

        $("#file-folder-button").on('click', function (e) {
          e.preventDefault();
          var $folderName = $("#file-folder-name");
          if(!$folderName || $folderName.val().trim().length === 0){
            alert('Please input the folder name.');
            return;
          }
          createFolder(path);
        });

        $("#file-uploader-btn").on('click', function (e) {
          e.preventDefault();
          var $selector = $("#file-uploader-selector");
          if(!$selector[0] || !$selector[0].files
            || !$selector[0].files[0]){
            alert('Please select a file.');
            return;
          }
          upload(path);
        });

        $("#file-uploader-selector").change(function () {
          $("#file-uploader-bar").css('width', 0);
        });
      },
      error: function(e){
        alert('List folder failed');
      }
    });

  });
});