requirejs([], function() {
  'use strict';

  $(document).ready(function(){

    function getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]); return null;
    }

    var path = getUrlParam('path');
    var url = path ? ('/file?path=' + path) : '/file';

    $.ajax({ 
      url: url,
      success: function(res){
        if(res && res.length){
          var $ul = $($('.file-list > ul')[0]);
          for(var i = 0; i < res.length; i++){
            var curr = res[i];
            var $li = $(document.createElement('li'));
            $li.addClass('list-group-item');
            $ul.append($li);

            var $icon = $(document.createElement('span'));
            if(curr.type === 'folder'){
              $icon.addClass('oi oi-folder');
            }else{
              $icon.addClass('oi oi-file');
            }
            $icon.addClass('file-list-icon');
            $li.append($icon);

            var $a = $(document.createElement('a'));  
            $a.html(curr.name);
            $li.append($a);
            var p = path ? (path + '/') : '';
            if(curr.type === 'folder'){
              $a.attr('href', '/list.html?path=' + p + curr.path);
            }else{
              $a.attr('href', '/file?path=' + curr.path);
            }
          }

          $("#file-uploader-btn").on('click', function () {
            upload(path);
          });
  
          $("#file-uploader-selector").change(function () {
            $("#file-uploader-bar").css("width", 0);
          });
    
          function upload(path) {
            var xhrOnProgress = function (fn) {
                xhrOnProgress.onprogress = fn;
                return function () {
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
              xhr: xhrOnProgress(function (e) {
                var percent = e.loaded / e.total;
                $("#file-uploader-bar").css("width", (percent * 500));
              }),
              success: function (arg) {
                var redirectUrl = "list.html"; 
                if(path){
                  redirectUrl += "?path=" + path;
                }
                window.location.href = redirectUrl;
              },
              error: function (arg) {
                alert('Upload failed');
              }
            })
          }

        }
      }
    });

  });
});