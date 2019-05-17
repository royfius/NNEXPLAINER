#!/bin/python

import numpy as np

dataset = open("dataset.csv", 'w')

for k in range(1200): 
    d = np.random.normal(size=6)
    data =",".join([str(x) for x in d])
    dataset.write("%s\n" % data)




