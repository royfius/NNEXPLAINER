/* Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import * as nn from "./nn";
import {HeatMap, reduceMatrix} from "./heatmap";
import {
  State,
  datasets,
  regDatasets,
  activations,
  problems,
  regularizations,
  getKeyFromValue,
  Problem
} from "./state";

import {Example2D, shuffle} from "./dataset";
import {AppendingLineChart} from "./linechart";
import * as d3 from "d3";

import * as csvdataset from "./csvdataset";
import * as evaluation from "./evaluation";
import dialogPolyfill from 'dialog-polyfill'


let mainWidth;

// More scrolling
d3.select(".more button").on("click", function() {
  let position = 800;
  d3.transition()
    .duration(1000)
    .tween("scroll", scrollTween(position));
});

function scrollTween(offset) {
  return function() {
    let i = d3.interpolateNumber(window.pageYOffset ||
        document.documentElement.scrollTop, offset);
    return function(t) { scrollTo(0, i(t)); };
  };
}

const RECT_SIZE = 30;
const BIAS_SIZE = 5;
const NUM_SAMPLES_CLASSIFY = 500;
const NUM_SAMPLES_REGRESS = 1200;
const BLUE_COLOR = "#0877bd";
let DENSITY = 100;
let INPUT_DIM = 0;
export const MAX_INPUT :number = 16;

enum HoverType {
  BIAS, WEIGHT
}

interface InputFeature {
  f: (point: Example2D) => number;
  label?: string;
}

function loadFeatures(nbdim: number, headers: string[]):
{[name: string]: InputFeature} {

    let INPUTS = {};

    console.log("Headers: ", headers);
    for (let i = 0; i < nbdim; i++) {
        let inputName = "X_" + (i + 1).toString();
        let labelName = inputName;

        if (i < headers.length) {
            labelName = headers[i];
        }

        INPUTS[inputName] = {
            f: (dataset) => dataset.p[Number(i)],
            label: labelName
        };

        // turn them on @GUI by default;
        state[inputName] = true;
    }
    return INPUTS;
}

/*
let olddINPUTS: {[name: string]: InputFeature} = {
  "x": {f: (x, y) => x, label: "X_1"},
  "y": {f: (x, y) => y, label: "X_2"},
  "xSquared": {f: (x, y) => x * x, label: "X_1^2"},
  "ySquared": {f: (x, y) => y * y,  label: "X_2^2"},
  "xTimesY": {f: (x, y) => x * y, label: "X_1X_2"},
  "sinX": {f: (x, y) => Math.sin(x), label: "sin(X_1)"},
  "sinY": {f: (x, y) => Math.sin(y), label: "sin(X_2)"},
};

*/

let HIDABLE_CONTROLS = [
  ["Show test data", "showTestData"],
  ["Discretize output", "discretize"],
  ["Play button", "playButton"],
  ["Step button", "stepButton"],
  ["Reset button", "resetButton"],
  ["Learning rate", "learningRate"],
  ["Activation", "activation"],
  ["Regularization", "regularization"],
  ["Regularization rate", "regularizationRate"],
  ["Problem type", "problem"],
  ["Which dataset", "dataset"],
  ["Ratio train data", "percTrainData"],
  ["Noise level", "noise"],
  ["Batch size", "batchSize"],
  ["# of hidden layers", "numHiddenLayers"],
];

class Player {
  private timerIndex = 0;
  private isPlaying = false;
  private callback: (isPlaying: boolean) => void = null;

  /** Plays/pauses the player. */
  playOrPause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.pause();
    } else {
      this.isPlaying = true;
      if (iter === 0) {
        simulationStarted();
      }
      this.play();
    }
  }

  onPlayPause(callback: (isPlaying: boolean) => void) {
    this.callback = callback;
  }

  play() {
    this.pause();
    this.isPlaying = true;
    if (this.callback) {
      this.callback(this.isPlaying);
    }
    this.start(this.timerIndex);
  }

  pause() {
    this.timerIndex++;
    this.isPlaying = false;
    if (this.callback) {
      this.callback(this.isPlaying);
    }
  }

  private start(localTimerIndex: number) {
    d3.timer(() => {
      if (localTimerIndex < this.timerIndex) {
        return true;  // Done.
      }
      oneStep();
      return false;  // Not done.
    }, 0);
  }
}

let state = State.deserializeState();

let trainData: Example2D[] = [];
let testData: Example2D[] = [];
let network: nn.Node[][] = null;

let INPUTS = loadFeatures(3, []);
let CSV_SELECTED_COLUMNS: String[] = [];

// Filter out inputs that are hidden.
state.getHiddenProps().forEach(prop => {
  if (prop in INPUTS) {
    delete INPUTS[prop];
  }
});

let boundary: {[id: string]: number[][]} = {};
let selectedNodeId: string = null;
// Plot the heatmap.
let xDomain: [number, number] = [-6, 6];

function genHeatmap() {

return new HeatMap(300, DENSITY, xDomain, xDomain, d3.select("#heatmap"),
                   {showAxes: true});
}
let heatMap = genHeatmap();
let linkWidthScale = d3.scale.linear()
  .domain([0, 5])
  .range([1, 10])
  .clamp(true);
let colorScale = d3.scale.linear<string, number>()
                     .domain([-1, 0, 1])
                     .range(["#f59322", "#e8eaeb", BLUE_COLOR])
                     .clamp(true);
let iter = 0;
let lossTrain = 0;
let lossTest = 0;
let trainOutput = [];
let testOutput = [];

