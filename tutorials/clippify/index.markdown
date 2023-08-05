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
The first command will take a few minutes to complete.

```shell
$ yarn create "@shopify/app"
$ cd clippify
$ yarn shopify app generate extension
```

We select `Checkout UI` as Type of extension, we put `clippify-checkout-ui` as the name of the extension, and we will
use `Typescript React`.

## Fixing typing issue and eslint

Maybe it's just me, but out of the box I had an error with the React components. I had to add the following
to __`extension/clippify-checkout-ui/package.json`__:

```json
{
  "devDependencies": {
    "@types/react": "^17.0.0",
    "typescript": "^5.0.0",
    "@shopify/eslint-plugin": "^42.1.0"
  }
}
```

I also had an issue with eslint, so I had to add the following to `.eslintrc.js`:

```js
  plugins: ["@shopify/eslint-plugin"]
```

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

We want to create a block with a picture and a message ideally in the bottom right corner of the checkout page.
Looking at all the
possible [extension points](https://shopify.dev/docs/api/checkout-ui-extensions/2023-07/extension-targets-overview#checkout-locations-order-summary),
[`purchase.checkout.block.render`](https://shopify.dev/docs/api/checkout-ui-extensions/2023-07/apis/extensiontargets#typesofextensiontargets-propertydetail-purchasecheckoutblockrender)
seems what we are looking for. Luckily that's the extension that comes with the template.

We need to find out which are the best components to use for our purpose. We can find the list of
components [here](https://shopify.dev/docs/api/checkout-ui-extensions/2023-07/components).

We will use [Grid](https://shopify.dev/docs/api/checkout-ui-extensions/2023-07/components/structure/grid) to position
the picture and the message.

## Our ~~Clippy~~ Assistant!

We need a mascot, let's head to [Lottie Files](https://lottiefiles.com) to find a cute animation.

Who wouldn't listen to a tiger? ![Tiger](/tutorials/clippify/tiger.gif)

## Modifying `Checkout.tsx`

On the first step of our we will just add a simple message and a picture.
We will need to retrieve the cart lines, so we can already do it with the hook `useCartLines`, and everything else is
just React.

```tsx
function Extension() {
    const cartLines = useCartLines()
    // after we will use a metaobject to retrieve the picture asset.
    return (
        <Grid columns={['30%', 'fill']} spacing={'none'}>
            <View>
                <Image source="https://filippi.dev/tutorials/clippify/tiger.gif"/>
            </View>
            <View>
                <TextBlock>
                    It looks like you want to buy {cartLines[0].merchandise.title}!
                </TextBlock>
            </View>
        </Grid>
    );
}
```

# Testing the App

We have now some code we can test, let's start the app:

```shell
$ yarn dev
```

This will generate a link that will allow us to install the app on our development store, so that we can use the
extension.

## First result

![First Result](/tutorials/clippify/screen1.png)

The idea is there. The positioning is not correct, but that can be fixed once we deploy the app and we can use the
checkout customization. The message display is not ideal, but we will fix that later. We can start working on creating a
proper message.

# Creating the API

When we generated the app we generated a remix project with a server. We will use that server to create an API that
simply returns a message.
As parameters, we will use the customer (can be null) and the cart lines.

## ChatGPT

The best way to get the code for ChatGPT is going to the [Playground](https://platform.openai.com/playground) and play
until
we get the sentence we want, and then get the code for that. This is what we got:

```javascript
const {Configuration, OpenAIApi} = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
        {
            "role": "user",
            "content": "You are a shop assistant that is helping a customer. Their name is\nFabio. You want them to be happy about their purchase.\\\\n  They have purchased White shirt and Yellow Tie. And you should explain how good they go together.. Say\nthat in a brief way.\n"
        }
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
});
```

We will replace the parameters in our code and that's it.

## Remix

We will create a new file `app/routes/ai.jsx` that will provide a simple `POST` endpoint that will return a message.

```jsx
export const action = async ({customer, cartLines}) => {
    const customerName = customer.first_name ? "Their name is " + customer.first_name + "." : ""
    let cartMessage;
    if (cartLines.length > 1) {
        cartMessage = `They have purchased ${title1} and ${title2}. And you should explain how good they go together.`
    } else {
        cartMessage = `They have purchased ${title1}.`
    }
    const prompt = `You are a shop assistant that is helping a customer. ${customerName} You want them to be happy about their purchase. ${cartMessage} Say that in a short sentence.`

    const res = await getChatStream({ // this is a wrapper of the previous code
        message: prompt
    }).then(res => res.choices[0]?.message?.content || "Sorry, your taste is too good, I'm speechless.");

    return new Response(res);
};
```

# Putting it all together

## Fetch call

## Fixing the UI

# Demo Store
