---
layout: page
title: "How to deploy a Shopify Remix App"
image: "/tutorials/shopify-app-deployment/deployment.png"
tags:
  - shopify
  - cloudflare
  - typescript
  - javascript
  - deployment
  - Remix
  - Node.js
  - React
  - AWS
  - Heroku
  - Fly.io
  - Vercel
  - Cloudflare
  - Gadget
---

<div style="text-align:right;margin-bottom: 50px;">The Internet, 2024/06/06</div>

# Introduction

In this tutorial we will see how to deploy a Shopify app based on the Shopify scaffold app.

We will try to keep it simple but also complete, we will talk about deploy, monitoring, continuous integration
and testing.

We will also try different ways to deploy: serverless, "old style" and using a service like Gadget.

Even if all apps are just web services, each one has its own peculiarities and requirements, so don't expect that
everything will work for you, but I hope that you will find some useful information.

# The simplest app possible

Let's start with the simplest app possible, the one that you get when you create a new Shopify app with the Shopify CLI.

We will simply follow [Shopify's tutorial](https://shopify.dev/docs/apps/build/scaffold-app).

```shell
$ shopify app init
?  Your project name?
✔  my-deployed-app

?  Get started building your app:

>  Start with Remix (recommended)
?  For your Remix template, which language you want?
✔  TypeScript
```

<sub><sup>(We chose Typescript because we are not barbarians).</sup></sub>

The app just created is not yet linked to any Shopify app in our Shopify Partner account. Let's do it.

```shell
$ shopify app deploy
?  Which organization is this work for?
✔  Fabio Filippi
?  Create this project as a new app on Shopify?
✔  Yes, create it as a new app
?  App name:
✔  my-deployed-app
?  Release a new version of my-deployed-app?
✔  Yes, release this new version
```

**All done, thank you for following this tutorial!** Just kidding, we have to deploy the app for real now.

Few things to notice, before we move on with the first deployment method:

1. The app, by default, uses a sqlite database, i.e. an unencrypted file, to save sessions.
2. There isn't a test or dev environment. When you are developing the app, you are using the production environment.
3. The app provides a `Dockerfile`.

Let's begin using one of
the [suggested deploying hosts](https://shopify.dev/docs/apps/launch/deployment/deploy-web-app): [Fly.io](https://fly.io).

# Serverless deployment with Fly.io

t