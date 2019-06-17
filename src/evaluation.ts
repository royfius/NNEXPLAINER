import * as d3 from "d3";

export type ConfusionMatrix = {
    matrix: number[][],
    labels: number[],
    recall: number,
    precision: number
}

export function confusionMatrix(targetDataset, predictedValues):
ConfusionMatrix {
    let trueLabels = [];
    let predictedLabels = [];

    const parseValue = (v) => {
        if (v > 0) return 1;
        else if (v == 0) return 0;
        else return -1;
    };

    for (let i = 0; i < targetDataset.length; i++) {
        trueLabels.push(parseValue(targetDataset[i].label));
        predictedLabels.push(parseValue(predictedValues[i]));
    }



    let confusion = createConfusionMatrix(trueLabels, predictedLabels);

    return confusion;
}

// ripped off from npm's ml-confusion-matrix module;
function createConfusionMatrix(trueLabels, predictedLabels): ConfusionMatrix {

    // Unable to use Set here. Will do manually,
    // Who wonrders upgrading to ES6 will break everything?
    const distinct = (value, index, self) => {
        return self.indexOf(value) === index;
    };
    let AllLabels = trueLabels.concat(predictedLabels);

    AllLabels = AllLabels.filter(distinct);

    AllLabels = AllLabels.sort();

    // Also making our own ES6's Array.fill(0);
    const fill = (arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = 0;
            }
    };

    let matrix = new Array(AllLabels.length);


    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(AllLabels.length);
        fill(matrix[i]);
    }


    for (let i = 0; i < predictedLabels.length; i++) {
        const actualIdx = AllLabels.indexOf(trueLabels[i]);
        const predictedIdx = AllLabels.indexOf(predictedLabels[i]);
        if (actualIdx >= 0 && predictedIdx >= 0) {
            matrix[actualIdx][predictedIdx]++;
        }
    }

    // p values as in "tp" will be values of 1, while n values are -1;
    let p_index = AllLabels.indexOf(1);
    let n_index = AllLabels.indexOf(-1);

    let recall = matrix[p_index][p_index] / (matrix[p_index][p_index] + matrix[n_index][p_index]);
    let precision = matrix[p_index][p_index] / (matrix[p_index][p_index] + matrix[p_index][n_index]);

    let mat: ConfusionMatrix = {
        matrix: matrix,
        labels: AllLabels,
        recall: recall,
        precision: precision

    };
    return mat;
}

// Temporary matrix "PLOT";
export function textPlot(matrix): string {
    let output = "";

    for (let i = 0; i < matrix.matrix.length; i++) {
        for (let j = 0; j < matrix.matrix.length; j++) {
            output += matrix.matrix[i][j].toString() + "\t";
        }
        output += "<br>";
    }

    return output;
}

// NOT FUNCTIONAL YET.
function plotConfusionMatrix() {

    // set the dimensions and margins of the graph
    let margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    let svg = d3.select("#confusionTest")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Labels of row and columns
    // let Groups = ["-1", "0", "1"];
    let Groups = [-1, 0, 1];

    // Build X scales and axis:
    // tfplayground uses d3 v3.5 !!!;
    let xScale = d3.scale.linear()
        .domain(Groups)
        .range([ 0 , width]);

    let yScale = d3.scale.linear()
        .domain(Groups)
        .range([height, 0]);

    let xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    let yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
    /*
let x = d3s.scaleBand()
        .range([ 0, width ])
        .domain(Groups)
        .padding(0.01);

svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3s.axisBottom(x))

// Build X scales and axis:
var y = d3s.scaleBand()
        .range([ height, 0 ])
        .domain(Groups)
        .padding(0.01);

svg.append("g")
  .call(d3.axisLeft(y));
    // Build color scale

var myColor = d3s.scaleLinear()
  .range(["white", "#69b3a2"])
  .domain([1,100])

    */
//Read the data


}
/*
function updateData(svg, data) {

    svg.selectAll()
        .data(data, function(d) {return d.group+':'+d.variable;})
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.group) })
        .attr("y", function(d) { return y(d.variable) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d.value)} )

}
*/
