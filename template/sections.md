## NN EXPLAINER OVERVIEW


The NN EXPLAINER is a micro-tutorial on Machine Learning - specifically Neural Networks.  The tutorial/visualizaton takes a sample problem (financial market analysis) and demonstrates an investigation using a Deep Learning approach.  Included are descriptions of how the Neural Network operates as well as links to several jupyter notebook(s) that will allow you to expand this investigation to include other datasets and create models of your own.  

The analysis of Financial Markets is well suited for Deep Learning and is an excellent vehicle for the tutorial.  In our investigation, we build on the premise that global financial markets are ever more inter-connected/correlated and that if by following the time zones across the globe, we can predict the performance of domestic stock markets based upon the movement of international markets operating earlier that same day.  Specifically, using price movement in international indices as inputs to predict the performance of the domestic index DOW30 as its target/predictor variable.

Consider the fact that markets in Australia close 15 hours before markets of North America.  So, if we know the direction of price movement of the Austrailian market in advance  …  then how does that information improve our ability to predict the movement of markets in North America?  Moreover, if we take into account - the movements of multiple international markets in our analysis – will that improve our ability to make a prediction even more?  

For this investigation, we have chosen the following international indices as inputs (Attributes) to our Neural Network:  
 
|Index                  |Market                          |  UTC-Offset|
|:----------------------|:-------------------------------|-----------:|
| DJNZ                  | New Zealand Stock Exchange     |        +12 |
| ASX200/AXJO           | Australian Stock Exchange      |        +10 |
| Nikkei225             | Tokyo Stock Exchange           |         +9 |
| DJ Shanghai           | Shanghai Stock Exchange        |         +8 |
| Hang Seng/HIS         | Hong Kong Exchange             |         +8 |
| BSE Sensex/BSESN      | Bombay Stock Exchange          |      +5:30 |
| MOEX                  | Moscow Exchange                |         +3 |
| FTMIB                 | Borsa Italiana                 |         +2 |
| TA35                  | Tel Aviv Stock Exchange        |         +2 |
| DAX                   | Frankfurt Stock Exchange       |         +1 |
| SSMI                  | SIX Swiss Exchange             |         +1 |
| IBEX35                | Bolsa de Madrid                |         +1 |
| Bel20/BFX             | Brussels Stock Exchange        |         +2 |
| ATX                   | Vienna Stock Exchange          |         +2 |
| FTSE 100              | London Stock Exchange          |          0 |
| Bovespa               | BM&F BOVESPA                   |         -3 |
					
<br>

The domestic index – DOW30-  has been chosen as our target/predicted variable.

|Index                  |Market                          |  UTC-Offset|
|:----------------------|:-------------------------------|-----------:|
| DOW                   | New York Stock Exchange        |         -3 |
 
<br>

We have feature engineered the dataset so that we are inputting/measuring price movement as opposed to static stock prices (e.g. period to period % increase/decrease).


## Warning

This NN visualization (as well as the referenced resources) are intended for educational purposes. So don’t use anything here for  investment decisions of any kind.  

Just don’t.  

Our purpose in providing these resources was/is to hopefully peak your interest in developing Deep Learning models of your own and to give you a basic understanding of how Neural Networks operate.  

See the BUILD YOUR OWN section for a discussion of why it is ill-advised to use these models and also gives suggestions on investigations you may undertake on your own using the enclosed resources.

---BR---



## WHAT IS A NEURAL NETWORK?

An Artificial Neural Network (ANN or NN) is a computing system inspired by the biological neural networks that constitute the brain.  Similar to the brain, a NN “learns”  by repeatedly considering samples of data which are comprised of multiple predictor variables (data used to make the prediction) and the associated predicted variable (the data you’re interested in predicting).  The purpose of the NN is to programmatically reflect how changes to the predictor variables affect changes in the predicted variable.  Artificial neural networks have been used on a variety of tasks, including computer vision, speech recognition, advertising, spam detection, medical diagnosis and in our case – Financial Analysis.

For a description of the inputs, architecture and controls of this implementation - be sure to "Take a Tour".  The button is located just below the DATA section of the main screen.

---BR---


## BUILD YOUR OWN

The neural network results are encouraging – certainly interesting.   But bear in mind that the TEST samples (e.g. used to calculate recall/precision/confusion matrix) are drawn from the same period as the TRAINING samples.  This means that this data is considered “in-sample”.  A necessary step would use TEST data against time periods outside of the sample period (Current Sample:  January 1, 2015 thru April 30, 2019).  

