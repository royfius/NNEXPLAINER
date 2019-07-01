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

# Adding Text Sections and their navigation links

- The navigation links on the left side are quick go-to links which on click scroll the window to their respective text sections.
- When a text section is created using a Markdown editor like [Marked](https://marked.js.org/demo/), note down the automatically generated `id` of the text heading. It can be seen when `HTML Source` option is selected as the Response.
- In `links.md`, use the id of the text section as the `href` attribute.

    Here is an example. Open [Marked](https://marked.js.org/demo/) and select `HTML Source` as the Response option.
    
    If the following text is entered as Input:

    ```
    ## Um, What Is a Neural Network?

    It’s a technique for building a computer program that learns from data. It is based very loosely on how we think the human brain works. First, a collection of software “neurons” are created and connected together, allowing them to send messages to each other. Next, the network is asked to solve a problem, which it attempts to do over and over, each time strengthening the connections that lead to success and diminishing those that lead to failure. For a more detailed introduction to neural networks, Michael Nielsen’s [Neural Networks and Deep Learning](http://neuralnetworksanddeeplearning.com/index.html) is a good place to start. For a more technical overview, try [Deep Learning](http://www.deeplearningbook.org/) by Ian Goodfellow, Yoshua Bengio, and Aaron Courville.
    ```

    the editor shows following output:
    ```
    <h2 id="um-what-is-a-neural-network">Um, What Is a Neural Network?</h2>
    <p>It’s a technique for building a computer program that learns from data. It is based very loosely on how we think the human brain works. First, a collection of software “neurons” are created and connected together, allowing them to send messages to each other. Next, the network is asked to solve a problem, which it attempts to do over and over, each time strengthening the connections that lead to success and diminishing those that lead to failure. For a more detailed introduction to neural networks, Michael Nielsen’s <a href="http://neuralnetworksanddeeplearning.com/index.html">Neural Networks and Deep Learning</a> is a good place to start. For a more technical overview, try <a href="http://www.deeplearningbook.org/">Deep Learning</a> by Ian Goodfellow, Yoshua Bengio, and Aaron Courville.</p>
    ```

    Note the `id` of the `h2` element: `id="um-what-is-a-neural-network"`

    Use the value of `id` attribute as the `href` attribute for its respective link when you add it in the file `links.md`.
    An associated link could look like 

    `* [What is a Neural Network](#um-what-is-a-neural-network)`

    That's it.

**If you'd like to contribute, be sure to review the [contribution guidelines](CONTRIBUTING.md).**

# Tour Page

- The contents of `tour.html` are also based on Markdown templates.
- The Markdown templates are located in folder `template/tour`.
- The rules for creating the content are same as applicable for `Adding Text Sections and their navigation links` mentioned above.

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
- You can use any Markdown editor to generate relevant text/html and place in these files. Example: [Marked](https://marked.js.org/demo/), [Stackedit](https://stackedit.io/app), [Dillinger](https://dillinger.io/)

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

# NNEXPLAINER
A demonstration of NN using Machine Learning for Financial Analysis
