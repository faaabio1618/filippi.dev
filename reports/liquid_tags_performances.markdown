---
layout: page
title: "Analysis of Liquid Tags Performances"
---

#### This is a summary of the full report that can be found [here](https://datalore.jetbrains.com/view/report/v9uEpyL6zMfr6Atx8E8AoX).

<div style="text-align:right;margin-bottom: 50px;">The Internet, 2023/07/06</div>

## Introduction

In this report, we will compare two different liquid tags: `assign` and `capture`. We created two pages, one using
only `capture` and the other using only `assign`, to understand the difference between their performances.

## Generating the pages

To maximize the distinction between the two results, we executed each tag as many times as possible. To do this, we
generated a section file containing 100 `render` snippet calls. We chose 100 because using 1000 was causing memory
errors, as shown below:

![Memory Error](/reports/liquid_tags_performances/mem_error.png)

We then created one snippet for `assign` and one snippet for `capture`. Each snippet executes the tag 1000 times.

At first, we tried to use this pattern...

{% highlight liquid %}
{% raw %}
{% assign result = "pizza" %}{{result}}
{% endraw %}
{% endhighlight %}

compared to this

{% highlight liquid %}
{% raw %}
{% capture result %}pizza{% endcapure %}{{result}}
{% endraw %}
{% endhighlight %}

**But we find out that when used without filters, `assign` and `capture` have practically the same performance.**

So we adopted this pattern

{% highlight liquid %}
{% raw %}
{% assign temp="pizza"%}{% assign result= temp | append: "pineapple"%}{{result}}
{% endraw %}
{% endhighlight %}

compared with

{% highlight liquid %}
{% raw %}
{% capture temp %}pizza{% endcapture %}{%capture result %}{{temp}}pineapple{% endcapture %}{{resutl}}
{% endraw %}
{% endhighlight %}

The resulting snippets can be found here: [assign](/reports/liquid_tags_performances/assign.liquid)
and [capture](/reports/liquid_tags_performances/capture.liquid).

## Data Analysis

We created a script that uses `curl` to measure the time taken to render the page. We executed the script 1000 times for
each page, resulting in a total of 2000 `curl` requests. Each `curl` request collected the following metrics:

- `pretransfer`: The time, in seconds, it took from the start until the file transfer was just about to begin.
- `starttransfer`: The time, in seconds, it took from the start until the first byte was just about to be transferred.
  This includes the `pretransfer` time and the time the server needed to calculate the result.
- `total`: The total time, in seconds, that the full operation lasted.
- `size`: The total amount of bytes that were downloaded.

We are also calculating derived metrics:

- `process_time`: The difference between `starttransfer` and `pretransfer`.

`process_time` represents the actual time it takes for the server to render the page, which is the metric we are most
interested in.

To avoid hitting the cache, a new page is created before each request.

## Test Validation

Before proceeding with the actual test, we conducted a preliminary test with two pages: one with 1000 invocations
of `assign` and one with 0 invocations. This was done to ensure that we were not hitting the cache and to validate our
method. The following graph shows the results for `process_time`:

![Process Time Validation](/reports/liquid_tags_performances/process_time_validation.png)

It is evident that the tests are working, and the results are consistent with our expectations.

## Test Results

- Difference in means for process_time: 0.13332 seconds (71.66%±0.02%)
- Difference in means for total: 0.13562 seconds (50.65%±0.02%)
- Difference in means for pretransfer: 0.00132 seconds (2.80%±0.01%)
- Difference in means for starttransfer: 0.13464 seconds (57.70%±0.02%)
- Difference in means for size: 0.24919 bytes (0.00%±0.00%)

<figure>
    <center> <img src="/reports/liquid_tags_performances/process_time.png"  alt='missing' width="600"  ></center>
</figure>

<figure>
    <center> <img src="/reports/liquid_tags_performances/total_time.png"  alt='missing' width="600"  ></center>
</figure>

## Conclusion

The data is quite clear in saying that this

{% highlight liquid %}
{% raw %}
{% assign temp="pizza"%}{% assign result= temp | append: "pineapple"%}{{result}}
{% endraw %}
{% endhighlight %}

is slower than this

{% highlight liquid %}
{% raw %}
{% capture temp %}pizza{% endcapture %}{%capture result %}{{temp}}pineapple{% endcapture %}{{resutl}}
{% endraw %}
{% endhighlight %}

### How much slower?

The resulting page is slower by 50% in total time, but if we just consider `process_time` (which is a good approximation
for how long it takes the server to generate the page) the capture code is faster by a 70% margin.

### So I should stop using assign?

No:

1. Cache. The page request will hit the cache almost always.
2. The difference is <small>tiny</small>. In our tests, each tag was called `100x500x2 = 100,000` times and
   the difference is about `0.14` seconds. This should not be a problem in a real world template.
3. Favour readability. Sometimes it is not possible to use `capture`, sometimes `assign` makes the code cleaner. Every
   time you think it looks better to use `assign` don't think about a `0.0000014` seconds possible gain in performance.