let player = new Player();
let selLineChart = d3.select("#linechart");
let lineChartNode = selLineChart.node() as HTMLElement;
let lineChart = new AppendingLineChart(selLineChart, lineChartNode.offsetWidth, lineChartNode.offsetHeight, ["#777", "black"]);

function makeGUI() {
  d3.select("#reset-button").on("click", () => {
    reset();
    userHasInteracted();
    d3.select("#play-pause-button");
  });

  d3.select("#play-pause-button").on("click", function () {
    // Change the button's content.
    userHasInteracted();
    player.playOrPause();
  });

  player.onPlayPause(isPlaying => {
    d3.select("#play-pause-button").classed("playing", isPlaying);
  });

  d3.select("#next-step-button").on("click", () => {
    player.pause();
    userHasInteracted();
    if (iter === 0) {
      simulationStarted();
    }
    oneStep();
  });

  d3.select("#data-regen-button").on("click", () => {
    generateData();
    parametersChanged = true;
  });

  let dataThumbnails = d3.selectAll("canvas[data-dataset]");
    dataThumbnails.on("click", function() {
        let newDataset = datasets[this.dataset.dataset];

        /* This used to disable clicking on selected dataset, overriden!
        if (newDataset === state.dataset) {
            return; // No-op.
        }
        */

        state.dataset = newDataset;
        dataThumbnails.classed("selected", false);
        d3.select(this).classed("selected", true);
        generateData();
        parametersChanged = true;
        reset();
    });

  let datasetKey = getKeyFromValue(datasets, state.dataset);
  // Select the dataset according to the current state.
  d3.select(`canvas[data-dataset=${datasetKey}]`)
    .classed("selected", true);

  let regDataThumbnails = d3.selectAll("canvas[data-regDataset]");
  regDataThumbnails.on("click", function() {
    
    const sDatasetType = this.dataset.regdataset,
    newDataset = regDatasets[sDatasetType],
    isSelected = d3.select(this).classed("selected");
    
    // Allow clicking on Load CSV dataset so that CSV files 
    // can be loaded multiple times
    if ( isSelected && sDatasetType != "csv" && newDataset === state.regDataset) {
      return; // No-op.
    }

    //state.regDataset = newDataset;
    regDataThumbnails.classed("selected", false);
    d3.select(this).classed("selected", true);

    // For User loaded CSV, do not generated any model yet.
    // It will be generated post the file is processed
    // Prompt the File selection dialog
    if( sDatasetType === "csv"){

      function _updateData(csvOutput: csvdataset.CSVDataset): void{
        // Update number of neurons
        state.networkShape[0] = constructInput(csvOutput.points[0]).length;
        updateData(csvOutput.header, csvOutput.points);
      }
      
      csvdataset.loadCSVFile()
        .then(function csvFileLoaded(oPayload: csvdataset.CallbackPayload){
          
          // 1. Open Attribute/Column selection dialog
          openCSVColumnSelectionDialog(oPayload.header)
            .then(function(aSelectedColumns){
              console.log('Columns selected dialog');
              // Process the dataset with selected headers
              _updateData(oPayload.callback(aSelectedColumns));
            })
            .catch(function(error){
              // Do Nothing
            });

        })
        .catch(_updateData);

    }else{

      state.regDataset = newDataset;
      generateData();
      parametersChanged = true;
      reset();

    }

  });

  let regDatasetKey = getKeyFromValue(regDatasets, state.regDataset);
  // Select the dataset according to the current state.
  d3.select(`canvas[data-regDataset=${regDatasetKey}]`)
    .classed("selected", true);

  d3.select("#add-layers").on("click", () => {
    if (state.numHiddenLayers >= 6) {
      return;
    }
    state.networkShape[state.numHiddenLayers] = 2;
    state.numHiddenLayers++;
    parametersChanged = true;
    reset();
  });

  d3.select("#remove-layers").on("click", () => {
    if (state.numHiddenLayers <= 0) {
      return;
    }
    state.numHiddenLayers--;
    state.networkShape.splice(state.numHiddenLayers);
    parametersChanged = true;
    reset();
  });

  let showTestData = d3.select("#show-test-data").on("change", function() {
    state.showTestData = this.checked;
    state.serialize();
    userHasInteracted();
    heatMap.updateTestPoints(state.showTestData ? testData : []);
  });
  // Check/uncheck the checkbox according to the current state.
  showTestData.property("checked", state.showTestData);

  let discretize = d3.select("#discretize").on("change", function() {
    state.discretize = this.checked;
    state.serialize();
    userHasInteracted();
    updateUI();
  });
  // Check/uncheck the checbox according to the current state.
  discretize.property("checked", state.discretize);

  let percTrain = d3.select("#percTrainData").on("input", function() {
    state.percTrainData = this.value;
    d3.select("label[for='percTrainData'] .value").text(this.value);
    generateData();
    parametersChanged = true;
    reset();
  });
  percTrain.property("value", state.percTrainData);
  d3.select("label[for='percTrainData'] .value").text(state.percTrainData);

  let noise = d3.select("#noise").on("input", function() {
    state.noise = this.value;
    d3.select("label[for='noise'] .value").text(this.value);
    generateData();
    parametersChanged = true;
    reset();
  });
  let currentMax = parseInt(noise.property("max"));
  if (state.noise > currentMax) {
    if (state.noise <= 80) {
      noise.property("max", state.noise);
    } else {
      state.noise = 50;
    }
  } else if (state.noise < 0) {
    state.noise = 0;
  }
  noise.property("value", state.noise);
  d3.select("label[for='noise'] .value").text(state.noise);

  let batchSize = d3.select("#batchSize").on("input", function() {
    state.batchSize = this.value;
    d3.select("label[for='batchSize'] .value").text(this.value);
    parametersChanged = true;
    reset();
  });
  batchSize.property("value", state.batchSize);
  d3.select("label[for='batchSize'] .value").text(state.batchSize);

  let activationDropdown = d3.select("#activations").on("change", function() {
    state.activation = activations[this.value];
    parametersChanged = true;
    reset();
  });
  activationDropdown.property("value",
      getKeyFromValue(activations, state.activation));

  let learningRate = d3.select("#learningRate").on("change", function() {
    state.learningRate = +this.value;
    state.serialize();
    userHasInteracted();
    parametersChanged = true;
  });
  learningRate.property("value", state.learningRate);

  let regularDropdown = d3.select("#regularizations").on("change",
      function() {
    state.regularization = regularizations[this.value];
    parametersChanged = true;
    reset();
  });
  regularDropdown.property("value",
      getKeyFromValue(regularizations, state.regularization));

  let regularRate = d3.select("#regularRate").on("change", function() {
    state.regularizationRate = +this.value;
    parametersChanged = true;
    reset();
  });
  regularRate.property("value", state.regularizationRate);

  let problem = d3.select("#problem").on("change", function() {
    state.problem = problems[this.value];
    generateData();
    drawDatasetThumbnails();
    parametersChanged = true;
    reset();
  });
  problem.property("value", getKeyFromValue(problems, state.problem));

  // Add scale to the gradient color map.
  let x = d3.scale.linear().domain([-1, 1]).range([0, 144]);
  let xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickValues([-1, 0, 1])
    .tickFormat(d3.format("d"));
  d3.select("#colormap g.core").append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,10)")
    .call(xAxis);

  // Listen for css-responsive changes and redraw the svg network.

  window.addEventListener("resize", () => {
    let newWidth = document.querySelector("#main-part")
        .getBoundingClientRect().width;
    if (newWidth !== mainWidth) {
        mainWidth = newWidth;
        console.log("Network resized.")
        drawNetwork(network);
        updateUI(true);
    }
  });

  // Hide the text below the visualization depending on the URL.
  if (state.hideText) {
    d3.select("#article-text").style("display", "none");
    d3.select("div.more").style("display", "none");
    d3.select("header").style("display", "none");
  }
}

