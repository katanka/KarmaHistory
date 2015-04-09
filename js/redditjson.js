$(function(){

    var donehtml = "";

    $('#nameform').on('submit', function(event){
        event.preventDefault();
        $('#content').html('<center><img src="img/loader.gif" alt="loading..."></center>');
    
        var name = $('#s').val();
        var requrl = "http://www.reddit.com/user/";
        
        var fullurl = requrl + name + "/comments";

        jsonRecursive(fullurl);

        
    }); // end .on(submit) listener
  
    function htmlOutput(html) {
    
        $('#content').html(html);
    }

    function htmlAppend(html) {
    
        donehtml += html;
    }

    function jsonRecursive(path) {
        console.log(path);

        var html = "";
        var failed = false;

        var req = $.ajax({
            url : path+".json",
            dataType : "json",
            timeout : 5000
        });

        req.success(function(json) {
            var listing = json.data.children;
            
                var myHTML = "";

                for(var i=0, l=listing.length; i<l; i++) {
                  var obj = listing[i].data;
               
                  var votes     = obj.score;
                  var body     = obj.body;
                  myHTML += body + "<br>";
                  console.log(body);
                }

                html =  myHTML;
                
                donehtml += "<br>---------------<br>"+myHTML;
                console.log(path + " done");

                setTimeout(function(){
                    jsonRecursive(path + "/after");
                }, 100);
        });
        



            req.error(function() {
                setTimeout(function(){
                    console.log("done");
                    htmlOutput(donehtml);

                }, 100);
            });

    }
  
  /**
   * Return time since link was posted
   * http://stackoverflow.com/a/3177838/477958
  **/
  function timeSince(date) {
    var seconds = Math.floor(((new Date().getTime()/1000) - date))

    var interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
      if(interval == 1) return interval + " year ago";
      else 
        return interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      if(interval == 1) return interval + " month ago";
      else
        return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      if(interval == 1) return interval + " day ago";
      else
        return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      if(interval == 1) return interval + " hour ago";
      else
        return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      if(interval == 1) return interval + " minute ago";
      else
        return interval + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }
});