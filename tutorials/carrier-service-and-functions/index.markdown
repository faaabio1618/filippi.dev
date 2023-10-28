---
layout: page
title: "Shipping: carrier service and functions"
image: "/tutorials/carrier-service-and-functions/image.webp"
---

<div style="text-align:right;margin-bottom: 50px;">The Internet, 2023/10/26</div>

# Introduction

Delivery methods can vary a lot between different stores. Shopify interface allows you to create a differente shipping
profiles,
based on weight and price of the cart, but sometimes you just have too many different rules to apply.

The [Carrier Service API](https://shopify.dev/docs/admin-api/rest/reference/shipping-and-fulfillment/carrierservice) is
an easy way to create a custom shipping method, but it has some limitations.

Functions can be used to enhance the carrier service API, and we will see how.

## The goal

![Goal Plot](/tutorials/carrier-service-and-functions/goal-plot.svg#centered)

Our customer hands us a csv like this

```csv
max_weight_kg,price,service
1,10,Carrier 1
1,15,Carrier 2
3,12,Carrier 1
4,18,Carrier 2
...
36,98,Carrier 1
100,150,Carrier 2
```

and then whispers _"Ah, and if the customer is tagged as `VIP` the shipping should be free."_

Our goal then is to **display the right prices for shipping, based on the weight,
and made all the delivery methods free if the customer is tagged as `VIP`.**

# Carrier Service API

Talking with developers, it looks like the Carrier Service API is not very well known, so let's start with a quick
overview.

To implement a carrier service, you don't need to create an app, you just need to create a public endpoint that will
receive a POST request from Shopify, and return a JSON response.

The shop must be on _Advanced Shopify_ plan or higher to be able to install a custom carrier service.

## The input

Let's define the input using Typescript

```typescript

type CarrierServiceRequestBody = {
    rate: {
        origin: ShopifyAddress,
        destination: ShopifyAddress,
        items: [CartItem],
        currency: string,
        locale: string
    }
}
type ShopifyAddress = {
    country: string,
    postal_code: string,
    province: string,
    city: string,
    name: string,
    address1: string,
    address2: string,
    phone: null, // always null
    address3: null, // always null
    fax: null // always null,
    email: null, // always null
    address_type: null, // always null
    company_name: null // always null
}
type CartItem = {
    name: string,
    sku: string,
    quantity: number,
    grams: number,
    price: number,
    vendor: string
    requires_shipping: boolean,
    taxable: boolean,
    fulfillment_service: string,
    properties: any,
    product_id: number,
    variant_id: number,
}
```

The input is a JSON object matching type `CarrierServiceRequestBody`.

Some fields will always be null: `phone`, `address3`, `fax`, `email`, `address_type`, `company_name`.

Also, we don't receive any information about the customer, so we can't know if he is tagged as `VIP` or not.

## The output

The output is a JSON object of type `CarrierServiceResponseBody`

```typescript
type CarrierServiceResponseBody = {
    rates: [
        {
            currency: string,
            description: string,
            service_code: string,
            service_name: string,
            weight_min_lb: number,
            weight_max_lb: number,
            total_price: number // in cents
        }
    ]
}

```

From the output you can understand that you can return multiple shipping methods, each one with a different price and
weight range.

You don't need to calculate the weight of the items, you can simply return all the shipping methods with the right
weight
range. **Shopify will display only the methods that have correct weight range**.

You may want to calculate the price of the cart only if you have a formula to calculate the shipping cost based on the
weight.

A thing that I find particular amusing is that the input is weighted in grams and the output is in pounds.

## Implementation using Cloudflare Workers

Cloudflare Workers are a great way to implement a carrier service, because they are cheap and easy to deploy. There are
many other ways to implement a REST api, like AWS Lambda, Google Cloud Functions, Azure Functions, etc. but I find
Cloudflare Workers to be the easiest to use.

To start the project we need to download
the [Cloudflare Workers CLI](https://developers.cloudflare.com/workers/cli-wrangler/install-update).

Then, following [the documentation](https://developers.cloudflare.com/workers/get-started/guide/) we can create a new
project

```shell
$ yarn create cloudflare
```

And when asked we will choose the option `Hello World` and `TypeScript`.

```shell
╭ Create an application with Cloudflare Step 1 of 3
│
├ In which directory do you want to create your application?
│ dir ./my-carrier-service
│
├ What type of application do you want to create?
│ type "Hello World" Worker
│
╰ Do you want to use TypeScript?
    Yes / No
```

This will create a new folder with a file `src/index.ts` containing a hello world example.

```typescript
export interface Env {
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        return new Response('Hello World!');
    },
};
```

We have almost everything, we just need to create and retrieve the configuration.

## Configuration on Cloudflare

To host the configuration we will use [Cloudflare KV](https://developers.cloudflare.com/kv/).
We will convert our CSV into a JSON object and store it in KV.

First we need to create a KV namespace, then we can upload the configuration.

```shell
$ wrangler kv:namespace create "SHIPPING_CONFIG"
🌀 Creating namespace with title "my-carrier-service-SHIPPING_CONFIG"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "SHIPPING_CONFIG", id = "6..............................4" }
```

In the folder previously created with a `wrangler.toml` file, we can add the namespace to the `kv_namespaces` array.

```toml
[[kv_namespaces]]
binding = "SHIPPING_CONFIGURATION"
id = "6..............................4"
```

We simply convert the .csv into a .json file (without altering the structure):

```json

{
  "rates": [
    {
      "min_weight_kg": 0,
      "max_weight_kg": 1,
      "price": 10,
      "service": "Carrier 1"
    },
    {
      "min_weight_kg": 0,
      "max_weight_kg": 1,
      "price": 15,
      "service": "Carrier 2"
    },
    ...
  ]
}
```

and we can upload it to KV.

```shell
$ wrangler kv:key put --binding-"SHIPPING_CONFIG" "shipping_config" "$(cat config.json)"
```

If you're struggling with the command, you can use the [Cloudflare dashboard](https://dash.cloudflare.com/) to upload
the right value.

![KV upload](/tutorials/carrier-service-and-functions/kv-upload.png#centered)

## Implementation

Now we can implement the carrier service.

```typescript
export interface Env {
    SHIPPING_CONFIGURATION: KVNamespace;
}

type RateConf = {
    'min_weight_kg': number,
    'max_weight_kg': number,
    'price': number,
    'service': string
}

type RatesConf = {
    'rates': RateConf[]
}

const DEFAULT_RATES: RatesConf = { // this is not needed, Shopify will provide a default delivery price in case of error or empty response
    'rates': [{
        'min_weight_kg': 0,
        'max_weight_kg': 0.1,
        'price': 5,
        'service': 'Carrier 1'
    }, {
        'min_weight_kg': 0.1,
        'max_weight_kg': 0.1,
        'price': 5,
        'service': 'Carrier 2'
    }
    ]
};

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // const body : CarrierServiceRequestBody = await request.json(); we don't need this, but here we would have the Shopify request body
        const value: RatesConf = JSON.parse(await env.SHIPPING_CONFIGURATION.get('rates') || 'null') || DEFAULT_RATES;
        const rates = value.rates.map((rate) => {
            return {
                currency: 'EUR', // this could be put in configuration
                description: '', // if left empty is not shown
                service_code: rate.service,
                service_name: rate.service, // this is what is shown at checkout
                weight_min_lb: rate.min_weight_kg * 2.20462,
                weight_max_lb: rate.max_weight_kg * 2.20462,
                total_price: rate.price * 100 // this would be better to be saved in cents in the configuration
            };
        });

        return new Response(JSON.stringify({'rates': rates}));
    }
};
```

## Deploy

To deploy the carrier service we need to run

```shell
$ wrangler deploy
```

Now under the Cloudflare dashboard we can test the endpoint, and we should see something like this

![Worker Output](/tutorials/carrier-service-and-functions/worker-output.png#centered)

## Installation

### Get an access token

To install the carrier service we need to add it using
the [REST Admin Api](https://shopify.dev/docs/api/admin-rest/unstable/resources/carrierservice#post-carrier-services)
(for some reason GraphQL doesn't support carrier service mutations yet).

To use the REST api we need an _Authentication Token_ that we can generate from the Shopify dashboard under
_Settings_ -> _Apps and Sales Channels_ ->
_Develop Apps_ -> _Create An App_. From there go to _Configure Admin API Scopes_ and make sure to
select `write_shipping`.
Save and click on _Install App_. This will give you an access token that we can use to make the REST call.

![Access Token](/tutorials/carrier-service-and-functions/access_token.png#centered)

### Adding the Carrier Service

Now we can make the REST call to install the carrier service.

```shell
$ curl -d '{"carrier_service":{"name":"My Custom Carrier Service","callback_url":"https://my-carrier-service.filippi.workers.dev/","service_discovery":true}}' \
-X POST "https://your-development-store.myshopify.com/admin/api/2023-10/carrier_services.json" \
-H "X-Shopify-Access-Token: {access_token}" \
-H "Content-Type: application/json"

{"carrier_service":{"id":6.........4,"name":"My Custom Carrier Service","active":true,"service_discovery":true,"carrier_service_type":"api","admin_graphql_api_id":"gid:\/\/shopify\/DeliveryCarrierService\/6.........4","format":"json","callback_url":"https:\/\/my-carrier-service.filippi.workers.dev\/"}}
```

As `name` we put the name that will be visible in the shipping settings. `callback_url` is the url of our worker, and
`service_discovery` is set to true to allow Shopify to discover the carrier service.
As response, we get the id of the carrier service, this could be helpful to update or delete the carrier service.

### Adding the carrier service to a shipping profile

Now you can go under _Settings_ -> _Shipping and delivery_ and click on your shipping profile. If under _Carrier and app
rates_
you already see your carrier service, you can skip this step. Otherwise, click on _Add rate_ -> _Use carrier or app to
calculate rates_ and select your new carrier service.

In both cases you should click on the three dots and then _Edit Rate_ to configure the carrier service. You will have to
check all the available services your API provides (if you want).

![Carrier Service Configuration 1](/tutorials/carrier-service-and-functions/carrier_1.png#centered)
![Carrier Service Configuration 2](/tutorials/carrier-service-and-functions/carrier_2.png#centered)

## Testing

We're finally done, we can check now at checkout that we have the right shipping methods.

![Checkout](/tutorials/carrier-service-and-functions/checkout.png#centered)

Success!

## FAQ on Carrier Service API

- Q: *What if my API is not responding or is giving errors?*  
A: If no rate is provided Shopify will use a [backup rate](https://help.shopify.com/en/manual/shipping/setting-up-and-managing-your-shipping/backup-rates) based on the weight of the cart.
- Q: *I don't see a new service I added.*  
A: Every time you add a new service (a new service code) you need to select it in the shipping profile. If you still don't see it there (it happened to me) remove the carrier service and add it back with the REST call.
- Q: *I've changed the price but at checkout is always the same.*  
A: The carrier service response is cached, try to use a different address.
- Q: *I don't see the carrier service in the shipping profile.*  
A: Double check that the REST api gave you a successful response and that you have an id. You can also use [this API](https://shopify.dev/docs/api/admin-rest/2023-10/resources/carrierservice#get-carrier-services) to check all the carrier services installed.
- Q: *Can I retrieve the configuration from a file?*  
A: You can, keep in mind that the API is called every time a customer goes to checkout, so you may want to cache the configuration in a KV namespace, or, in any case, keep it fast.
- Q: *Can I use the customer email?*  
A: No, the customer email is not provided in the request. It is always null.


# Shipping Function

The carrier service API is great, but it has some limitations. For example, we can't know if the customer is tagged as
`VIP` or not, so we can't make the shipping free for him. The only way to do that is to use a function.

## Simplified Function

## Configuration

## Implementation

## Deploy

## Testing

# Conclusion