function updateBiasesUI(network: nn.Node[][]) {
  nn.forEachNode(network, true, node => {
    d3.select(`rect#bias-${node.id}`).style("fill", colorScale(node.bias));
  });
}

function updateWeightsUI(network: nn.Node[][], container) {
  for (let layerIdx = 1; layerIdx < network.length; layerIdx++) {
    let currentLayer = network[layerIdx];
    // Update all the nodes in this layer.
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
      for (let j = 0; j < node.inputLinks.length; j++) {
        let link = node.inputLinks[j];
        container.select(`#link${link.source.id}-${link.dest.id}`)
            .style({
              "stroke-dashoffset": -iter / 3,
              "stroke-width": linkWidthScale(Math.abs(link.weight)),
              "stroke": colorScale(link.weight)
            })
            .datum(link);
      }
    }
  }
}

function drawInputNode(cx: number, cy: number, nodeId: string,
                       container, node?: nn.Node) {

    let x = cx - RECT_SIZE / 2;
    let y = cy - RECT_SIZE / 2;

    let nodeGroup = container.append("g")
        .attr({
            "class": "node",
            "id": `node${nodeId}`,
            "transform": `translate(${x},${y})`
        });



}


function drawNode(cx: number, cy: number, nodeId: string, isInput: boolean,
                  container, node?: nn.Node, data_series?: number[]) {


    let _RECT_SIZE = RECT_SIZE;
    if (isInput) {
        let _RECT_SIZE = RECT_SIZE * 2;
    } 
  let x = cx - _RECT_SIZE / 2;
  let y = cy - _RECT_SIZE / 2;

  let nodeGroup = container.append("g")
    .attr({
      "class": "node",
      "id": `node${nodeId}`,
      "transform": `translate(${x},${y})`
    });

  // Draw the main rectangle.
    let main = nodeGroup.append("rect")
        .attr({
            x: 0,
            y: 0,
            width: _RECT_SIZE,
            height: _RECT_SIZE,
        })
        .style("opacity", 0);
  let activeOrNotClass = state[nodeId] ? "active" : "inactive";
  if (isInput) {
    let label = INPUTS[nodeId].label != null ?
        INPUTS[nodeId].label : nodeId;
    // Draw the input label.
    let text = nodeGroup.append("text").attr({
      class: "main-label",
      x: -10,
      y: RECT_SIZE / 2, "text-anchor": "end"
    });
    if (/[_^]/.test(label)) {
      let myRe = /(.*?)([_^])(.)/g;
      let myArray;
      let lastIndex;
      while ((myArray = myRe.exec(label)) != null) {
        lastIndex = myRe.lastIndex;
        let prefix = myArray[1];
        let sep = myArray[2];
        let suffix = myArray[3];
        if (prefix) {
          text.append("tspan").text(prefix);
        }
        text.append("tspan")
        .attr("baseline-shift", sep === "_" ? "sub" : "super")
        .style("font-size", "9px")
        .text(suffix);
      }
      if (label.substring(lastIndex)) {
        text.append("tspan").text(label.substring(lastIndex));
      }
    } else {
      text.append("tspan").text(label);
    }
      nodeGroup.classed(activeOrNotClass, true);


  }
  if (!isInput) {
    // Draw the node's bias.
    nodeGroup.append("rect")
      .attr({
        id: `bias-${nodeId}`,
        x: -BIAS_SIZE - 2,
        y: _RECT_SIZE - BIAS_SIZE + 3,
        width: BIAS_SIZE,
        height: BIAS_SIZE,
      }).on("mouseenter", function() {
        updateHoverCard(HoverType.BIAS, node, d3.mouse(container.node()));
      }).on("mouseleave", function() {
        updateHoverCard(null);
      });
  }

  if (!isInput) {}
  // Draw the node's canvas.
  let div = d3.select("#network").insert("div", ":first-child")
    .attr({
      "id": `canvas-${nodeId}`,
      "class": "canvas"
    })
    .style({
      position: "absolute",
      left: `${x + 3}px`,
      top: `${y + 3}px`
    })
    .on("mouseenter", function() {
      selectedNodeId = nodeId;
      div.classed("hovered", true);
      nodeGroup.classed("hovered", true);
      updateDecisionBoundary(network, false);
      heatMap.updateBackground(boundary[nodeId], state.discretize);
    })
    .on("mouseleave", function() {
      selectedNodeId = null;
      div.classed("hovered", false);
      nodeGroup.classed("hovered", false);
      updateDecisionBoundary(network, false);
      heatMap.updateBackground(boundary[nn.getOutputNode(network).id],
          state.discretize);
    });
    
  if (isInput) {
    div.on("click", function() {
      state[nodeId] = !state[nodeId];
      parametersChanged = true;
      reset();
    });
    div.style("cursor", "pointer");
  }
  if (isInput) {
    div.classed(activeOrNotClass, true);
  }

  if (isInput) {
      let linechart = div.insert("div", ":last-child")
          .classed("line", true)
          .style({
              "position": "absolute",
              "left": "0",
              "top": "0"
          });
      let lines = new AppendingLineChart(linechart, _RECT_SIZE, _RECT_SIZE, [BLUE_COLOR]);

      for (let i = 0; i < data_series.length; i++) {
          lines.addDataPoint([data_series[i]]);
      }

  }
  if (!isInput) {
    let nodeHeatMap = new HeatMap(_RECT_SIZE, DENSITY / 10, xDomain,
      xDomain, div, {noSvg: true});

    div.datum({heatmap: nodeHeatMap, id: nodeId});
  }
  
}

