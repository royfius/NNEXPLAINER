
import * as dataset from "./dataset";
import * as CSV from 'csv-string';

import * as playground from "./playground";


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
                let response = confirm("Is this " + files[1].name + "the label file? ");
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
                            playground.updateData(csvoutput[0], csvoutput[1]);
                        }
                    }

                    reader.readAsText(file);
                } else {
                    alert("File not supported, .csv files only");

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
let fileLoader2 = new FileLoader;


function parse_csv_data(csvdata): [string [], dataset.Example2D []] {

    let points: dataset.Example2D [] = [];
    let Header: string[] = [];

    for (let i = 0; i < csvdata.length; i++) {

        let hasHeader = false;
        let p = [];
        for (let j = 0; j < csvdata[i].length - 1; j++) {

            // PARSE HEADER;
            if (i == 0) {
                if (isNaN(parseFloat(csvdata[i][j]))) {
                    if (j < csvdata[i].length - 1) {
                        Header.push(csvdata[i][j]);
                    }
                    hasHeader = true;
                }
            }

            // PARSE DATA VALUES;
            if (!hasHeader) {
                let value = Number(parseFloat(csvdata[i][j]));
                p.push(value);
            }
        }

        // PARSE LABEL;
        if (!hasHeader) {
            let label = Number(parseFloat(csvdata[i][csvdata[i].length - 1]));
            points.push({p, dim: csvdata[i].length - 1, label});
        }
    }

    console.log(points);
    return [Header, points];
}



// This is the function called by the playground when user wants to load csv data!
export function loadCsv(numSamples: number, noise: number):
dataset.Example2D[] {

    let points: dataset.Example2D [] = dataset.regressGaussian(numSamples, noise);

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
