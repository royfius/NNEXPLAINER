
import * as dataset from "./dataset";
import * as CSV from 'csv-string';

import * as playground from "./playground";


function parse_csv_data(csvdata): [string [], dataset.Example2D []] {

    let points: dataset.Example2D [] = [];
    let Header: string[] = [];

    for (let i = 0; i < csvdata.length; i++) {

        let H = false;
        let p = [];
        for (let j = 0; j < csvdata[i].length - 1; j++) {

            // PARSE HEADER;
            if (i == 0) {
                if (isNaN(parseFloat(csvdata[i][j]))) {
                    if (j < csvdata[i].length - 1) {
                        Header.push(csvdata[i][j]);
                    }
                    H = true;
                }
            }

            // PARSE DATA VALUES;
            if (!H) {
                let value = Number(parseFloat(csvdata[i][j]));
                p.push(value);
            }
        }
        
        // PARSE LABEL;
        if (!H) {
            let label = Number(parseFloat(csvdata[i][csvdata[i].length - 1]));
            points.push({p, dim: csvdata[i].length - 1, label});
        }
    }

    console.log(points);
    return [Header, points];
}


function read_csv_file() {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");


    let loaded = false;

    fileSelector.addEventListener('change', function() {
        let file = fileSelector.files[0];

        if (file.name.match(/\.(csv)$/)) {

            let reader = new FileReader();

            reader.onload = () => {
                let res = reader.result;

                let csvdata = CSV.parse(res);

                let csvoutput = parse_csv_data(csvdata);

                playground.updateData(csvoutput[0], csvoutput[1]);
            };

            reader.readAsText(file);
        } else {
            alert("File not supported, .csv files only");
        }
    });

    fileSelector.click();


}


export function loadCsv(numSamples: number, noise: number):
dataset.Example2D[] {

    let points: dataset.Example2D [] = dataset.regressGaussian(numSamples, noise);

    console.log("numSamples: ", numSamples);


    read_csv_file();

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