// Draw network
function drawNetwork(network: nn.Node[][]): void {
  let svg = d3.select("#svg");
  // Remove all svg elements.
  svg.select("g.core").remove();
  // Remove all div elements.
  d3.select("#network").selectAll("div.canvas").remove();
  d3.select("#network").selectAll("div.plus-minus-neurons").remove();

  // Get the width of the svg container.
  let padding = 3;
  let co = d3.select(".column.output").node() as HTMLDivElement;
  let cf = d3.select(".column.features").node() as HTMLDivElement;
  let width = co.offsetLeft - cf.offsetLeft;
  svg.attr("width", width);

  // Map of all node coordinates.
  let node2coord: {[id: string]: {cx: number, cy: number}} = {};
  let container = svg.append("g")
    .classed("core", true)
        .attr("transform", `translate(${padding},${padding})`);

  // Draw the network layer by layer.
  let numLayers = network.length;
  let featureWidth = 118;
  let layerScale = d3.scale.ordinal<number, number>()
      .domain(d3.range(1, numLayers - 1))
      .rangePoints([featureWidth, width - RECT_SIZE], 0.7);
  let nodeIndexScale = (nodeIndex: number) => nodeIndex * (RECT_SIZE + 25);

  let calloutThumb = d3.select(".callout.thumbnail").style("display", "none");
  let calloutWeights = d3.select(".callout.weights").style("display", "none");
  let idWithCallout = null;
  let targetIdWithCallout = null;

    // Draw the input layer separately.
    let cx = RECT_SIZE / 2 + 50;
    let nodeIds = Object.keys(INPUTS);

    let maxY = nodeIndexScale(nodeIds.length);
    nodeIds.forEach((nodeId, i) => {
        let cy = nodeIndexScale(i) + RECT_SIZE / 2;
        node2coord[nodeId] = {cx, cy};

        // Extract a sample of data to show in the input node;
        let inputValues = [];
        let data_size = Math.min(20, trainData.length);
        for (let idx = 0; idx < data_size; idx++) {
            inputValues.push(trainData[idx].p[i]);
        }
        drawNode(cx, cy, nodeId, true, container, null, inputValues);
    });

  // Draw the intermediate layers.
  for (let layerIdx = 1; layerIdx < numLayers - 1; layerIdx++) {
    let numNodes = network[layerIdx].length;
    let cx = layerScale(layerIdx) + RECT_SIZE / 2;
    maxY = Math.max(maxY, nodeIndexScale(numNodes));
    addPlusMinusControl(layerScale(layerIdx), layerIdx);
    for (let i = 0; i < numNodes; i++) {
      let node = network[layerIdx][i];
      let cy = nodeIndexScale(i) + RECT_SIZE / 2;
      node2coord[node.id] = {cx, cy};
      drawNode(cx, cy, node.id, false, container, node);

      // Show callout to thumbnails.
      let numNodes = network[layerIdx].length;
      let nextNumNodes = network[layerIdx + 1].length;
      if (idWithCallout == null &&
          i === numNodes - 1 &&
          nextNumNodes <= numNodes) {
        calloutThumb.style({
          display: null,
          top: `${20 + 3 + cy}px`,
          left: `${cx}px`
        });
        idWithCallout = node.id;
      }

      // Draw links.
      for (let j = 0; j < node.inputLinks.length; j++) {
        let link = node.inputLinks[j];
        let path: SVGPathElement = drawLink(link, node2coord, network,
            container, j === 0, j, node.inputLinks.length).node() as any;
        // Show callout to weights.
        let prevLayer = network[layerIdx - 1];
        let lastNodePrevLayer = prevLayer[prevLayer.length - 1];
        if (targetIdWithCallout == null &&
            i === numNodes - 1 &&
            link.source.id === lastNodePrevLayer.id &&
            (link.source.id !== idWithCallout || numLayers <= 5) &&
            link.dest.id !== idWithCallout &&
            prevLayer.length >= numNodes) {
          let midPoint = path.getPointAtLength(path.getTotalLength() * 0.7);
          calloutWeights.style({
            display: null,
            top: `${midPoint.y + 5}px`,
            left: `${midPoint.x + 3}px`
          });
          targetIdWithCallout = link.dest.id;
        }
      }
    }
  }

  // Draw the output node separately.
  cx = width + RECT_SIZE / 2;
  let node = network[numLayers - 1][0];
  let cy = nodeIndexScale(0) + RECT_SIZE / 2;
  node2coord[node.id] = {cx, cy};
  // Draw links.
  for (let i = 0; i < node.inputLinks.length; i++) {
    let link = node.inputLinks[i];
    drawLink(link, node2coord, network, container, i === 0, i,
        node.inputLinks.length);
  }
  // Adjust the height of the svg.
  svg.attr("height", maxY);

  // Adjust the height of the features column.
  let height = Math.max(
    getRelativeHeight(calloutThumb),
    getRelativeHeight(calloutWeights),
    getRelativeHeight(d3.select("#network"))
  );
  d3.select(".column.features").style("height", height + "px");
}

