
## WHAT ARE ALL OF THESE CONTROLS? – and why do you care?  

You may be confused about what REALLY happens within the Neural Network.  Know you’re in good company.  There is good bit of mathematical wizardry that happens here.   But just because you’re not a engineer and can’t describe the physics behind an internal combustion engine – that doesn’t mean you can’t drive a car.  So it is with Neural Networks - only difference is, you can't wreck it.
  
  <img src="./images/Main Screen.png" alt="Data" style="width: 100%;"/>  
  
---BR---

## DATA – it all starts with the data  

This section statically defines an input dataset to be used as Predictor Variables (X’s, Inputs, etc.) into the Neural Network.  In our Financial Analysis use case – this data represents time series (End of Day – EOD) data for multiple international indices for the period of January 1, 2015 thru April 30, 2019.   The dataset has been engineered so that it shows % price changes for each day in the time period (in lieu of merely inputting static stock prices).  
  
<img src="./images/Data Region_zoom.png" alt="Data" style="width: 100%;"/>
  
---BR---

### ATTRIBUTES - which markets do you want to include?  
  
Attributes (also known as features) allow you to select the types of data you want the Neural Network to consider during the learning stage.  These same information types are later used to make predictions.

The site defaults to ALL available attributes selected and connected to the network.  You can experiment with de-selecting/ selecting attributes to find combinations that provide a better indication of the direction of your Target/Predicted variable (the DOW).

So for instance, if you select MOEX (Moscow Exchange) and N225 (Japanese Market) to use as inputs for the NN to make predictions of the DOW, you would then use MOEX and N225 to train your NN.  Once trained, it is necessary to feed the same market information (Attributes) into the NN to make the predictions.  You would NOT, for instance, include another market to make predictions because NN would not have been trained to use that data.  It would be like studying for a test in English but then the instructor gives you the questions in Chinese.  You probably wouldn’t score very well.  

---SBR---


### TARGET - the value you want to predict  

Say you have selected MOEX and N225 as your ATTRIBUTES – input data you want to use to train your network.   Now you need to define your TARGET – or data which you want predict.  In our case, the data that we want to predict is the DOW (The DOW is hard-coded…not selectable – sorry).  However, on this site is a nifty jupyter notebook if you want to create a modified version with other Target variables.  We show you how in the notebook.  See the section on HOW TO BUILD YOUR OWN NN.

---SBR---

### RATIO of TRAINING to TEST DATA
The INPUT DATA set is comprised of a single file of time series data – and it is this data that the Neural Network uses in order to adjust weights associated with the edges between the neurons.  These weights reflect the relevance of a particular neuron’s output as a factor in its ability to accurately predict the TARGET value (one TARGET associated with each sample).  The data used during this “learning” phase is called the TRAINING data.  

During the TRAINING process (after each EPOCH) the system does a check of how well it is predicting the TARGET value – weights are not adjusted during this process…it is a measure.  The data used for this measurement is called the TEST data.
Using one INPUT dataset – the RATIO of TRAINING to TEST DATA tells what the system what % of the INPUT DATA you want divvied into the TRAINING data and what % you want used as the TEST data.

---SBR---

### NOISE  

Injecting noise adds some variability to the input data and when this is done,  the network is less able to converge on an overly- specific solution wherein an undesirable situation known as over-fitting occurs.  Injecting noise results in smaller network weights and essentially allows the network to better generalize to other datasets (be a better predictor).  This is important in Financial Analysis because you want a predictor of data that as of yet does not have a TARGET value associated with it (e.g. we have data for earlier markets (the attributes) and  the TARGET “DOW” has not yet occurred)  .

---SBR---

### BATCH SIZE  

TRAINING data can be grouped into “batches”.  A batch is simply the number of samples the network considers before updating the weights.  For instance, let's say you have 100 training samples and you set the Batch size to 50. The model will take the first 50 samples from the training dataset, perform an evaluation (measuring the error) and then update the internal weights. It then takes the next 50 sample, evaluates – and then updates.  And so on.  

Practically speaking, a small batch means that the model will learn more quickly (and require less memory to do so) but it comes at a cost in that there is usually a degradation in the quality of the model as measured by its ability to generalize to other out-of-sample datasets (performance).

---SBR---

### OK, So far?   

So at this stage you have both your INPUTS (DATA and ATTRIBUTES) and OUTPUT (Targets) defined.   Additionally, you’ve told given it some parameters on how to present this data to the Neural Network.  You are now ready to train your Neural Network.  

