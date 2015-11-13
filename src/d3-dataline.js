(function () {
  'use strict';

  d3.dataline = function() {

    var hover = function () {};
    var click = function () {};
    var labelClick = function() {};
    var currentDomain = function () {};
    var width = null;
    var backgroundColor = "#5CB85C";
    var rowSeperatorsColor = "#FFFFFF";
    var itemColor = "#FF0000";
    var start = 1;
    var end = 1;
    var tickFormat = { 
      format: d3.format("d"),
      numTicks: 10
    };
    var ticksValues = [];
    var margin = {
      left: 150, 
      right:100, 
      top: 50, 
      bottom:50
    };
    var itemHeight = 20;
    var itemMargin = 2;
    var enableHairine = true;
    var inputData = [];
    var labelLeft = undefined;
    var labelRight = undefined;
    var hairlineDomain = 1;
    var hairline = undefined;
    var hairlineHandle = undefined;
    var xScale = undefined;
    var yScale = undefined;

    function dataline (parent) {
      
      var contentWidth = (width - margin.left - margin.right);
      var contentHeight = (inputData.length * itemHeight);
      var scaleFactor = (1/end) * contentWidth;
      var panExtent = {
        x: [0, end+1]
      };

      // scales
      xScale = d3.scale.linear()
        .domain([1, end+1])
        .range([0, contentWidth]);

      yScale = d3.scale.linear()
        .domain([0, inputData.length])
        .range([0, contentHeight]);

      var xticks = [];

      if(parseInt(tickFormat.numTicks) < (end+2)) {
        xticks = xScale.ticks(tickFormat.numTicks); 

        if(contentWidth < 600) {
          xticks = xticks.slice(0, xticks.length - 1);
        }

        var ticks = [1];
        ticks = ticks.concat(xticks);
        ticks = ticks.concat([end+1]);

        xticks = ticks;
      } else {
        for(var i = 1; i <= end+1; i++) {
          xticks.push(i);
        }
      }
      
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(d3.format("0d"))
        .tickValues(xticks);

      var drag = d3.behavior.drag()
        .origin(Object)
        .on("drag", dragmove);

      // clear data
      parent.select("svg").remove();
      
      // draw the chart
      var svg = parent
        .append("svg")
        .attr("width", width)
        .attr("height", contentHeight + margin.top + margin.bottom)
        .attr("class", "dataline-chart")

      var main = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("width", contentWidth)
        .attr("height", contentHeight)        
        .attr("class", "main");

      main
        .append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", contentWidth)
          .attr("height", contentHeight);

      // labels
      var label = svg.append("g")
        .attr("id", "labels")
        .attr("transform", "translate(0," + margin.top + ")")
        .attr("class", "labels");   
      
      // add lanes with background
      main
        .append("g")
          .attr("id", "lane_backgrounds")
        .selectAll(".lane-background")
        .data(inputData)
        .enter()
        .append("rect")
        .attr("x", xScale(1))
        .attr("y", function(d, i) {
          return yScale(i);
        })
        .attr("width", contentWidth)
        .attr("height", itemHeight)
        .attr("class", "lane-background")   
        
        .attr("fill", "#5CB85C");

      main.selectAll(".lane-background").each(function(data, lane_index) {

        main
          .append("g")
            .attr("id", "lane_datapoint_" + lane_index)
            .attr("class", "lane-datapoint")
            .attr("clip-path", "url(#clip)")
          .selectAll(".lane-datapoint")
          .data(data.Values)
          .enter()
          .append("rect")
          .attr("x", function(d) {
            return xScale(d)
          })
          .attr("y", function(d, i) {
            return yScale(lane_index) + 1;
          })
          .attr("width", scaleFactor)
          .attr("height", itemHeight - 2)
          .attr("class", "datapoint")   
          .attr("clip-path", "url(#clip)")
          .attr("fill", "#FF0000")
          .attr("stroke", "#FF0000")   
          .attr("stroke-linecap", "butt");

        // labels
        var lane_label = label.append("g")
          .attr("id", "lane_label_" + lane_index)
          .attr("transform", "translate(0," + lane_index * itemHeight + ")")
          .attr("class", "label");

        lane_label.append("rect")                  
          .attr("width", margin.left - 20)
          .attr("height", itemHeight-4)
          .attr("x", 5)
          .attr("y", 2)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("fill", "#B5B5B5")
          .on('click', function(){
            labelClick(data);
          });    

        lane_label.append("text")
          .text(data.Description)
          .attr("x", (margin.left / 2))
          .attr("y", itemHeight/2)
          .attr("dy", ".5ex")
          .attr("text-anchor", "middle")
          .attr("fill", "black")      
          .attr("class", "laneText")
          .on('click', function(){
            labelClick(data);
          }); 

        lane_label.append("line")
          .text(data.Index)
          .attr("x1", margin.left - 10)
          .attr("y1", itemHeight/2)
          .attr("x2", margin.left)
          .attr("y2", itemHeight/2)
          .attr("stroke", "#000000")
          .attr("stroke-width", 1);


        // scraprate
        var lane_scraprate = label.append("g")
          .attr("id", "lane_label_" + lane_index)
          .attr("transform", "translate(0," + lane_index * itemHeight + ")")
          .attr("class", "label");  

        lane_scraprate.append("text")
          .text(d3.format(".2f")(data.ScrapRate) + " %")
          .attr("x", (margin.left + contentWidth) + 10)
          .attr("y", itemHeight/2)
          .attr("dy", ".5ex")
          .attr("text-anchor", "left")
          .attr("fill", "black")      
          .attr("class", "laneText");
      });

      // draw the line between the bars
      main.append("g")
        .attr("id", "lane_seperators")
        .selectAll(".lane-seperator")
        .data(inputData)
        .enter().append("line")
        .attr("x1", xScale(1))
        .attr("y1", function(d, i) {
          return yScale(i);
        })
        .attr("x2", width)
        .attr("y2", function(d, i) {
          return yScale(i);
        })
        .attr("class", "lane-seperator")
        .attr("stroke", "white")

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + contentHeight) + ")")
        .attr("clip-path", "url(#clip_axis)")        
        .call(xAxis);

      // left restriction line
      svg.append("line")
        .attr("x1", margin.left)
        .attr("y1", margin.top - 45)
        .attr("x2", margin.left)
        .attr("y2", contentHeight + margin.top)
        .attr("stroke", "#000000")

      if(labelLeft !== undefined) {
        svg.append("text")
          .text(labelLeft)
          .attr("x", margin.left/2)
          .attr("y", margin.top - 35)
          .attr("dy", ".5ex")
          .attr("text-anchor", "right")
          .attr("fill", "black")      
          .attr("class", "laneText");
      }

      // right restriction line
      svg.append("line")
        .attr("x1", margin.left + contentWidth)
        .attr("y1", margin.top - 45)
        .attr("x2", margin.left + contentWidth)
        .attr("y2", contentHeight + margin.top)
        .attr("stroke", "#000000")
      
      
      if(labelRight !== undefined) {
        svg.append("text")
          .text("Scrap rate")
          .attr("x", (contentWidth + margin.left) + 10)
          .attr("y", margin.top - 35)
          .attr("dy", ".5ex")
          .attr("text-anchor", "left")
          .attr("fill", "black")      
          .attr("class", "laneText");
      }

      hairlineHandle = svg.append("rect")
        .data([{x: margin.left - 8, y: margin.top - 45}])
        .attr("id", "hairlineHandle")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", 17)
        .attr("height", 40)
        .attr("fill", "#1771B1")
        .attr("cursor", "move")
        .call(drag); 

      hairline = svg.append("rect")
        .data([{x: margin.left, y: margin.top/2}])
        .attr("id", "hairline")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", 1)
        .attr("height", (contentHeight + margin.top/2))
        .attr("fill", "#1771B1");

        function dragmove(d) {

        if(d3.event.x < margin.left) {
          x = margin.left;
        }
        else if(d3.event.x > (contentWidth + margin.left)) {
          x = (contentWidth + margin.left)
        } else {
          var x = d3.event.x
        }

        hairlineDomain = Math.floor(xScale.invert(x - margin.left))

        if(hairlineDomain > end) {
          hairlineDomain = end;
        }

        setTimeout(function(){ 
          currentDomain(hairlineDomain);
        }, 0);

        hairline.attr("x", d.x = x);
        hairlineHandle.attr("x", d.x = (x - 8));
      }
    }

    dataline.setCycle = function(cycle_nr) {
      if(cycle_nr >= 1 && cycle_nr <= end) {
        hairlineDomain = cycle_nr;
      } else if(cycle_nr < 1) {
        hairlineDomain = 1;
      } else {
        hairlineDomain = end;
      }

      var x = xScale(hairlineDomain) + margin.left;

      setTimeout(function(){ 
        currentDomain(hairlineDomain);
      }, 0);

      hairline.attr("x", x);
      hairlineHandle.attr("x", (x - 8));
    }

    dataline.next = function() {
      if((hairlineDomain + 1) <= end) {
        hairlineDomain++;
      }

      var x = xScale(hairlineDomain) + margin.left;

      setTimeout(function(){ 
        currentDomain(hairlineDomain);
      }, 0);

      hairline.attr("x", x);
      hairlineHandle.attr("x", (x - 8));
    }

    dataline.prev = function() {
      if((hairlineDomain - 1) >= 1) {
        hairlineDomain--;
      }

      var x = xScale(hairlineDomain) + margin.left;

      setTimeout(function(){ 
        currentDomain(hairlineDomain);
      }, 0);

      hairline.attr("x", x);
      hairlineHandle.attr("x", (x - 8));
    }

    // SETTINGS

    dataline.click = function (clickFunc) {
      if (!arguments.length) return click;
      click = clickFunc;
      return dataline;
    };

    dataline.labelClick = function (labelClickFunc) {
      if (!arguments.length) return labelClick;
      labelClick = labelClickFunc;
      return dataline;
    };

    dataline.currentDomain = function (currentDomainFunc) {
      if (!arguments.length) return currentDomain;
      currentDomain = currentDomainFunc;
      return dataline;
    };    

    dataline.margin = function (m) {
      if (!arguments.length) return margin;
      margin = m;
      return dataline;
    };

    dataline.itemHeight = function (ih) {
      if (!arguments.length) return itemHeight;
      itemHeight = ih;
      return dataline;
    };

    dataline.itemMargin = function (im) {
      if (!arguments.length) return itemMargin;
      itemMargin = im;
      return dataline;
    };

    dataline.height = function (h) {
      if (!arguments.length) return height;
      height = h;
      return timeline;
    };

    dataline.width = function (w) {
      if (!arguments.length) return width;
      width = w;
      return dataline;
    };

    dataline.start = function (s) {
      if (!arguments.length) return start;
      start = parseInt(s);
      return dataline;
    };

    dataline.end = function (e) {
      if (!arguments.length) return end;
      end = parseInt(e);
      return dataline;
    };    

    dataline.enableHairine = function (state) {
      if (!arguments.length) return enableHairine;
      enableHairine = state;
      return dataline;
    };

    dataline.labelLeft = function (lbl) {
      if (!arguments.length) return labelLeft;
      labelLeft = lbl;
      return dataline;
    };

    dataline.labelRight = function (lbl) {
      if (!arguments.length) return labelRight;
      labelRight = lbl;
      return dataline;
    }; 

    dataline.inputData = function (d) {
      if (!arguments.length) return inputData;
      inputData = d;
      return dataline;
    };  

    return dataline;
  };
})();
