
import * as dataset from "./dataset";
import * as CSV from 'csv-string';

import * as playground from "./playground";

class LoadedCsvDataset {
    public header: string[] = [];
    public points: dataset.Example2D [] = [];
    public error: string = "";
    public warning: string = "";

}

class FileLoader {
    public fileSelector = document.createElement("input");
    public csvdata = [];

    launch(askForNewFile: boolean = false, previousData: any[] = []) {
        this.fileSelector.setAttribute("type", "file");
        this.fileSelector.setAttribute("multiple", "multiple");

        console.log("Launching...");

        this.fileSelector.addEventListener("change", () => {

            // Make the loaded files a list;
            let files = [];
            Array.prototype.forEach.call(this.fileSelector.files,
                                         file => files.push(file));

            if (files.length > 1) {
                // Ask user if order is correct;
                let response = confirm("Is this " + files[1].name + " the label file? ");
                if (!response) {
                    files = files.reverse();
                }
            }

            let fullCsvData = [];

            for (let f = 0; f < files.length; f++) {
                let file = files[f];

                if (file.name.match(/\.(csv)$/)) {

                    let reader = new FileReader();

                    reader.onload = () => {
                        let res = reader.result;

                        let csvdata = CSV.parse(res);

                        if (fullCsvData.length) {
                            if (fullCsvData.length != csvdata.length) {
                                alert("Failed... incompatible data by length.");
                                return;
                            }

                            // Concatenate all columns!
                            for (let i = 0; i < fullCsvData.length; i++) {
                                fullCsvData[i] = fullCsvData[i].concat(csvdata[i]);
                            }


                        } else {
                            // Or just initialize fullCsvData...
                            fullCsvData = csvdata;
                            console.log(fullCsvData);
                        }
                        // Apply data on last file!;
                        if (f === files.length - 1) {

                            console.log("Loading dataset!");
                            let csvoutput = parse_csv_data(fullCsvData);

                            // Only update the loaded dataset if valid data is retrieved from file;
                            // I.E. no error message returns from parse_csv_data();
                            if (csvoutput.error) {
                                alert(".CSV file loader failed due to " + csvoutput.error);
                            } else {

                                if (csvoutput.warning) {
                                    alert("Warning: " + csvoutput.warning);
                                }
                                // Now we check if data actually exists: datapoints and labels;
                                // All good: update dataset!
                                playground.updateData(csvoutput.header, csvoutput.points);
                            }
                        }
                    };

                    reader.readAsText(file);
                } else {
                    alert("File not supported. Please select a .csv file.");
                }
            }

            console.log(fullCsvData.length);

        });

        this.fileSelector.click();
    }
}

// This holds both loadable csv data.
// The use of global variables is questionable but loading this
// Has proven an unexpected challenge;
let fileLoader1 = new FileLoader;


function parse_csv_data(csvdata): LoadedCsvDataset {

    let data = new LoadedCsvDataset;


    // This makes a result a error-report result;
    let invalidErrorMessage = (value, i, j) => {
        let message = "invalid datapoint at row " + i + " col " +
            j + ": '" + csvdata[i][j] + "'";
        return message;
    };

    let parseDatapoint = (i, j) => {
        let value = Number(parseFloat(csvdata[i][j]));
        if (isNaN(value)) {
            data.error = invalidErrorMessage(csvdata[i][j], i, j);
        }

        if (value > 1 || value < -1) {
            data.warning = "Warning: datapoints above 1 or below -1. \n" +
                "Please normalize the dataset";
        }
        return value;
    };

    for (let i = 0; i < csvdata.length; i++) {


        let atHeader = false;
        let p = [];
        for (let j = 0; j < csvdata[i].length - 1; j++) {

            // PARSE HEADER;
            if (i == 0) {
                if (isNaN(parseFloat(csvdata[i][j]))) {
                    if (j < csvdata[i].length - 1) {
                        data.header.push(csvdata[i][j]);
                    }
                    atHeader = true;
                }
            }

            // PARSE DATA VALUES;
            if (!atHeader) {
                let value = parseDatapoint(i, j);
                p.push(value);
            }
        }

        // PARSE LABEL;
        if (!atHeader) {
            let j = csvdata[i].length - 1;
            let label = parseDatapoint(i, j);
            data.points.push({p, dim: csvdata[i].length - 1, label});
        }
    }

    console.log(data.points);



    return data;
}


// This is the function called by the playground when user wants to load csv data!
export function loadCsv(numSamples: number, noise: number):
dataset.Example2D[] {

    let points: dataset.Example2D [] =
        dataset.regressGaussian(numSamples, noise);

    console.log("numSamples: ", numSamples);

    fileLoader1.launch(true);


    return points;

}

export function makeThumbnail(numSamples: number, noise: number):
dataset.Example2D[] {

    let points: dataset.Example2D [] = [];



    // letter C;
    for (let i = 0; i < 10; i += 0.5) {
        let y = -5 + i;
        let x = y ** 2 / 5 - 6;


        points.push({p: [x, y], dim: 2, label: 1});

    }

    // letter S;
    for (let i = 0; i < 10; i += 0.5) {
        let y = -5 + i;
        let x = -( y ** 3) / 20;

        points.push({p: [x, y], dim: 2, label: -1});
    }

    // letter V;
    for (let i = 0; i < 10; i += 0.5) {
        let x = -5 + i;
        let y = - Math.abs(2.5 * x) + 4;

        x = x + 3;

        points.push({p: [x, y], dim: 2, label: 1});

    }

    console.log("thumb points", points);
    return points;

}