The NN will now be able to observe price movements in both the ATTRIBUTES (e.g. MOEX, N225, etc.) and their associated result in the TARGET (DOW).  As the NN is trained it continually observes these movements and the associated results so as to build a mathematical/logical representation of the relationship between them.  

Now it’s time to build the Neural Network.  

---BR---


## BUILDING THE NETWORK 

This sections describes the network architecture (layers and neurons) that comprise the Neural Network.  The system defaults to 2 layers and a number of neurons based upon the number of inputs. Experiment with various configuration by addiing or deleting these underlying components.

<img src="./images/Build_zoom.png" alt="Data" style="width: 100%;"/>  

---SBR---


### Hidden Layers 

The hidden layers (there may be many) are where the Neurons live.  Neurons accept weighted inputs from the input layer (or previous hidden layer) and apply activation functions before passing the results to neurons in the next layer, and so on.  Learning occurs by adjusting the weights between the individual neurons.  

You can experiment with different NN configuration using the +/- button to add or delete layers.

---SBR---

### Neurons  

Within each hidden layers are multiple (usually multiple) neurons defined.  The data presented at a connection between artificial neurons is a real number … and the output of each neuron is computed by some  function applied to the sum of its inputs. The connections between neurons are called 'edges'. (analogous to synapsis in the Brain).  Edges typically have a weight that adjusts as learning proceeds.  The weight increases (or decreases) in proportion to the relevance (or lack of relevance) of the data at a given connection.   

Just know that this is where the Neural Network is “learning” the statistical relationships (if there are any) that exists between the inputs and the target data.  

Similar to the HIDDEN LAYERS - you can experiment with different network configuration using the +/- button to add or delete Neurons within each layer.  

---BR---


## CONTROLS  

Once you have your data defined…and your network configured, you’re ready to head out on the open road.  
  
Here’s how you steer.  
  
  <img src="./images/Controls_zoom.png" alt="Data" style="width: 100%;"/>  

---SBR---

### Play Button 

This is the ignition switch – it starts and stops the learning process of the Neural Network.  The input data is broken up into bite-sized chunks called “Batch Sizes” (more below) and fed into the network.

---SBR---

### Epoch  

After each chunk is fed through the Network – measurements are taken and weights adjusted (AKA – learning).  You can see the results after each Batch is run as an update to the OUTPUT graph and the associated performance measures on the right side of the screen.
Each “run” of a batch is called an “EPOCH”.

---SBR---

### Learning Rate  

Learning rate controls the size of the steps that the Neural Network is taking as it converges on a solution.  If the learning rate is too big…it may over-shoot the target and go off in the wrong direction (zig when it should zag)  Too small and it may take a very long time to converge.  By converge, we mean reducing the amount of error between what the neural network is predicting and the actual/real-world values – in the case of the DOW…what the index price actually did vs. what the NN predicts it did.

---SBR---

### Activation 

The Activation function of a node defines the output of that node given an input or set of inputs.  Imagine a simple step function that outputs a 0 if the input is negative or a 1 if the input is positive.  

The Neural Network represented on this site has a number of different Activation Function with which you can experiment.

---SBR---

 
### Regularization  

Neural Networks are fantastic at learning to predict targets for a given dataset (the learning dataset).  But sometimes, when you offer a new dataset (for instance, a dataset for time period outside of that used during the training phase) to this same learned model– the results aren’t so great.  We say that in these circumstances, the learned model does not GENERALIZE well.  It does great with the learning dataset but tanks when you offer out-of-sample data.  

Regularization is a technique that randomly “drops out” neurons as a way of dummying down the learned model – e.g.  so that it doesn’t “over-fit” the learning data and subsequently does poorly on the test data.
Several regularization techniques can be employed when teaching a neural network.  The result may offer a model which generalizes better than otherwise.  

---SBR---

### Regularization Rate  

If you do decide to employ a regularization technique – then you must specify the rate at which neurons are “dropped out” when training the model.  

For instance:  Say you have only 100 neurons in your network – and you specify a regularization rate of 0.001 (meaning that 1 in 1000 neurons will be dropped during training).  How can that be?  

Answer:  Remember that training runs for many batches…for many epochs.  So many thousands of neurons are measured and adjusted when training even a small neural network.  So with a Regularizaton rate of 0.001, the model would randomly drop out (on average) 1 every 1000 neurons when updating the weights during the learning phase.

---SBR---


### Problem Type 