function getRelativeHeight(selection) {
  let node = selection.node() as HTMLAnchorElement;
  return node.offsetHeight + node.offsetTop;
}

function addPlusMinusControl(x: number, layerIdx: number) {
  let div = d3.select("#network").append("div")
    .classed("plus-minus-neurons", true)
    .style("left", `${x - 10}px`);

  let i = layerIdx - 1;
  let firstRow = div.append("div").attr("class", `ui-numNodes${layerIdx}`);
  firstRow.append("button")
      .attr("class", "mdl-button mdl-js-button mdl-button--icon")
      .on("click", () => {
        let numNeurons = state.networkShape[i];
        if (numNeurons >= 8) {
          return;
        }
        state.networkShape[i]++;
        parametersChanged = true;
        reset();
      })
    .append("i")
      .attr("class", "material-icons")
      .text("add");

  firstRow.append("button")
      .attr("class", "mdl-button mdl-js-button mdl-button--icon")
      .on("click", () => {
        let numNeurons = state.networkShape[i];
        if (numNeurons <= 1) {
          return;
        }
        state.networkShape[i]--;
        parametersChanged = true;
        reset();
      })
    .append("i")
      .attr("class", "material-icons")
      .text("remove");

  let suffix = state.networkShape[i] > 1 ? "s" : "";
  div.append("div").text(
    state.networkShape[i] + " neuron" + suffix
  );
}

/**
 * Once the CSV is uploaded, open the attribute/column selection dialog
 */
export function openCSVColumnSelectionDialog(header: String[] = []): Promise<String[]>{
  
  return new Promise((resolve, reject) => {

    const dialog: HTMLDialogElement = document.querySelector("#column-selection-dialog"),
    list = d3.select("#column-selection-dialog ul"),
    outputSelect = d3.select("#column-selection-dialog select"),
    btnOkay = dialog.querySelector(".mdl-button--ok"),
    btnCancel = dialog.querySelector(".mdl-button--cancel");

    // by default consider the last column as the Target/Output column
    let sTarget = header.pop(),
    oTargetColumns = d3.map([sTarget], function(d :string){ return d; });

    function updateOutputSelect(){

      const opts = outputSelect.selectAll("option")
        .data(oTargetColumns.keys());

      opts.exit().remove();

      opts.enter()
        .append("option")
        .attr("value", (d)=> d)
        .text((d)=> d);

      opts.attr("value", (d)=> d)
        .text((d)=> d);

    }

    if (!dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }

    // empty
    list.html("");

    list.selectAll('li')
    .data(header)
      .enter().append("li")
      .classed("mdl-list__item", true)
      .html(function(sColumn, i){
        return `<label class="mdl-checkbox mdl-js-checkbox" for="checkbox-${i}">
        <input type="checkbox" id="checkbox-${i}" class="mdl-checkbox__input" ${ i < MAX_INPUT ? "checked": ""} value="${sColumn}" }>
        <span class="mdl-checkbox__label">${sColumn}</span>
      </label>`
      })
      .on('click', function(d){
        // if checked, remove from the Output column option
        const cb: HTMLInputElement = this.querySelector('input');
        if(cb.checked){
          oTargetColumns.remove(cb.value);
        }else{
          oTargetColumns.set(cb.value, cb.value);
        }

        updateOutputSelect();
      });

    // render output select
    updateOutputSelect();    

    // Show the dialog
    dialog.showModal();

    // Bind event to confirm the selected columns
    btnOkay.addEventListener('click', function() {

      // reset
      CSV_SELECTED_COLUMNS = [];

      // Get all selected columns and set the variable
      list.selectAll("input:checked")
      .each(function(d){
        CSV_SELECTED_COLUMNS.push(this.value);
      });

      // add the Output/Target column as the last one
      const sel :any = outputSelect.select("option:checked").node();
      CSV_SELECTED_COLUMNS.push(sel.value);

      dialog.close();

      resolve(CSV_SELECTED_COLUMNS);
    });

    // Cancel button
    btnCancel.addEventListener('click', function() {
      dialog.close();
      reject([]);
    });

  });
}

