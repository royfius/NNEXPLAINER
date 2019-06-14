
import * as dataset from "./dataset";
import * as CSV from 'csv-string';
import * as d3 from "d3";
import * as playground from "./playground";

/** Default dataset to be used – mention relative file path */
const DEFAULT_DATA_FILE_PATH = "../Playground_Dataset.csv";

class LoadedCsvDataset {
    public header: string[] = [];
    public points: dataset.Example2D [] = [];
    public error: string = "";
    public warning: string = "";
}

export type CSVDataset = {
    header: string[];
    points: dataset.Example2D[];
    error: string;
    warning: string;
};

export let DEFAULT_CSV_DATASET: CSVDataset = {
    header: [],
    points: [],
    error: "",
    warning: ""
};

export let USER_CSV_DATASET: CSVDataset = {
    header: [],
    points: [],
    error: "",
    warning: ""
};


class FileLoader {

    public fileSelector = document.createElement("input");
    public csvdata = [];

    launch(askForNewFile: boolean = false, previousData: any[] = []): Promise<CSVDataset> {

        return new Promise<CSVDataset>((resolve, reject) => {

            this.fileSelector.setAttribute("type", "file");
            //this.fileSelector.setAttribute("multiple", "multiple");

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
                                    reject(getDefaultData());
                                    alert(".CSV file loader failed due to " + csvoutput.error);
                                } else {

                                    resolve(USER_CSV_DATASET = csvoutput);

                                    if (csvoutput.warning) {
                                        alert("Warning: " + csvoutput.warning);
                                    }
                                    
                                }
                            }
                        };

                        reader.readAsText(file);
                    } else {
                        reject(getDefaultData());
                        alert("File not supported. Please select a .csv file.");
                    }
                }

                console.log(fullCsvData.length);

            });

            // Open file dialog
            this.fileSelector.click();

        });
    }
}

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

/**
 * Read a CSV file
 * @param sFileName Filename of the CSV file to read
 * @returns Promise
 */
function readCSVFile(sFilePath): Promise<any> {

    return new Promise<any>((resolve, reject) => {

        d3.csv(sFilePath, function(error, rows: object[]) { 
            if(error){
                reject(error);
                return false;
            }
            resolve(rows);
        });
    });

}

/**
 * Load default dataset and store in the class
 * First reads Playground_Dataset.csv. If not found,
 * generates random dataset
 */
export async function loadDefaultCSV(): Promise<any>{
    
    let output: LoadedCsvDataset = DEFAULT_CSV_DATASET;
    
    try {
        // read the CSV
        const aRows: Object[] = await readCSVFile(DEFAULT_DATA_FILE_PATH);

        // format dataset so that parse_csv_data can process it
        let aData = aRows.map(function(d){
            return d3.values(d);
        });

        // Add header
        aData.unshift(Object.keys(aRows[0]));

        output = parse_csv_data(aData);

    }catch(err){
        output.error = "Error: CSV file read. " + err;
    }

    // Now we check if data actually exists: datapoints and labels;
    if(output.error){
        // Load with default generated dataset
        output.points = dataset.regressGaussian(200, 0);
        output.error = "";
        output.warning = "Error reading default data file. Using randomly generated dataset";
        output.header = [];
    }

    return DEFAULT_CSV_DATASET = output;
}

/**
 * Return default data point
 */
export function defaultDataLoad(): dataset.Example2D[] {
    return loadDefaultDataPoints();
}

function getDefaultData(): CSVDataset {
    return DEFAULT_CSV_DATASET;
}

/**
 * Return default dataset points
 */
function loadDefaultDataPoints(): dataset.Example2D[] {

    // Ideally, the default dataset should have been loaded at this point.
    // If not, load the dataset
    if(!DEFAULT_CSV_DATASET.points.length){
        DEFAULT_CSV_DATASET.points = makeThumbnail(200, 0);
    }
    return DEFAULT_CSV_DATASET.points;
}

// This is the function called by the playground when user wants to load csv data!
// We return either the last loaded file's dataset or the default dataset 
export function loadCsv(numSamples: number, noise: number):
dataset.Example2D[] {

    let points: dataset.Example2D [] = USER_CSV_DATASET.points.length ? USER_CSV_DATASET.points : loadDefaultDataPoints();

    return points;

}

/**
 * Load a CSV file by launching a File upload dialog
 * @returns {Promise<CSVDataset>}   Promise resolves to the uploaded file's processed dataset. 
 *                                  Reject returns the last/default dataset.
 */
export function loadCSVFile(): Promise<CSVDataset>{
    // Instantiate FileLoader
    const CSVFileLoader = new FileLoader;

    return CSVFileLoader.launch(true);

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
