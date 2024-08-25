---
layout: page
title: "How to solve timeout when developing extensions"
date: 2023-11-01
tags:
  - shopify
  - carrier service
  - functions
  - extension
  - checkout ui
  - cloudflare
  - typescript
  - javascript
---


<div style="text-align:right;margin-bottom: 50px;">The Internet, 2024/03/15</div>

# Introduction

You don't need an external tunnel to test your Shopify Extension. Using a cloudflare or ngrok tunnel can be slow and sometimes
it can cause timeouts. You can use Caddy to create a local tunnel with a custom domain and use it as your development
server. 

Time to set it up? 1 minute, plus the time you lost reading this intro.

# Installation

Download Caddy from [the official website](https://caddyserver.com/download) <br/>
Install mkcert: `brew install mkcert` ([or check here for other ways](https://github.com/FiloSottile/mkcert))

## Create certificates

Create a folder, let's call it `extension_server`.

```shell
mkdir extension_server
cd extension_server
```

Create the certificates with mkcert

```shell
mkcert shopify.localhost
```

## Caddy

Create a config file for Caddy with this content and call it `Caddyfile`

```
shopify.localhost

reverse_proxy /* 127.0.0.1:8989
tls ./shopify.localhost.pem ./shopify.localhost-key.pem
```

Run Caddy in the same folder

```shell
caddy run
```

## Run dev

Now you can use `https://shopify.localhost` as your development server. Run your dev like this

```shell
pnpm dev --tunnel-url https://shopify.localhost:8989
```