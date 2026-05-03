---
title: The Framework of Machine Learning
crumb: the-framework-of-machine-learning
date: 2026-05-03
description: Machine Learning feels elusive when first reading about it. The framework, however, is quite intuitive, allowing one to pin down each component and its responsibility.
tags:
  - machine-learning
  - overview
---
# The Framework of Machine Learning
---
Reading about Artificial Intelligence, Machine Learning (ML), and Large Language Models (LLMs) has felt like a fever dream, where one cannot quite pinpoint how things fit together. I had this very same feeling when I started learning about machine learning. 

However, unsurprisingly, machine learning can be understood intuitively within the framework of statistical learning theory [\0], which forms the basis of ML. It expresses neatly the four major components and how these interact with each other, such that 'machines can learn':

$$
\min_\theta \frac{1}{|\mathcal D|} \sum_{(x, y)\in\mathcal D}\ell(y, \hat f_\theta(x)) 
$$

- The **[Data](#data)** $\mathcal D$ is the expression, the observations, and our samples and targets of our problem. The problem is our goal, which we are trying to solve: e.g., classifying a penguin in its type, or predicting its body weight. We assume that there exists some kind of underlying process, expressible through some function $f: X \rightarrow Y$, which, e.g., maps the penguins' characteristics $x \in X$ to their type $y \in Y$.
- A **[Model](#model)** $\hat f_\theta$ is our best guess about how these characteristics interact. It is a function we can control and adjust by changing our configuration/parameters $\theta$, so that it best mimics the underlying process $f$.
- The **[Loss](#loss)** $\ell$ is our definition of how we score the model in its current configuration, i.e., "how well it is doing". It encodes our goal, our expression of the optimal configuration for the model. 
- **[Optimization](#optimization)** $\min_\theta$ is our strategy on how we push and update the model's configuration $\theta$ based on our goals.   

With this, the final step in statistical learning, i.e., the training process, becomes a search ($\min_\cdot$)  over possible configurations ($\theta$) of our model ($\hat f_{\cdot}$) so that our goal ($\ell$) is as closely matched over our data ($\mathcal D$). This resulting model and its configuration are what we interact with, e.g., LLMs. However, there is a *[fifth](#the-problem)* component that directly influences the choices of the other components.

## The Problem
---
The problem is the driving force behind machine learning. It is the main question one tries to answer, e.g., how do we predict what type of penguin it is by its characteristics, what are unlikely characteristics, or how do we infer body weight based on its flipper length? As a result, the problem already dictates where on [the spectrum of machine learning](#the-spectrum-of-machine-learning) it falls.  

In supervised learning, what we try to mimic is the underlying process that relates, links, or maps these characteristics. We assume that there exists some kind of function $f: X \rightarrow Y$, where
- $Y$ represents our target space, the key characteristic we want to predict, e.g., the weight of the penguin.
- $X$ represents our input space, encompassing what we see fit to use, what is possible and easily attainable/measurable, e.g., the flipper length.

The goal of the final model is to accurately predict outputs for **new, unseen data**. Additionally, it might allow us to gain insight into the underlying processes at play, which drive [unsupervised learning](#spectrum-of-machine-learning).

## Data
---
The data is just the expression of our problem, the samples we can take of this problem. Let's stick with the penguins [\1] [\2]. Though I have never handled any, I assume, like most animals, that they are not interested in standing on a scale. However, to ensure our penguins develop healthily, we want to know this. Fortunately, for a few penguins, we were able to take these measurements:

<chart id="plot-penguins-measurements" type="div"/>


## Model
---
From our samples, we can observe that body mass increases with flipper length. We can express this by drawing a line with some slope and intercept through our data.

<chart id="plot-penguins-linear-model" type="div"/>

Our model became a **parameterized hypothesis** about how our output/label, e.g., the penguin's body mass, depends on the input, e.g., the flipper length of the penguin.

**Hypothesis.** When choosing a model $\hat f_{\cdot}$, we are choosing our hypothesis space, a family of functions, as our candidates to express this relation. Based on our model choice, we inherently fix and limit what is expressible. For example, choosing the family of linear functions as our model prevents us from expressing any nonlinear relationships in our data. Meaning our model would be unable to capture the body mass as being non-linearly dependent on the flipper length.

**Parameterization.** The parameterization $\theta$ in our parameter space $\Theta$ then becomes a specific setting for this model $\hat f_\theta$, pinning it to a concrete function in this family. Hence, one can think of $\theta$ as a configurable index and selector over this function family, or as something that can be adjusted so that our function better fits our data (e.g., our slope and intercept for the linear model).

More often than not, one will refer to a model as the parameterized function $\hat{f} _ \ theta$, while the family of functions is referred to as the architecture.

## Loss
---
The loss is our description, our signal of how well our model is performing. **It encodes what we actually want** and what we mean by how well a specific model fits our data, expressed as a scalar value in $\mathbb{R}$. 

For our penguins, we might choose to express this through the **sum of squared residuals**:

$$
\ell(y, \hat f_\theta(x)) = \|y - \hat f_\theta(x)\|_2^2  = (y - \hat f_\theta(x))^2 
$$

Meaning that we calculate for each penguin how well our model 
predicts the body weight of that penguin, based on the distance of the prediction to the actual weight.


The choice of loss $\ell$ and architecture $\hat f_\cdot$ becomes tightly coupled, as $\ell(y, \hat{f}_\theta(x))$ spans a landscape over the possible configurations of our model, the parameter space $\Theta$. With this, we define a (differentiable) function, which allows us to convert "did the model do well?" into a scalar to optimize over our data.

## Optimization
---
An optimizer is the procedure, the search strategy, that we use to navigate the parameter space $\Theta$ in search of a configuration $\theta$ for our model with respect to our loss function. Therefore, when we talk about training, we are just applying this optimization technique to find a better configuration for the model on the data evaluated under our loss.

If we apply this to our penguins, we find a configuration, the slope and intercept, for our architecture which best expresses the relationship between flipper length and body mass, i.e., our ideal model:

<chart id="plot-penguins-linear-model-optimized" type="div"/>

## The Spectrum of Machine Learning
---
Except in the very first paragraphs, I have steered clear of using LLMs as an example, even though they are the most well-known form of machine learning. They are, however, a good example of the fluidity of problems in machine learning, as they fit, depending on their training phase, into the paradigms of unsupervised learning, supervised learning, or something in between.

While uncommon, one can use the formulation from statistical learning to express unsupervised learning:

$$
\min_\theta \frac{1}{|\mathcal D|} \sum_{x\in\mathcal D}\ell(x, \hat f_\theta(x)) 
$$

Your problem space is still the driving force. However, there is no key characteristic you want to predict. Rather, you want to learn patterns present in your data.

Even more uncommonly written, but in general, I like to think about machine learning as this structure:

$$
\min_\theta \frac{1}{|\mathcal D|} \sum_{d\in\mathcal D}\ell(d, \hat f_\theta(\tilde d \subseteq d)) 
$$

It expresses all major components (i.e., data, model, loss, and optimizer) and their coupling in most scenarios (e.g., supervised, unsupervised, self-supervised, semi-supervised, ...). While the machine learning paradigm is itself blurry, the framework allows us to argue about the components employed; where the data is the representation of our problem, the model defines the family of functions we want to search by its configuration/parameters, the loss encodes our goals, and together with the model gives us the landscape over these parameters. The optimizer defines the trajectory through it.

## Reference
---
[\0]: Vapnik, V. (2013). _The nature of statistical learning theory_. Springer science & business media.

[\1]: Gorman KB, Williams TD, Fraser WR (2014). Ecological sexual dimorphism and environmental variability within a community of Antarctic penguins (genus _Pygoscelis_). PLoS ONE 9(3):e90081. [https://doi.org/10.1371/journal.pone.0090081](https://doi.org/10.1371/journal.pone.0090081) 

[\2]: [Allison Horst Palmer Penguins](https://allisonhorst.github.io/palmerpenguins/)
