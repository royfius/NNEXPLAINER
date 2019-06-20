# Deep playground

Deep playground is an interactive visualization of neural networks, written in
TypeScript using d3.js. We use GitHub issues for tracking new requests and bugs.
Your feedback is highly appreciated!

# Modifications

Following capabilities and restrictions are applicable: -

 - Only Regression mode is enabled
 - The application expects the default dataset to be present in form of a CSV file named `Playground_Dataset.csv`
 - This fork includes the ability to load `.csv` datasets. The feature is currently disabled.
 - `.csv` data must be normalized and can have upto 16 attribute columns and one target column.
 - Text templates like header, section, navigation links are fetched from their respective markdown templates present in the `template` folder.
 

**If you'd like to contribute, be sure to review the [contribution guidelines](CONTRIBUTING.md).**

## Development

To run the visualization locally, run:
- `npm i` to install dependencies
- `npm run build` to compile the app and place it in the `dist/` directory
- `npm run serve` to serve from the `dist/` directory and open a page on your browser.

For a fast edit-refresh cycle when developing run `npm run serve-watch`.
This will start an http server and automatically re-compile the TypeScript,
HTML and CSS files whenever they change.

## For owners

How to Add/Edit the text?

- Currently there are 3 text markdown templates: `links.md`, `sections.md` and `title.md` for navigation sidebar, main text sections and the site header text respectively.
- You can use any Markdown editor to generate relevant text/html and place in these files. Example: [Stackedit](https://stackedit.io/app), [Dillinger](https://dillinger.io/)

How to update default dataset?

- Put a `CSV` file named `Playground_Dataset.csv` in the main folder. Ideally, it should have column names.

How to export site to a Web hosting service like Godaddy?

- Clone this repo on your machine `git clone https://github.com/Gab0/playground.git`
- Go to directory `cd playground`
- Type `npm i` to install dependencies
- Type `npm run build` to compile the app and place it in the `dist/` directory
- Copy the contents of `dist/` to the hosting server

To push to Github Pages: `git subtree push --prefix dist origin gh-pages`.

This is not an official Google product.