function updateHoverCard(type: HoverType, nodeOrLink?: nn.Node | nn.Link,
    coordinates?: [number, number]) {
  let hovercard = d3.select("#hovercard");
  if (type == null) {
    hovercard.style("display", "none");
    d3.select("#svg").on("click", null);
    return;
  }
  d3.select("#svg").on("click", () => {
    hovercard.select(".value").style("display", "none");
    let input = hovercard.select("input");
    input.style("display", null);
    input.on("input", function() {
      if (this.value != null && this.value !== "") {
        if (type === HoverType.WEIGHT) {
          (nodeOrLink as nn.Link).weight = +this.value;
        } else {
          (nodeOrLink as nn.Node).bias = +this.value;
        }
        updateUI();
      }
    });
    input.on("keypress", () => {
      if ((d3.event as any).keyCode === 13) {
        updateHoverCard(type, nodeOrLink, coordinates);
      }
    });
    (input.node() as HTMLInputElement).focus();
  });
  let value = (type === HoverType.WEIGHT) ?
    (nodeOrLink as nn.Link).weight :
    (nodeOrLink as nn.Node).bias;
  let name = (type === HoverType.WEIGHT) ? "Weight" : "Bias";
  hovercard.style({
    "left": `${coordinates[0] + 20}px`,
    "top": `${coordinates[1]}px`,
    "display": "block"
  });
  hovercard.select(".type").text(name);
  hovercard.select(".value")
    .style("display", null)
    .text(value.toPrecision(2));
  hovercard.select("input")
    .property("value", value.toPrecision(2))
    .style("display", "none");
}

function drawLink(
    input: nn.Link, node2coord: {[id: string]: {cx: number, cy: number}},
    network: nn.Node[][], container,
    isFirst: boolean, index: number, length: number) {
  let line = container.insert("path", ":first-child");
  let source = node2coord[input.source.id];
  let dest = node2coord[input.dest.id];
  let datum = {
    source: {
      y: source.cx + RECT_SIZE / 2 + 2,
      x: source.cy
    },
    target: {
      y: dest.cx - RECT_SIZE / 2,
      x: dest.cy + ((index - (length - 1) / 2) / length) * 12
    }
  };
  let diagonal = d3.svg.diagonal().projection(d => [d.y, d.x]);
  line.attr({
    "marker-start": "url(#markerArrow)",
    class: "link",
    id: "link" + input.source.id + "-" + input.dest.id,
    d: diagonal(datum, 0)
  });

  // Add an invisible thick link that will be used for
  // showing the weight value on hover.
  container.append("path")
    .attr("d", diagonal(datum, 0))
    .attr("class", "link-hover")
    .on("mouseenter", function() {
      updateHoverCard(HoverType.WEIGHT, input, d3.mouse(this));
    }).on("mouseleave", function() {
      updateHoverCard(null);
    });
  return line;
}

/**
 * Given a neural network, it asks the network for the output (prediction)
 * of every node in the network using inputs sampled on a square grid.
 * It returns a map where each key is the node ID and the value is a square
 * matrix of the outputs of the network for each input in the grid respectively.
 */
function updateDecisionBoundary(network: nn.Node[][], firstTime: boolean) {
  if (firstTime) {
    boundary = {};
    nn.forEachNode(network, true, node => {
      boundary[node.id] = new Array(DENSITY);
    });
    // Go through all predefined inputs.
    for (let nodeId in INPUTS) {
      boundary[nodeId] = new Array(DENSITY);
    }
  }
  let xScale = d3.scale.linear().domain([0, DENSITY - 1]).range(xDomain);
  let yScale = d3.scale.linear().domain([DENSITY - 1, 0]).range(xDomain);

  let i = 0, j = 0;
  for (i = 0; i < DENSITY; i++) {
    if (firstTime) {
      nn.forEachNode(network, true, node => {
        boundary[node.id][i] = new Array(DENSITY);
      });
      // Go through all predefined inputs.
      for (let nodeId in INPUTS) {
        boundary[nodeId][i] = new Array(DENSITY);
      }
    }
    for (j = 0; j < DENSITY; j++) {
        // 1 for points inside the circle, and 0 for points outside the circle.
        let x = xScale(i);
        let y = yScale(j);

        // Build dummy input, source of heatmap vectors;
        let densityPoint: Example2D = {
            p: [],
            dim: INPUT_DIM,
            label: 0
        };

        // Go through each input;
        for (let k = 0; k < INPUT_DIM; k++) {
            if (k % 2 == 0) {
                densityPoint.p.push(x);
            }
            else {
                densityPoint.p.push(y);
            }
        }


        let input = constructInput(densityPoint);
        nn.forwardProp(network, input);
        nn.forEachNode(network, true, node => {
            boundary[node.id][i][j] = node.output;
        });
      if (firstTime) {
        // Go through all predefined inputs.
        for (let nodeId in INPUTS) {
          boundary[nodeId][i][j] = INPUTS[nodeId].f(densityPoint);
        }
      }
    }
  }
}


function getLoss(network: nn.Node[][], dataPoints: Example2D[]):
[number, number []] {
    let loss = 0;
    let outputs = [];
  for (let i = 0; i < dataPoints.length; i++) {
      let dataPoint = dataPoints[i];
      let input = constructInput(dataPoint);
      let output = nn.forwardProp(network, input);
      loss += nn.Errors.SQUARE.error(output, dataPoint.label);
      outputs.push(output);
  }
    return [loss / dataPoints.length, outputs];
}

