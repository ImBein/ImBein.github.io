(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ?
      factory(exports) :
      typeof define === 'function' && define.amd ?
      define(['exports'], factory) :
      (factory((global.d3 = global.d3 || {})));
}(this, function(exports) {
  'use strict';

  // SCALES USED TO INVERT COURT Y COORDS AND MAP SHOOTING PERCENTAGES OF BINS
  // TO A FILL COLOR
  var yScale = d3.scale.linear().domain([0, 47]).rangeRound([47, 0]);

  function court() {
    // NBA court dimensions are 50ft sideline to sideline and 94feet baseline to
    // baseline (47ft half court)
    // Forcing at least a 500x470 ratio for the court in order to paint shots
    // appropriately
    var width = 500, height = .94 * width;

    function court(selection) {
      selection.each(function(data) {
        // Responsive container for the shot-chart
        d3.select(this).style("max-width", width / 16 + "em");
        // Select the SVG if it exists
        if (!d3.select(this).selectAll("svg").empty()) {
          var svg = d3.select(this).selectAll("svg");
        } else {
          var svg = d3.select(this)
                        .append("svg")
                        .attr("viewBox", "0, 0, " + 50 + ", " + 47 + "")
                        .classed("court", true);
          // Append the outer paint rectangle
          svg.append("g")
              .classed("court-paint", true)
              .append("rect")
              .attr("width", 16)
              .attr("height", 19)
              .attr("x", 25)
              .attr("transform", "translate(" + -8 + "," + 0 + ")")
              .attr("y", yScale(19))
              .attr("stroke", "black")
              .attr("fill", "none");
          // Append inner paint lines
          svg.append("g")
              .classed("inner-court-paint", true)
              .append("line")
              .attr("x1", 19)
              .attr("x2", 19)
              .attr("y1", yScale(19))
              .attr("y2", yScale(0))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          svg.append("g")
              .classed("inner-court-paint", true)
              .append("line")
              .attr("x1", 31)
              .attr("x2", 31)
              .attr("y1", yScale(19))
              .attr("y2", yScale(0))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          // Append foul circle
          // Add clipPaths w/ rectangles to make the 2 semi-circles with our
          // desired styles
          var dashedFoulCircle =
              svg.append("g").classed("foul-circle dashed", true);
          dashedFoulCircle.append("defs")
              .append("clipPath")
              .attr("id", "cut-off-top")
              .append("rect")
              .attr("width", 12)
              .attr("height", 6)
              .attr("x", 25)
              .attr("y", yScale(19))  // 47-19 (top of rectangle is pinned to
                                      // foul line, which is at 19 ft)
              .attr("transform", "translate(" + -6 + "," + 0 + ")");
          dashedFoulCircle.append("circle")
              .attr("cx", 25)
              .attr("cy", yScale(19))  // 47-19
              .attr("r", 6)
              .attr("stroke-dasharray", 1 + "," + 1)
              .attr("clip-path", "url(#cut-off-top)")
              .attr("fill", 'none')
              .attr("stroke", "black");
          var solidFoulCircle =
              svg.append("g").classed("foul-circle solid", true);
          solidFoulCircle.append("defs")
              .append("clipPath")
              .attr("id", "cut-off-bottom")
              .append("rect")
              .attr("width", 12)
              .attr("height", 6)
              .attr("x", 25)
              .attr("y", yScale(19)) /*foul line is 19 feet, then transform by 6
                                        feet (circle radius) to pin rectangle
                                        above foul line..clip paths only render
                                        the parts of the circle that are in the
                                        rectangle path */
              .attr("transform", "translate(" + -6 + "," + -6 + ")")
              .attr("stroke", "black")
              .attr("fill", "none");
          solidFoulCircle.append("circle")
              .attr("cx", 25)
              .attr("cy", yScale(19))
              .attr("r", 6)
              .attr("clip-path", "url(#cut-off-bottom)")
              .attr("fill", 'none')
              .attr("stroke", "black");
          // Add backboard and rim
          svg.append("g")
              .classed("backboard", true)
              .append("line")
              .attr("x1", 22)
              .attr("x2", 28)
              .attr("y1", yScale(4))  // 47-4
              .attr("y2", yScale(4))  // 47-4
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          svg.append("g")
              .classed("rim", true)
              .append("circle")
              .attr("cx", 25)
              .attr("cy", yScale(4.75))  // 47-4.75 need to set center point of
                                         // circle to be 'r' above backboard
              .attr("r", .75)            // regulation rim is 18 inches
              .attr("fill", 'none')
              .attr("stroke", "black");
          // Add restricted area -- a 4ft radius circle from the center of the
          // rim
          var restrictedArea = svg.append("g").classed("restricted-area", true);
          restrictedArea.append("defs")
              .append("clipPath")
              .attr("id", "restricted-cut-off")
              .append("rect")
              .attr("width", 8)   // width is 2r of the circle it's cutting off
              .attr("height", 4)  // height is 1r of the circle it's cutting off
              .attr("x", 25)      // center rectangle
              .attr("y", yScale(4.75))
              .attr("transform", "translate(" + -4 + "," + -4 + ")")
              .attr("stroke", "black")
              .attr("fill", "none");
          restrictedArea.append("circle")
              .attr("cx", 25)
              .attr("cy", yScale(4.75))
              .attr("r", 4)
              .attr("clip-path", "url(#restricted-cut-off)")
              .attr("fill", 'none')
              .attr("stroke", "black");
          /*
                    // Add Half Court
                    svg.append("g")
                        .classed("half-court", true)
                        .append("rect")
                        .attr("width", 50)
                        .attr("height", 47)
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("stroke", "black")
                        .attr("fill", "none")
                        .attr("stroke-width", 0.5);*/

          // Add 3 point arc
          var threePointArea =
              svg.append("g").classed("three-point-area", true);
          threePointArea.append("defs")
              .append("clipPath")
              .attr("id", "three-point-cut-off")
              .append("rect")
              .attr("width", 44)
              .attr("height", 23.75)
              .attr("x", 25)
              .attr("y", yScale(4.75))  // put recentagle at center point of
                                        // circle then translate by the inverse
                                        // of the circle radius to cut off top
                                        // half
              .attr("transform", "translate(" + -22 + "," + -23.75 + ")")
              .attr("stroke", "black")
              .attr("fill", "none");
          threePointArea.append("circle")
              .attr("cx", 25)
              .attr("cy", yScale(4.75))
              .attr("r", 23.75)
              .attr("clip-path", "url(#three-point-cut-off)")
              .attr("fill", 'none')
              .attr("stroke", "black");
          threePointArea.append("line")
              .attr("x1", 3)
              .attr("x2", 3)
              .attr("y1", yScale(14))
              .attr("y2", yScale(0))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          threePointArea.append("line")
              .attr("x1", 47)
              .attr("x2", 47)
              .attr("y1", yScale(14))
              .attr("y2", yScale(0))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          // Add key lines
          var keyLines = svg.append("g").classed("key-lines", true);
          keyLines.append("line")
              .attr("x1", 16)
              .attr("x2", 17)
              .attr("y1", yScale(7))
              .attr("y2", yScale(7))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          keyLines.append("line")
              .attr("x1", 16)
              .attr("x2", 17)
              .attr("y1", yScale(8))
              .attr("y2", yScale(8))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          keyLines.append("line")
              .attr("x1", 16)
              .attr("x2", 17)
              .attr("y1", yScale(11))
              .attr("y2", yScale(11))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          keyLines.append("line")
              .attr("x1", 16)
              .attr("x2", 17)
              .attr("y1", yScale(14))
              .attr("y2", yScale(14))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          keyLines.append("line")
              .attr("x1", 33)
              .attr("x2", 34)
              .attr("y1", yScale(7))
              .attr("y2", yScale(7))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          keyLines.append("line")
              .attr("x1", 33)
              .attr("x2", 34)
              .attr("y1", yScale(8))
              .attr("y2", yScale(8))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          keyLines.append("line")
              .attr("x1", 33)
              .attr("x2", 34)
              .attr("y1", yScale(11))
              .attr("y2", yScale(11))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          keyLines.append("line")
              .attr("x1", 33)
              .attr("x2", 34)
              .attr("y1", yScale(14))
              .attr("y2", yScale(14))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);
          // Append baseline
          svg.append("g")
              .classed("court-baseline", true)
              .append("line")
              .attr("x1", 0)
              .attr("x2", 50)
              .attr("y1", yScale(0))
              .attr("y2", yScale(0))
              .attr("stroke", "black")
              .attr("fill", "none")
              .attr("width", 1);

          svg.append("g").classed("shots", true);
        };
      });
    };

    court.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      height = .94 * _;
      return court;
    };

    return court;
  };

  var activeDisplay = "scatter";
  var activeTheme = "day";
  // SCALES USED TO INVERT COURT Y COORDS AND MAP SHOOTING PERCENTAGES OF BINS
  // TO A FILL COLOR
  var yScale$1 = d3.scale.linear().domain([0, 47]).rangeRound([47, 0]);
  var percentFormatter = d3.format(".1%");

  function shots() {
    var hexRadiusValues = [0.6, 0.9, 1.2], hexMinShotThreshold = 1,
        heatScale = d3.scale.quantize().domain([0, 1]).range(
            ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"]),
        //            ['#5458A2', '#6689BB', '#FADC97', '#F08460', '#B02B48']),
        hexRadiusScale, toolTips = true,
        hexbin = d3.hexbin()
                     .radius(1.2)
                     .x(function(d) {
                       return d.key[0];
                     })  // accessing the x, y coords from the nested json key
                     .y(function(d) { return yScale$1(d.key[1]); });

    var _nestShotsByLocation = function(data) {
      var nestedData =
          d3.nest()
              .key(function(d) {
                return [d.x, d.y];
              })
              .rollup(function(v) {
                return {
                  "made": d3.sum(v, function(d) { return d.shot_made_flag }),
                      "attempts": v.length,
                      "shootingPercentage": d3.sum(v, function(d) {
                        return d.shot_made_flag
                      }) / v.length
                }
              })
              .entries(data);
      // change to use a string split and force cast to int
      nestedData.forEach(function(a) {
        a.key = JSON.parse("[" + a.key + "]");
      });

      return nestedData;
    };

    var _getHexBinShootingStats = function(data, index) {

      var attempts = d3.sum(data, function(d) { return d.values.attempts; });
      var makes = d3.sum(data, function(d) { return d.values.made; })
                      var shootingPercentage = makes / attempts;
      data.shootingPercentage = shootingPercentage;
      data.attempts = attempts;
      data.makes = makes;
      return data;
    };


    function shots(selection) {
      selection.each(function(data) {

        var shotsGroup = d3.select(this).select("svg").select(".shots"),
            legends = d3.select(this).select("#legends"),
            nestedData = _nestShotsByLocation(data),
            hexBinCoords = hexbin(nestedData).map(_getHexBinShootingStats);

        if (activeDisplay === "scatter") {
          if (legends.empty() === false) {
            legends.remove();
          }

          var shots = shotsGroup.selectAll(".shot").data(data, function(d) {
            return [d.x, d.y];
          });
          shots.exit()
              .transition()
              .duration(700)
              .attr("r", 0)
              .attr("d", hexbin.hexagon(0))
              .remove();

          if (toolTips) {
            var tool_tip = d3.tip()
                               .attr("class", "d3-tip")
                               .offset([-8, -10])
                               .html(function(d) {
                                 return d.shot_distance + "' " + d.action_type;
                               });

            shotsGroup.call(tool_tip);
          }

          shots.enter()
              .append("circle")
              .classed("shot", true)
              .classed(
                  "make",
                  function(d) {
                    return d.shot_made_flag === 1;  // used to set fill color to
                                                    // green if it's a made shot
                  })
              .classed(
                  "miss",
                  function(d) {
                    return d.shot_made_flag ===
                        0;  // used to set fill color to red if it's a miss
                  })
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return yScale$1(d.y); })
              .attr("r", 0)
              .on('mouseover',
                  function(d) {
                    if (toolTips) {
                      tool_tip.show(d);
                    }
                  })
              .on('mouseout',
                  function(d) {
                    if (toolTips) {
                      tool_tip.hide(d);
                    }
                  })
              .transition()
              .duration(700)
              .attr("r", .5);

        } else if (activeDisplay === "hexbin") {
          var hexbin_list = [];
          for (var i = 0, l = hexBinCoords.length; i < l; i++) {
            if (hexBinCoords[i].attempts > 0 &&
                hexbin_list.indexOf(hexBinCoords[i].attempts) == -1)
              hexbin_list.push(hexBinCoords[i].attempts);
          }
          hexbin_list.sort();
          hexRadiusScale =
              d3.scale.quantile().domain(hexbin_list).range(hexRadiusValues);
          var shots =
              shotsGroup.selectAll(".shot").data(hexBinCoords, function(d) {
                return [d.x, d.y];
              });

          shots.exit()
              .transition()
              .duration(700)
              .attr("r", 0)
              .attr("d", hexbin.hexagon(0))
              .remove();

          if (toolTips) {
            var tool_tip =
                d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-8, 80])
                    .html(function(d) {
                      return "<prop>Distance:</prop><num_prop>~" +
                          Math.sqrt(
                                  Math.pow((d.x - 25), 2) +
                                  Math.pow((d.y - 42.25), 2))
                              .toFixed(1) +
                          " ft</num_prop>" +
                          "<prop>Field Goal %:</prop><num_prop>" +
                          percentFormatter(d.shootingPercentage) +
                          "</num_prop><prop>Shots: \ \ \  </prop><num_prop>" +
                          d.makes + "/" + d.attempts + "</num_prop>";
                    });

            shotsGroup.call(tool_tip);
          }

          shots.enter()
              .append("path")
              .classed("shot", true)
              .attr(
                  "transform",
                  function(d) { return "translate(" + d.x + "," + d.y + ")"; })
              .attr("d", hexbin.hexagon(0))
              .on('mouseover',
                  function(d) {
                    //  d3.select(this).transition().duration(50).attr('d',
                    //  hexbin.hexagon(1.3));

                    if (toolTips) {
                      tool_tip.show(d);
                    }
                  })
              .on('mouseout',
                  function(d) {
                    if (toolTips) {
                      // d3.select(this).transition().duration(50).attr('d',
                      // hexbin.hexagon(hexRadiusScale(d.attempts)));
                      tool_tip.hide(d);
                    }
                  })
              .style("fill", "none");

          shots.transition()
              .duration(700)
              .attr(
                  "d",
                  function(d) {
                    if (d.attempts >= 1) {
                      return hexbin.hexagon(hexRadiusScale(d.attempts));
                    }
                  })
              .style(
                  "fill",
                  function(d) { return heatScale(d.shootingPercentage); })
              .attr("opacity", 0.9);

          // CHANGE TO USE SELECTION.EMPTY()
          if (legends.empty() === true) {
            var legendSVG = d3.select(this)
                                .append('svg')
                                .attr("viewBox", "0, 0, " + 50 + ", " + 10 + "")
                                .attr('id', 'legends'),
                efficiencyLegend =
                    legendSVG.append('g').classed('legend', true),
                frequencyLegend = legendSVG.append('g')
                                      .classed('legend', true)
                                      .classed('frequency', true),
                frequencyLegendXStart = 7;

            efficiencyLegend.append("text")
                .classed('legend-text', true)
                .attr("x", 40)
                .attr("y", 5)
                .attr("text-anchor", "middle")
                .text("Field Goal %")
                .attr("font-size", "0.1em");
            efficiencyLegend.append("text")
                .classed("legend-text", true)
                .attr("x", 34.25)
                .attr("y", 2.5)
                .attr("text-anchor", "end")
                .text("0%")
                .attr("font-size", "0.1em");
            efficiencyLegend.append("text")
                .classed("legend-text", true)
                .attr("x", 45.75)
                .attr("y", 2.5)
                .attr("text-anchor", "start")
                .text("100%")
                .attr("font-size", "0.1em");
            efficiencyLegend.selectAll('path')
                .data(heatScale.range())
                .enter()
                .append('path')
                .attr(
                    "transform",
                    function(d, i) {
                      return "translate(" + (35 + ((1 + i * 2) * 1)) + ", " +
                          2 + ")";
                    })
                .attr('d', hexbin.hexagon(0))
                .transition()
                .duration(700)
                .attr('d', hexbin.hexagon(1))
                .style('fill', function(d) { return d; })
                .attr("opacity", 0.9);
            efficiencyLegend.selectAll("text").style("fill", function() {
              if (activeTheme === "night") {
                return "white";
              } else if (activeTheme === "day") {
                return "black";
              };
            });

            frequencyLegend.append("text")
                .classed('legend-text', true)
                .attr("x", 10.25)
                .attr("y", 5)
                .attr("text-anchor", "middle")
                .text("Frequency")
                .attr("font-size", "0.1em");
            frequencyLegend.append("text")
                .classed("legend-text", true)
                .attr("x", 6.25)
                .attr("y", 2.5)
                .attr("text-anchor", "end")
                .text("low")
                .attr("font-size", "0.1em");
            frequencyLegend.selectAll('path')
                .data(hexRadiusValues)
                .enter()
                .append('path')
                .attr(
                    "transform",
                    function(d, i) {
                      frequencyLegendXStart += d * 2;
                      return "translate(" + (frequencyLegendXStart - d) + ", " +
                          2 + ")";
                    })
                .attr('d', hexbin.hexagon(0))
                .transition()
                .duration(700)
                .attr('d', function(d) { return hexbin.hexagon(d); })
                    frequencyLegend.append("text")
                .classed("legend-text", true)
                .attr("x", 13.75)
                .attr("y", 2.5)
                .attr("text-anchor", "start")
                .text("high")
                .attr("font-size", "0.1em");

            frequencyLegend.selectAll("text").style("fill", function() {
              if (activeTheme === "night") {
                return "white";
              } else if (activeTheme === "day") {
                return "black";
              };
            });
            frequencyLegend.selectAll("path").style("fill", function() {
              if (activeTheme === "night") {
                return "none";
              } else if (activeTheme === "day") {
                return "grey";
              };
            });
          };
        };
      });
    };

    shots.displayType = function(_) {
      if (!arguments.length) return activeDisplay;
      activeDisplay = _;
      return shots;
    };

    shots.shotRenderThreshold = function(_) {
      if (!arguments.length) return hexMinShotThreshold;
      hexMinShotThreshold = _;
      return shots;
    };

    shots.displayToolTips = function(_) {
      if (!arguments.length) return toolTips;
      toolTips = _;
      return shots;
    };

    return shots;
  };

  exports.court = court;
  exports.shots = shots;

  Object.defineProperty(exports, '__esModule', {value: true});

}));