
import * as dataset from "./dataset";
import * as CSV from 'csv-string';

import * as playground from "./playground";


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

                let points: dataset.Example2D [] = [];
                let data = CSV.parse(res);
                for (let i = 0; i < data.length; i++)
                {

                    let x = Number(parseFloat(data[i][0]));
                    let y = Number(parseFloat(data[i][1]));
                    let label = Number(parseFloat(data[i][2]));

                    let nb = {x, y, label};
                    points.push(nb);

                }

                playground.updateData(points);
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

    let points: dataset.Example2D [] = [];

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


        points.push({x, y, label: 1});

    }

    // letter S;
    for (let i = 0; i < 10; i += 0.5) {
        let y = -5 + i;
        let x = -( y ** 3) / 20;

        points.push({x, y, label: -1});
    }

    // letter V;
    for (let i = 0; i < 10; i += 0.5) {
        let x = -5 + i;
        let y = - Math.abs(2.5 * x) + 4;

        x = x + 3;

        points.push({
            x: x,
            y: y,
            label: 1
        });

    }

    console.log("thumb points", points);
    return points;

}
