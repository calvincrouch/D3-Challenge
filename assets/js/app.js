var svgWidth = 800;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 60
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var on click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2])
        .range([0, width]);

    return xLinearScale;    
}

// Function used for updating y-scale var on click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;    
}

// Function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;    
}

// Function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var bottomYAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(bottomYAxis);

    return yAxis;    
}

// Function for updating circles with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;
    var yLabel = "Lacks Healthcare (%)";

    if (chosenXAxis === "poverty") {
        label = "In Poverty (%)";
    }
    else {
        label = "Age (Median)";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${label}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Function for updating circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
        

    return circlesGroup;    
}

// Function for updating states
function renderStates(stateGroup, newXScale, chosenXAxis) {
    stateGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));

    return stateGroup;    
}

// Retrieve data from .csv
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

    // parse data
    data.forEach(function(da) {
        da.poverty = +da.poverty;
        da.healthcare = +da.healthcare;
        da.age = +da.age;
        da.obese = +da.obese;
    });

    // xLinearScale function
    var xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[chosenYAxis])])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);
        
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .classed("stateCircle", true);

    // append initial state text
    var stateGroup = chartGroup.selectAll(null)
        .data(data)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .classed("stateText", true)
        .attr("font-size", 9);

    // create group for two x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
        
    var inPovertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .attr("font-weight", "bold")
        .classed("active", true)
        .text("In Poverty (%)");
        
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .attr("font-weight", "bold")
        .classed("inactive", true)
        .text("Age (Median)");

    // create group for y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    // create y-axis label
    var lacksHealthcare = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 17)
        .attr("x", 0 - (height / 2) - 5)
        .attr("dy", "1em")
        .attr("font-weight", "bold")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    // var obese = chartGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left + 0)
    //     .attr("x", 0 - (height / 2) - 5)
    //     .attr("dy", "1em")
    //     .attr("font-weight", "bold")
    //     .classed("inactive", true)
    //     .text("Obese (%)");

    // updateToolTip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    
    // event listener for x axis labels
    xLabelsGroup.selectAll("text")
        .on("click", function() {

            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                chosenXAxis = value;
                
                xLinearScale = xScale(data, chosenXAxis);

                xAxis = renderAxes(xLinearScale, xAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                stateGroup = renderStates(stateGroup, xLinearScale, chosenXAxis);

                // change class to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    // event listener for y axis labels
    // yLabelsGroup.selectAll("text")
    //     .on("click", function() {

    //         var yValue = d3.select(this).attr("yValue");
    //         if (yValue !== chosenYAxis) {

    //             chosenYAxis = yValue;
                
    //             yLinearScale = yScale(data, chosenYAxis);

    //             yAxis = renderYAxes(yLinearScale, yAxis);

    //             circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

    //             circlesGroup = updateYToolTip(chosenYAxis, circlesGroup);

    //             stateGroup = renderYStates(stateGroup, yLinearScale, chosenYAxis);

    //             // change class to change bold text
    //             if (chosenYAxis === "obese") {
    //                 obese
    //                     .classed("active", true)
    //                     .classed("inactive", false);
    //                 lacksHealthcare
    //                     .classed("active", false)
    //                     .classed("inactive", true);
    //             }
    //             else {
    //                 obese
    //                     .classed("active", false)
    //                     .classed("inactive", true);
    //                 lacksHealthcare
    //                     .classed("active", true)
    //                     .classed("inactive", false);
    //             }
    //         }
    //     });

}).catch(function(error) {
    console.log(error);
});