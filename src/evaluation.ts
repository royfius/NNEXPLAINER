import * as d3 from "d3";
import {BLUE_COLOR} from "./playground";

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

    // discard 0, its -1 and 1
    if(AllLabels.indexOf(0) > -1){
        AllLabels.splice(AllLabels.indexOf(0), 1);
    }

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
export function plotConfusionMatrix(matrixData) {

    // set the dimensions and margins of the graph
    const margin = {top: 0, right: 20, bottom: 40, left: 20},
    width = 300 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    // Labels of row and columns
    Groups = [-1, 1],
    size = width/Groups.length,
    colorScale = d3.scale.linear<string>()
                .domain([1,100])
                .interpolate(d3.interpolateRgb)
                .range(["white", BLUE_COLOR])
                .clamp(true);

    let svg;

    //Read the data
    let flatData = [];
    for (let i = 0; i < matrixData.length; i++) {
        for (let j = 0; j < matrixData.length; j++) {
            flatData.push({
                x: i,
                y: j,
                v: matrixData[i][j]
            });
        }
    }
    const matrixDataExtent = d3.extent(flatData, (d) => d.v),
    cx = d3.scale.linear().domain([0, matrixDataExtent[1]]).range([0, width]).nice(),
    cxAxis = d3.svg.axis()
            .scale(cx)
            .orient("bottom")
            .tickFormat(d3.format("d"));
    
    colorScale.domain(cx.domain());
    
    if(!d3.select("#cm-map g").node()){
        // append the svg object to the body of the page
        svg = d3.select("#cm-map")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("left", `-${margin.left}px`)
            .style("position", "relative")
            .append("g")
            .attr("transform", `translate( ${margin.left}, ${margin.top})`);

        const xAxis = svg.append("g")
            .classed("axis", true)
            .attr("transform", `translate(${margin.left}, ${height})`);
        
        // Add X labels
        xAxis.selectAll('text')
            .data(Groups)
            .enter()
            .append('text')
            .attr({
                "y": 10,
                "x": (d, i) => i * size,
                "text-anchor": "middle",
                "transform": `translate(${size / 2}, 5)`
            })
            .text((d)=> d);

        const yAxis = svg.append("g")
        .classed("axis", true)
        .attr("transform", `translate(${width},0)`);
        
        // Add Y labels
        yAxis.selectAll('text')
            .data(Groups)
            .enter()
            .append('text')
            .attr({
                "x": 0,
                "y": (d, i) => i * size,
                "text-anchor": "start",
                "transform": `translate(10, ${size / 2})`
            })
            .text((d)=> d);

        // Add scale to the gradient color map.
        d3.select("#cm-colorscale")
            .attr("width", width + margin.left + margin.right)
            .style("left", `-${margin.left}px`)
            .style("position", "relative")
        .select("g.core")
        .attr("transform", `translate(${margin.left},0)`)
        .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0,10)")
            .call(cxAxis);

    }else{
        svg = d3.select("#cm-map g");
    }

    // Update color axis labels
    d3.select("#cm-colorscale g.core g.x.axis").call(cxAxis);

    const gRect = svg.selectAll("g.cm")
        .data(flatData);

    gRect.exit().remove();

    const gRectEnter = gRect.enter()
        .append("g")
        .classed("cm", true)
        .attr("transform", (d) => `translate(${d.x * size}, ${d.y * size})` );

    gRectEnter.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", size)
        .attr("height", size)
        .style("fill", (d) => colorScale(d.v) );
    
    gRectEnter.append("text")
        .attr("x", (d)=> size/2)
        .attr("y", (d)=> size/2)
        .text((d)=> d.v);

    gRect.select("rect")
        .style("fill", (d) => colorScale(d.v) );

    gRect.select("text")
        .attr("fill", (d) => d3.hsl(colorScale(d.v)).l > .6 ? "#000" : "#fff")
        .text((d)=> d.v)

}