This site support a REGRESSION solution meaning that the output of the Neural Network will output a real number somewhere between minus-infinity and plus-infinity.  In our case study of stock price movements – it will be somewhat more constrained (thank goodness we can’t lose an infinite amount of money in the stock market).  Here you can count a range between -6% and +6% (which is a pretty wide swing for a single day).

This is in contrast to a CLASSIFICATION solution wherein the output would be either a -1(market goes down) or 1 (market goes up).  We actually build some performance measures (See confusion matrix – recall, and precision) which take the regression output and does a classification into one of these two categories.  

---BR---

 
## HOW DO YOU INTERPRET THE RESULTS?  

So what's the point of all this?  You want model that does a prediction of the direction of the DOW based upon the input attributes of international indices.  This section tells you how well the model is doing in making that prediction.  The cool part is that you can watch the Neural Network as it progresses in converging upon a solution.

<img src="./images/Results_zoom.png" alt="Data" style="width: 100%;"/>  

---SBR---

### What’s going on in the OUTPUT Region?

The Output Region is perhaps the most interesting of the visualization – but there’s a lot going on here.  Let’s break it down.  

What are the Dots?

These the target values - not the predicted target values – but the actual target values (e.g. what the DOW did during our sample period).  They range from -1 (a loss for the day) to 1 (a gain for the day).

What are the Colored Regions?  

This is a visualization of the final neuron in the neural network – the output.  It shows a how, based upon data represented on the two axis, what the corresponding prediction (e.g. output of the final neuron) would look like.  As you run the NN (e.g. as EPOCH count increases) then the region is constantly being adjusted as it reflects the updated weights within the neural network.

As the NN is run, you see how the regions are adjusted and can easily contrast it against the Target values represented by the dots.
This visualization is a bit tricky because visually, we can only depict two axis – we randomly select the first two inputs (Attributes) for values used for the axes.  What is actually going on within the network is that multi-dimensional regions are being built in order to make our prediction – based on a number of input attributes.  But this is impossible for us to visualize, so we settle for only 2.  Hopefully, you get the idea.

---SBR---

### Loss

Loss is essentially the difference between the prediction and what actually occurred.  You'll note two types of loss: Training and Test

As the NN is trained measurements are taken that measure the difference between the output and the actual value - it is this measurement that is used to guide the update of the internal weights within the network (how it learns).  The output of the training loss gives you a visual indication of whether the loss is improving or not...of course, we want to see this decrease.

Test Loss is similar in that it too is a measure of the difference between the predicted value and the actual.  Difference is that it is measured during the Test phase (e.g. the network is not learning, but rather is being graded on how well it has done so far).  Updates to the test loss occur after each epoch.

---SBR---


### The Confusion Matrix  

Perhaps slightly more useful than the region visualization – the confusion matrix is a measure of how well the Neural Network is performing.  The X axis represents output from our NN and there are two values: -1 and 1.  We have set a threshold so that a predicted value greater than 0 (e.g. the DOW is predicted to move up) it set to 1.  And any predicted value less than 0 (e.g. the DOW is predicted to go negative) – it is set to -1.  Ok so far?

The Y axis corresponds to what really happens (Actual) – similarly, if the DOW actually went up – it is set to 1.  If it went down – it is set to -1.  

The confusion matrix contrasts the predicted values against the actual values.  So a count in the 1,1 region means that the model predicted 1 and it was actually one (also known as a True-Positive).  A -1,-1 means we predicted that the DOW would go down, and indeed it did go down (a True-Negative).  

A “-1” on the X axis and a “+1” on the Y,  means that we predicted a negative movement but in actuality – it was positive.  This is known as a “False-Negative”.  Meaning we got it wrong.  

Similarly, A “+1” on the X axis and a “-1” on the Y,  means that we predicted a positive movement but in actuality – it was negative.  This is known as a “False-Positive”.   Also, not what we want.  

Note that here we are turning our Regression model into a classification model.  No longer are we looking at the % of movement in a particular day, but rather classifying it into either Positive or Negative movement.

---SBR---

### Recall  

Using the same classification paradigm describe for the Confusion Matrix,   Recall (also known as sensitivity) asks, of all the actual values that are positive – how many of them did we predict?   It is calculated as follows:  

	True-Positive / (True-Positive + False-Negative)
    
    
---SBR---

### Precision  

Similar to Recall,  Precision is a measure of the relevance/performance of our predictions.  It measures how many of True-Positives we’re actually finding.  It asks, of all the predictions we thought were positive - what % of them actually were positive.  It is calculated as follows:  

	True-Positive / (True-Positive + False Positive)  
    
It too uses the same classification paradigm as described previously.

---BR---