function updateUI(firstStep = false) {
  // Update the links visually.
  updateWeightsUI(network, d3.select("g.core"));
  // Update the bias values visually.
  updateBiasesUI(network);
  // Get the decision boundary of the network.
  updateDecisionBoundary(network, firstStep);
  let selectedId = selectedNodeId != null ?
      selectedNodeId : nn.getOutputNode(network).id;
  heatMap.updateBackground(boundary[selectedId], state.discretize);

  // Update all decision boundaries.
  d3.select("#network").selectAll("div.canvas")
        .each(function(data) { //: {heatmap: HeatMap, id: string}) {
            // Input nodes are "undefined" here;
            if (typeof data != "undefined") {
                data.heatmap.updateBackground(reduceMatrix(boundary[data.id], 10),
                                              state.discretize);
            }
  });

  function zeroPad(n: number): string {
    let pad = "000000";
    return (pad + n).slice(-pad.length);
  }

  function addCommas(s: string): string {
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function humanReadable(n: number): string {
    return n.toFixed(3);
  }

    // Update loss and iteration number.
    d3.select("#loss-train").text(humanReadable(lossTrain));
    d3.select("#loss-test").text(humanReadable(lossTest));
    d3.select("#iter-number").text(addCommas(zeroPad(iter)));
    lineChart.addDataPoint([lossTrain, lossTest]);


    // Update Confusion Heatmaps;

    let confusionTest = evaluation.confusionMatrix(testData, testOutput);
    document.querySelector("#confusionTest").innerHTML =
        "Test Confusion Matrix:<br>" + evaluation.textPlot(confusionTest);
}

function constructInputIds(): string[] {
  let result: string[] = [];
  for (let inputName in INPUTS) {
    if (state[inputName]) {
      result.push(inputName);
    }
  }
  return result;
}

function constructInput(point: Example2D): number[] {
  let input: number[] = [];
  for (let inputName in INPUTS) {
      if (state[inputName]) {
          let c = INPUTS[inputName];
          let dim_value: number = c.f(point);
          input.push(dim_value);
    }
  }
  return input;
}

function oneStep(): void {
  iter++;
  trainData.forEach((point, i) => {
    let input = constructInput(point);

    nn.forwardProp(network, input);
    nn.backProp(network, point.label, nn.Errors.SQUARE);
    if ((i + 1) % state.batchSize === 0) {
      nn.updateWeights(network, state.learningRate, state.regularizationRate);
    }
  });

    // Compute the loss.
    [lossTrain, trainOutput] = getLoss(network, trainData);
    [lossTest, testOutput] = getLoss(network, testData);

    updateUI();
}

export function getOutputWeights(network: nn.Node[][]): number[] {
  let weights: number[] = [];
  for (let layerIdx = 0; layerIdx < network.length - 1; layerIdx++) {
    let currentLayer = network[layerIdx];
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
      for (let j = 0; j < node.outputs.length; j++) {
        let output = node.outputs[j];
        weights.push(output.weight);
      }
    }
  }
  return weights;
}

function reset(onStartup = false) {
    lineChart.reset();
    state.serialize();
    if (!onStartup) {
        userHasInteracted();
    }

    player.pause();

    let suffix = state.numHiddenLayers !== 1 ? "s" : "";
    d3.select("#layers-label").text("Hidden layer" + suffix);
    d3.select("#num-layers").text(state.numHiddenLayers);

    // Make a simple network.
    iter = 0;

    let dummy: Example2D = {p: [0, 0], dim: 2, label: 0};

    let numInputs = constructInput(trainData[0]).length;

    // console.log("nbinputs:", numInputs);
    /**
     * Make number of features/neurons in first layer same as the 
     * number of input features/attributes or more if explicitly added
     */
    state.networkShape[0] = Math.max(numInputs, state.networkShape[0]);
     
    let shape = [numInputs].concat(state.networkShape).concat([1]);
    let outputActivation = (state.problem === Problem.REGRESSION) ?
        nn.Activations.LINEAR : nn.Activations.TANH;

    // console.log("shape:", shape);
    network = nn.buildNetwork(shape, state.activation, outputActivation,
                              state.regularization, constructInputIds(), state.initZero);

    [lossTrain, trainOutput] = getLoss(network, trainData);
    [lossTest, testOutput] = getLoss(network, testData);

    console.log("Global reset.", state.networkShape);
    drawNetwork(network);
    updateUI(true);
};

function initTutorial() {
  if (state.tutorial == null || state.tutorial === '' || state.hideText) {
    return;
  }
  // Remove all other text.
  d3.selectAll("article div.l--body").remove();
  let tutorial = d3.select("article").append("div")
    .attr("class", "l--body");
  // Insert tutorial text.
  d3.html(`tutorials/${state.tutorial}.html`, (err, htmlFragment) => {
    if (err) {
      throw err;
    }
    tutorial.node().appendChild(htmlFragment);
    // If the tutorial has a <title> tag, set the page title to that.
    let title = tutorial.select("title");
    if (title.size()) {
      d3.select("header h1").style({
        "margin-top": "20px",
        "margin-bottom": "20px",
      })
      .text(title.text());
      document.title = title.text();
    }
  });
}

