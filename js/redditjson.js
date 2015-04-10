$(function(){

    var donehtml = "";
    var path = ""
    var comments = [];
    var total_comment_karma = 0;

    $('#nameform').on('submit', function(event){
        event.preventDefault();
        $('#content').html('<center><img src="img/loader.gif" alt="loading..."></center>');
    
        var name = $('#s').val();
        var requrl = "http://www.reddit.com/user/";
        
        path = requrl + name + "/submitted";

        getCommentKarma(name);
        
        jsonRecursive("");
        

        
    }); // end .on(submit) listener

    function getCommentKarma(name){

        var req = $.ajax({
            url : "http://www.reddit.com/user/"+name+"/about.json",
            dataType : "json",
            timeout : 5000,
        });

        req.success(function(json){
            alert("karma: "+json.data.comment_karma);
            total_comment_karma = json.data.comment_karma;
        });

        req.error(function(){
            alert("user not found");
        });
    }
  
    function htmlOutput(html) {
    
        $('#content').html(html);
    }

    function htmlAppend(html) {
    
        donehtml += html;
    }

    function process(){
        for (var i = comments.length - 1; i >= 0; i--) {
            console.log(comments[i].score + "  " + comments[i].body);
        }

            var data = [];
            var unique_subs = [];

            for (var i = comments.length - 1; i >= 0; i--) {
                var sub = comments[i].subreddit;
                var score = comments[i].score;
                if(unique_subs.indexOf(sub) == -1){
                        unique_subs.push(sub);
                }
                data.push({name: sub, value: score});
            };

            var low_scorers = [];
            for (var i = unique_subs.length - 1; i >= 0; i--) {

                var sum = 0;

                for (var j = data.length - 1; j >= 0; j--) {
                    if(data[j].name == unique_subs[i]){
                        sum += data[j].value;
                    }
                }

                if(sum < 0.005 * total_comment_karma){
                    low_scorers.push(unique_subs[i]);
                }

            }

            var others_score = 0;
            for (var i = data.length - 1; i >= 0; i--) {
                if(low_scorers.indexOf(data[i].name) > -1){
                    others_score += data[i].value;
                    console.log(data[i].name);
                    data.splice(i, 1);
                }
            }
            data.push({name: "others", value:others_score});

            htmlOutput("");
            
            var margin = {top: 50, right: 30, bottom: 40, left: 40},
                width = 800 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var x = d3.scale.ordinal()
                .domain(data.map(function(d) { return d.name; }))
                .rangeRoundBands([0, width], .1);

            var y = d3.scale.linear()
                .domain([0, d3.max(data, function(d) { return d.value; })])
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var chart = d3.select(".chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Add data
            chart.selectAll(".bar")
                  .data(data)
                  .enter()
                  .append("rect")
                  .attr("class", "bar")
                  .attr("x", function(d) { return x(d.name); })
                  .attr("y", function(d) { return y(d.value); })
                  .attr("height", function(d) { return height - y(d.value); })
                  .attr("width", x.rangeBand());

            // y axis and label
            chart.append("g")
                .attr("class", "y axis")
                .call(yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height/2)
                .attr("y", -margin.bottom)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Karma");
            // x axis and label
            chart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
              .append("text")
                .attr("x", width / 2)
                .attr("y", margin.bottom - 10)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Subreddit");
            // chart title
            chart.append("text")
              .text("Comment Karma per Subreddit")
              .attr("x", width / 2)
              .attr("class","title");
    }

    function jsonRecursive(info) {
        console.log(path+".json?count=25&after="+info);

        var html = "";
        var failed = false;

        var req = $.ajax({
            url : path+".json?count=25&after="+info,
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
                  comments.push(obj);
                }

                html =  myHTML;
                
                console.log(path+".json?count=25&after="+info + " done, requesting next...");

                setTimeout(function(){
                    console.log(json.data.after);
                    if(json.data.after == null){
                        console.log("end");
                        process();
                        //htmlOutput(donehtml);
                    }else{
                        jsonRecursive(json.data.after);
                    }
                    
                }, 10);
        });
        



            req.error(function() {
                alert("error, user not found");
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