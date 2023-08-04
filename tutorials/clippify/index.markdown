---
layout: page
title: It looks like you're trying to build... a Shopify Checkout UI Extension
---

<div style="text-align:right;margin-bottom: 50px;">The Internet, 2023/08/04</div>

# Introduction

In this tutorial, we will create a Shopify Checkout UI Extension, enabling merchants to include a personalized message
on their checkout page. We'll achieve this by building an API using ChatGPT.

However, our primary goal is to evoke a nostalgic feeling from the year 2000 when you were using Word and Clippy would
appear, offering assistance while you tried to write a document.

## The goal

There are many upsell and cross-sell apps that enable merchants to boost their average order value. However, what if we
aimed to persuade the customers to simply purchase the items already in their cart? What if Clippy could reemerge and
convince our customers that the papaya shirt in the cart is the best choice they could make?

## The approach

![Goal Plot](/tutorials/clippify/goal-plot.svg)

We will build a Checkout UI extension that connects to the app's API, which will communicate with ChatGPT to generate a
message. This message will then be displayed to the customer on the checkout page.

## Where to start

Shopify documentation is a great place to start. You can find
the [Checkout UI Extension documentation here](https://shopify.dev/docs/api/checkout-ui-extensions).

# Generating the App

Let's begin by creating a new app using the Shopify CLI. We'll name it "Clippify" and utilize Remix for the application.

```shell
$ yarn create "@shopify/app"
$ cd clippify
$ yarn shopify app generate extension
```

We select `Checkout UI` as Type of extension, we put `clippify-checkout-ui` as the name of the extension, and we will
use `Typescript React`.

## After the generation

Now we have the following project structure:

```bash

clippify
├── Dockerfile
├── README.md
├── app
│ ├── db.server.js
│ ├── entry.server.jsx
│ ├── root.jsx
│ ├── routes
│ │ ├── app._index.jsx
│ │ ├── app.additional.jsx
│ │ ├── app.jsx
│ │ ├── auth.$.jsx
│ │ ├── auth.login
│ │ │ ├── error.server.jsx
│ │ │ └── route.jsx
│ │ └── webhooks.jsx
│ └── shopify.server.js
├── extensions
│ └── clippify-checkout-ui
│     ├── README.md
│     ├── locales
│     ├── package.json
│     ├── shopify.extension.toml
│     ├── src
│     │ └── Checkout.tsx
│     └── tsconfig.json
├── package.json
├── prisma
├── public
│ └── favicon.ico
├── remix.config.js
├── shopify.app.toml
├── shopify.web.toml
├── tsconfig.json
└── yarn.lock
```

## The Checkout UI

# Our ~~Clippy~~ Assistant!

We need a mascot, let's head to [Lottie Files](https://lottiefiles.com) to find a cute animation.

Who wouldn't listen to a tiger? ![Tiger](/tutorials/clippify/tiger.gif)

# Creating the API

# Putting it all together

# Demo Store