function drawDatasetThumbnails() {
    function renderThumbnail(canvas, dataGenerator) {
        let w = 100;
        let h = 100;
        canvas.setAttribute("width", w);
        canvas.setAttribute("height", h);
        let context = canvas.getContext("2d");
        let data = dataGenerator(200, 0);
        data.forEach(function(d: Example2D) {
            context.fillStyle = colorScale(d.label);
            context.fillRect(w * (d.p[0] + 6) / 12, h * (d.p[1] + 6) / 12, 4, 4);
        });
        d3.select(canvas.parentNode).style("display", null);
    }

    function manageThumbnail(canvas, datasetName, datasetGroup) {
        // reg-csv dataset has a thumbnail generator that is not the actual data generator;
        if (datasetName == "default-csv") {          
            renderThumbnail(canvas, csvdataset.defaultDataLoad);
        } else if (datasetName == "csv") {
          renderThumbnail(canvas, csvdataset.makeThumbnail);
        } else {
            let dataGenerator = datasetGroup[datasetName];
            renderThumbnail(canvas, dataGenerator);
        }
    }

  d3.selectAll(".dataset").style("display", "none");

  if (state.problem === Problem.CLASSIFICATION) {
    for (let dataset in datasets) {
      let canvas: any =
          document.querySelector(`canvas[data-dataset=${dataset}]`);

        manageThumbnail(canvas, dataset, datasets);
    }
  }
  if (state.problem === Problem.REGRESSION) {
    for (let regDataset in regDatasets) {
      let canvas: any =
            document.querySelector(`canvas[data-regDataset=${regDataset}]`);

        manageThumbnail(canvas, regDataset, regDatasets);
    }
  }
}

function hideControls() {
  // Set display:none to all the UI elements that are hidden.
  let hiddenProps = state.getHiddenProps();
  hiddenProps.forEach(prop => {
    let controls = d3.selectAll(`.ui-${prop}`);
    if (controls.size() === 0) {
      console.warn(`0 html elements found with class .ui-${prop}`);
    }
    controls.style("display", "none");
  });

  // Also add checkbox for each hidable control in the "use it in classrom"
  // section.
  let hideControls = d3.select(".hide-controls");
  HIDABLE_CONTROLS.forEach(([text, id]) => {
    let label = hideControls.append("label")
      .attr("class", "mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect");
    let input = label.append("input")
      .attr({
        type: "checkbox",
        class: "mdl-checkbox__input",
      });
    if (hiddenProps.indexOf(id) === -1) {
      input.attr("checked", "true");
    }
    input.on("change", function() {
      state.setHideProperty(id, !this.checked);
      state.serialize();
      userHasInteracted();
      d3.select(".hide-controls-link")
        .attr("href", window.location.href);
    });
    label.append("span")
      .attr("class", "mdl-checkbox__label label")
      .text(text);
  });
  d3.select(".hide-controls-link")
    .attr("href", window.location.href);
}

function generateData(firstTime = false) {
  let header = [];
  if (!firstTime) {
    // Change the seed.
    state.seed = Math.random().toFixed(5);
    state.serialize();
    userHasInteracted();
  }else{
    // get default headers
    header = csvdataset.DEFAULT_CSV_DATASET.header;
  }
  Math.seedrandom(state.seed);
  
  let numSamples = (state.problem === Problem.REGRESSION) ?
      NUM_SAMPLES_REGRESS : NUM_SAMPLES_CLASSIFY;
  let generator = state.problem === Problem.CLASSIFICATION ?
      state.dataset : state.regDataset;

  let data = generator(numSamples, state.noise / 100);

  updateData(header, data);
}

export function updateData(headers, data) {

    // Shuffle the data in-place.
    shuffle(data);
    // Split into train and test data.
    let splitIndex = Math.floor(data.length * state.percTrainData / 100);

    trainData = data.slice(0, splitIndex);
    testData = data.slice(splitIndex);

    // Calculate new DENSITY;

    if (data.length) {
        let minV = 99999;
        let maxV = -99999;
        for (let i = 0; i < data.length; i++) {
            minV = Math.min(minV, data[i].p[0], data[i].p[1]);
            maxV = Math.max(maxV, data[i].p[0], data[i].p[1]);
        }
        let Domain = Math.round((maxV - minV) / 2);
        //DENSITY = Math.round((maxV - minV) * 120);
        xDomain = [-Domain, Domain];
        console.log("xDomain", xDomain);
        heatMap.updateScale(xDomain);
        heatMap.updateAxes(xDomain);
    }





    heatMap.updatePoints(trainData);
    heatMap.updateTestPoints(state.showTestData ? testData : []);

    INPUT_DIM = trainData[0].dim;
    INPUTS = loadFeatures(trainData[0].dim, headers);
    reset();
}

let firstInteraction = true;
let parametersChanged = false;

function userHasInteracted() {
  if (!firstInteraction) {
    return;
  }
  firstInteraction = false;
  let page = 'index';
  if (state.tutorial != null && state.tutorial !== '') {
    page = `/v/tutorials/${state.tutorial}`;
  }

    // This check is needed for the first network drawing;
    // ga is undefined at that point;
    if (typeof ga != "undefined") {
        ga('set', 'page', page);
        ga('send', 'pageview', {'sessionControl': 'start'});
    }
}

function simulationStarted() {
  ga('send', {
    hitType: 'event',
    eventCategory: 'Starting Simulation',
    eventAction: parametersChanged ? 'changed' : 'unchanged',
    eventLabel: state.tutorial == null ? '' : state.tutorial
  });
  parametersChanged = false;
}

// Load default dataset
csvdataset.loadDefaultCSV().then(function(){
  drawDatasetThumbnails();
  initTutorial();
  makeGUI();
  generateData(true);
  reset(true);
  hideControls();
});