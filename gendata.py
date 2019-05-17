#!/bin/python

import numpy as np


def randomdata(size=6):
    d = np.random.normal(size=size)
    return d


def sumdata(size=6):
    d = list(np.random.normal(size=size-1))
    label = sum(d) / 10

    d.append(label)
    return d


def buildData(fname, fn):
    dataset = open(fname, 'w')
    labels = ["one", "two", "three", "four", "five"]
    labels = ",".join(labels)
    dataset.write("%s\n" % labels)
    for k in range(1200):
        d = randomdata(6)
        data = ",".join([str(x) for x in d])
        dataset.write("%s\n" % data)


buildData("dataset.csv", randomdata)
buildData("sum_dataset.csv", sumdata)



