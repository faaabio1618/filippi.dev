---
layout: page
title: "Lighthouse Scores for Shopify websites"
---

#### This is a short version to accommodate your limited attention span. <br/>Full version  [here](https://datalore.jetbrains.com/report/static/8qIJqoLirz3VNYz2Yc7efy/NH2oWpnlBKm3GduIBjc5lM).

<div style="text-align:right;margin-bottom: 50px;">The Internet, 2023/07/22</div>

# Introduction

## What are Lighthouse Performance Score

[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) is the most popular tool to analyze the performance
of a website.

The most important metric is [Performance](https://developer.chrome.com/docs/lighthouse/performance/).
It ensures that your page is optimized for users to be able to see and interact with page content.

The performance score is a [weighted average](https://googlechrome.github.io/lighthouse/scorecalc/) of the current
metrics:

1. 10% [First Content Paint (FCP)](https://developer.chrome.com/docs/lighthouse/performance/first-contentful-paint/):
   how long it takes the browser to render the first piece of DOM content.
2. 10% [Speed Index](https://developer.chrome.com/docs/lighthouse/performance/speed-index/): how quickly content is
   visually displayed during page-load.
3. **30%** [Total Blocking Time (TBT)](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time/):
   the total amount of time that a page is blocked from responding to user input.
4. **25%** [Largest Contentful Paint (LCP)](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-largest-contentful-paint/):
   when the largest content element in the viewport is rendered to the screen.
5. **25%** [Cumulative Layout Shift (CLS)](https://web.dev/cls/): the largest burst of layout shift scores for every
   unexpected layout shift that occurs during the entire lifespan of a page.

## Measuring the performance

Measuring a website's performance with Lighthouse is like measuring a person's height with an octopus. You will never
get the same result twice, and it can leave you quite tangled up...

We will use different tools, and we will try to understand the difference between the results:

* [Page Speed Insights](https://pagespeed.web.dev/)
* [The Chrome User Experience Report (CrUX)](https://developer.chrome.com/docs/crux/)
* Lighthouse (Browser)

## Lighthouse and Shopify

If you have a Shopify store or if you're a theme developer, you will be familiar with the [*Shopify speed
score*](https://help.shopify.com/en/manual/online-store/store-speed/speed-report). The Shopify speed score is the
Lighthouse performance score calculated on the Shopify test environment.

Your score is based on a weighted average of the **Lighthouse performance scores** for a store's home page, product page
with the most traffic over the last **7 days**, and a collection page with the most traffic. Weights are based on
multiple factors, including the relative traffic to each of these page types across all Shopify stores.

# In pursuit of the perfect picture

To experiment with Lighthouse, let's engage in a simple task: building the perfect image snippet using Shopify Liquid.

## The experiment

We have built a simple page, here's a recording of it:

<center>
<video src="/reports/lighthouse_analysis/speed.mp4" controls="controls" style="max-width: 730px; text-align: center;margin: 20px 0 20px 0">
</video>
</center>

## Snippet 1:

The [first snippet](https://github.com/faaabio1618/perftester/blob/main/snippets/image_a.liquid) is simple, no
Javascrpit, and it uses [tailwind](https://tailwindcss.com/):

{% highlight liquid %}
{% raw %}

{% liquid
assign image_class = 'aspect-auto h-full w-full rounded-md object-cover ' | append: class
assign alt = alt | default: image.alt | escape

    assign preload = false
    assign priority = 'auto'
    assign decoding = 'auto'

    if lazyload or lazyload == null
        assign lazyload = 'lazy'
        assign decoding = 'async'
    elsif lazyload == false
        assign lazyload = 'eager'
        assign priority = 'high'
        assign preload = true
    endif

%}

{{
image | image_url: width: image.width
| image_tag:
alt: image_alt,
class: image_class,
widths: '200,300,400,500,600,700,800,1000,1200,1400,1600,1800,2000,2200',
loading: lazyload,
fetchpriority: priority,
decoding: decoding,
preload: preload
}}
{% endraw %}
{% endhighlight %}

### Snippet 1 Results

<figure>
    <center> <img src="/reports/lighthouse_analysis/abs_res_1.png"  alt='missing' width="100%"  ></center>
</figure>

<figure>
    <center> <img src="/reports/lighthouse_analysis/sco_res_1.png"  alt='missing' width="100%"  ></center>
</figure>

## Snippet 2

The [second snippet](https://github.com/faaabio1618/perftester/blob/main/snippets/image_b.liquid) uses Javascript and
CSS.

{% highlight liquid %}
{% raw %}
<div class="ratio" style="--ratio: calc({{ image.width }} / {{ image.height }})">
    <picture>
        <source
                srcset="{{ image | image_url: width: 300 }}"
                media="(max-width: 343px)">
        <source
                srcset="{{ image | image_url: width: 420 }}"
                media="(min-width: 344px) and (max-width: 576px)">
        <source
                srcset="{{ image | image_url: width: 540 }}"
                media="(min-width: 1024px) and (max-width: 1399px)">
        <source
                srcset="{{ image | image_url: width: image.width }}"
                media="(min-width: 1400px)">
        <img
                src="{{ image | image_url: width: 600 }}"
                alt="{{ image.alt }}"
                loading="lazy"
                class="lazy"
                height="{{ image.height }}px"
                width="{{ image.width }}px">
    </picture>
</div>
{% endraw %}
{% endhighlight %}

{% highlight javascript %}
import lazySizes from 'lazysizes';
import 'lazysizes/plugins/attrchange/ls.attrchange';
import 'lazysizes/plugins/respimg/ls.respimg';
import 'lazysizes/plugins/native-loading/ls.native-loading';

lazySizes.cfg.lazyClass = 'lazy';
lazySizes.cfg.init = false;
lazySizes.cfg.preloadAfterLoad = false;
lazySizes.cfg.loadMode = 1;
lazySizes.cfg.nativeLoading = {
setLoadingAttribute: true,
disableListeners: {
focus: false,
mouseover: false,
click: false,
load: false,
transitionend: false,
animationend: false,
scroll: true,
resize: true
}
};
{% endhighlight %}

### Snippet 2 Results

<figure>
    <center> <img src="/reports/lighthouse_analysis/abs_res_2.png"  alt='missing' width="100%"  ></center>
</figure>

<figure>
    <center> <img src="/reports/lighthouse_analysis/sco_res_2.png"  alt='missing' width="100%"  ></center>
</figure>

## Comparing Results

| Score             | Snippet 1   | Snippet 2   |
|-------------------|-------------|-------------|
| FCP Score         | 99.90±0.30  | 100.00±0.00 |
| SI Score          | 100.00±0.00 | 100.00±0.00 |
| LCP Score         | 32.35±44.52 | 44.20±11.78 |
| TBT Score         | 88.07±12.87 | 95.90±6.19  |
| CLS Score         | 19.94±9.87  | 100.00±0.00 |
| Performance Score | 59.48±10.49 | 84.82±3.60  |

Snippet 2 is the clear winner! 

`First Content Paint` and `Speed Index` were almost always perfect because they depend on the server speed, and both pages were served by Shopify, which has proved to be fast.

`Total Blocking Time` is comparable, but even in that case, Snippet 2 is ahead.

`Cumulative Layout Shift` is very different. Snippet 2 is perfect, while Snippet 1 is struggling.

The difference in `Largest Contentful Paint` makes us emphasize that even **a significant variance is a bad signal**. This is because users may have a different experience on the same page, or the page can behave very differently under certain circumstances.


<hr style="border:2px solid gray; margin: 50px 0 50px 0">

# Comparing best e-commerces
...to be continued