Once you understand how data is utilized by the Neural Network (e.g. an area of Machine Learning known as Feature Engineering) then you’ll be equipped to incorporate other datasets into your models.  Using Feature Engineering and by using additional Datasets you’ll be able to investigate the following kinds of questions:  

*	In addition to price movement, how do other features such as “Trade Volume” affect the predictive power of the model (Note:  One of the available notebook creates attributes/features using Volume deviations from a base line moving average).
*	How well does the movement of international indices affect the movement of individual US stocks – especially bell-weather stocks?  How does movement of the Hang Seng index affect the domestic stock – Catepillar, for instance?
*	How does the inclusion of Domestic Economic data affect the predictive power of the model.  Domestic indicators such as Employment Data, Personal Income/Spending, Retail Sales, Investor Optimism, Housing and Construction, Durable Goods, Industrial Production, Federal Reserve Reports can be utilized in order increase the predictive power of the model.
*	How would inclusion International Economic Indicators affect the performance?
*	How could you quantify and incorporate sentiment analysis?

Additionally, you may want to consider developing your own Neural Network to run locally on your desktop.  A good start would be for you to become familiar with the techniques coded in the jupyter notebooks listed below.  They describe how to organize time series data as well as a Neural Network Implementation that you can experiment more directly.  They're written in Python/Keras.

### INPUT_NN.ipynb  

Contains Python code samples of how to clean-up candidate input data and make it ready for consumption by a  Neural Network.

<a class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" href="./uploads/INPUT_NN.ipynb" download="INPUT_NN.ipynb">Download INPUT_NN.ipynb</a>


### EDA.ipynb  
  
Performs some rudimentary examination of the data you are considering to be used as input to the Neural Network.  
  
<a class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" href="./uploads/EDA.ipynb" download="EDA.ipynb">Download EDA.ipynb</a>


### BUILD_NN.ipynb  
  
Builds a Neural Network in Keras and inputs the data from the previous notebooks.  Analysis examples are included.  
  
<a class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" href="./uploads/BUILD_NN.ipynb" download="BUILD_NN.ipynb">Download BUILD_NN.ipynb</a>
<br>

### Sample Data

Following are two datasets showing stock prices on the Tokyo and Moscow exchanges.  They are used as predictor variables by the Neural Network.

<a class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" href="./uploads/Tokyo.csv" download="Tokyo.csv">Download Tokyo.csv</a>
<br>

<a class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" href="./uploads/London.csv" download="London.csv">Download London.csv</a>
<br>
<br>
And here's a sample target dataset - the NASDAQ.

<a class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" href="./uploads/NSDQ.csv" download="NSDQ.csv">Download NSDQ.csv</a>
<br>

---BR---



## CAN YOU RE-PURPOSE IT?  Absolutely!

In keeping with the spirit of our predecessors, the source code is available at: [GitHub](https://github.com/tensorflow/playground) 

You’re free to use it in any way that follows the [Apache License](https://github.com/tensorflow/playground/blob/master/LICENSE). 

Keep in mind that there are some good examples of NN implementation available as Jupyter Notebooks which are available for download in the BUILD YOUR OWN section.

---BR---



## OTHER RESOURCES  

For a nice overview course of neural networks:  https://www.coursera.org/learn/ai-for-everyone   

For an excellent introductory course:   https://www.coursera.org/learn/machine-learning  

These should get you well on your way to a firm understanding of Neural Networks and their application.


---BR---


## CREDITS

Developed by Roy Ferguson, Gabriel Araujo,  Mihajlo Pavloski and Ashish Singh


This site incorporates  a re-purposed implementation of the Tensorflow Playground.  See  https://playground.tensorflow.org.  

It was originally created by Daniel Smilkov and Shan Carter was iteself a continuation of many people’s previous work — most notably Andrej Karpathy’s [convnet.js demo](http://cs.stanford.edu/people/karpathy/convnetjs/demo/classify2d.html) and Chris Olah’s [articles](http://colah.github.io/posts/2014-03-NN-Manifolds-Topology/) about neural networks. 

The Financial Analysis use case was inspired by Google’s “ML with Financial Data” example:  See https://www.youtube.com/watch?v=N422_CYuzZg&feature=youtu.be   

Site incorporates Public Datasets from quandl.com

---BR---


## CONTACT  


If you have suggestions for additions, changes, corrections, etc.  
<br>
Drop me a note at:  royferguson2016@gmail.com.

---BR---
