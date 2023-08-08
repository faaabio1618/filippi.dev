---
layout: page
title: "Shopify Checkout UI: Remix and ChatGPT"
image: "/tutorials/clippify/clippy.png"
dont_escape_title: true
---

<div style="text-align:right;margin-bottom: 50px;">The Internet, 2023/08/06</div>

- [Introduction](#introduction)
    * [The Goal](#the-goal)
    * [Getting Started](#getting-started)
- [Building the App](#building-the-app)
    * [Fixing typing issue and eslint](#fixing-typing-issue-and-eslint)
    * [After the Generation](#after-the-generation)
    * [The Checkout UI](#the-checkout-ui)
    * [Creating the Block with Picture and Message](#creating-the-block-with-picture-and-message)
    * [Our ~~Clippy™~~ Assistant!](#our---clippy----assistant-)
    * [Modifying `Checkout.tsx`](#modifying--checkouttsx-)
- [Testing the App](#testing-the-app)
    * [The API](#the-api)
    * [ChatGPT Integration](#chatgpt-integration)
    * [Remix](#remix)
- [Putting It All Together](#putting-it-all-together)
    * [Fetch Call](#fetch-call)
    * [Completing the UI](#completing-the-ui)
    * [Image Generation Process](#image-generation-process)
    * [Final UI](#final-ui)
- [Demo](#demo)
    * [Deploy](#deploy)
    * [The Result](#the-result)
- [Conclusion](#conclusion)
    * [The Code](#the-code)

# Introduction

In this tutorial, we will create a **Shopify Checkout UI Extension**, which allows merchants to include a personalized
message on their checkout page. We will achieve this by building an API using ChatGPT.

However, our primary goal is to evoke a **nostalgic feeling** from the 2000s, when you were using Word and Clippy™ would
appear, offering assistance while you tried to write a document.

![Ol' Clippy™](/tutorials/clippify/clippy.png#centered)

## The Goal

![Goal Plot](/tutorials/clippify/goal-plot.svg)

Our approach involves creating a Checkout UI extension that establishes a connection with the app's API. This API will
interact with ChatGPT to generate a personalized message. Subsequently, this message will be presented to the customer
on the checkout page.

## Getting Started

A great starting point is the Shopify documentation. You can access
the [Checkout UI Extension documentation here](https://shopify.dev/docs/api/checkout-ui-extensions).

# Building the App

To begin, let's create a new app using the Shopify CLI. We'll name the app "Clippify" and utilize Remix for the
application. The first command will take a few minutes to complete.

```shell
$ yarn create "@shopify/app"
$ cd clippify
$ yarn shopify app generate extension
```

We select `Checkout UI` as Type of extension, we put `clippify-checkout-ui` as the name of the extension, and we will
use `Typescript React`.

## Fixing typing issue and eslint

Maybe it's just me, but out of the box I had an error with the React components. I had to add the following
to `extension/clippify-checkout-ui/package.json`:

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

## After the Generation

With the generation process complete, let's take a look at the project structure that lies before us:

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

## Creating the Block with Picture and Message

Our goal is to design a block featuring an image and a message, ideally situated in the bottom right corner of the
checkout page. As we explore the
available [extension points](https://shopify.dev/docs/api/checkout-ui-extensions/2023-07/extension-targets-overview#checkout-locations-order-summary),
we find
that [`purchase.checkout.block.render`](https://shopify.dev/docs/api/checkout-ui-extensions/2023-07/apis/extensiontargets#typesofextensiontargets-propertydetail-purchasecheckoutblockrender)
aligns perfectly with our requirements. Lucky for us, this extension is already included in the template.

To accomplish our goal, we need to identify the most suitable components for the task. The list of available components
can be found [here](https://shopify.dev/docs/api/checkout-ui-extensions/2023-07/components).

In our strategy, we will leverage
the [Grid](https://shopify.dev/docs/api/checkout-ui-extensions/2023-07/components/structure/grid) component to carefully
position the image and message elements.

## Our ~~Clippy™~~ Assistant!

Let's find a mascot! We'll head over to [Lottie Files](https://lottiefiles.com) to discover a cute animation.

Who could resist a puppy tiger? Take a look: ![Tiger](/tutorials/clippify/tiger.gif)

## Modifying `Checkout.tsx`

As a first step, we will simply add a straightforward message and our mascot. While we're there, we'll also retrieve the
cart lines with the `useCartLines` hook (we will need them later):

```tsx
function Extension() {
    const cartLines = useCartLines()
    // later we will use a metaobject to retrieve the picture asset. (Couldn't find a way to make the local path work)
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

This process will generate a link enabling us to install the app on our development store.
extension.

![First Result](/tutorials/clippify/screen1.png)

Not bad for a first result, the position needs to be fixed, the message display is not great but we'll get there.
Our focus can now shift to creating the right message.

## The API

During the generation of the app, a remix project with a server is created. We'll leverage this server to establish an
API that
simply provides a message. Our parameters for this API will include the customer (which could be null) and the cart
lines.

## ChatGPT Integration

To obtain the ChatGPT code, the most effective approach is to visit
the [Playground](https://platform.openai.com/playground). Through experimentation, we can fine-tune our desired sentence
and then extract the corresponding code. Here's what we came up with:

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
            "content": "You are a shop assistant that is helping a customer. Their name is\nFabio. You want them to be happy about their purchase.\\\\n  They have purchased White shirt and Yellow Tie. And you should explain how good they go together. Say\nthat in a brief way.\n"
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

We create a new file `app/routes/ai.jsx` which define a straightforward `GET` endpoint, returning a message.
For the purpose of this tutorial (and to save time), we will not implement a request handler for the entire cart and
customer. Instead, we will focus on the specific parameters we need for the current task.

```jsx
export const loader = async ({request}) => {
    const url = new URL(request.url);
    const firstName = url.searchParams.get("firstName");
    const title1 = url.searchParams.get("title1");
    const title2 = url.searchParams.get("title2");
    const customerName = firstName ? "Their name is " + firstName + "." : ""
    let cartMessage;
    if (title2) {
        cartMessage = `They have purchased ${title1} and ${title2}. And you should explain how good they go together.`
    } else {
        cartMessage = `They have purchased ${title1} and you should find a good reason to use it.`
    }
    const prompt = `You are a shop assistant that is helping a customer. ${customerName} You want them to be happy about their purchase.
  ${cartMessage} Say that in a short sentence suggesting that they should definitely but it. Be assertive.`

    let res = await getChatStream({ // this is a wrapper of the previous code
        message: prompt
    }).then(res => res.choices[0]?.message?.content || "Sorry, your taste is too good, I'm speechless.");

    return new Response(res, {headers: withCors()}); // we need to add CORS headers, I'll explain down here
};
```

# Putting It All Together

Now, we can retrieve the generated message and display it. However, fetching the right URL of our API is a bit more
complex than it might initially seem.

## Fetch Call

As explained [here](https://shopify.dev/docs/api/checkout-ui-extensions/unstable/configuration#network-access), the
checkout UI has a few limitations concerning network access. In summary:

1. The UI runs in a Web Worker, resulting in a null origin. (This is why CORS headers are necessary for the API.)
2. The UI lacks a secure method to authorize requests.
3. App Proxy cannot be utilized for password-protected stores.

In a real production app, I would utilize the App Proxy. Unfortunately, it's unavailable in a development store, forcing
me to hardcode the URL (environment variables aren't available neither). The lack of authentication is not a real
problem, since we aren't handling sensitive information.

```jsx
const cartLines = useCartLines()
const {buyerIdentity} = useApi();
const [message, setMessage] = useState(null);
const firstName = buyerIdentity?.customer?.current?.firstName || "";
const title1 = cartLines[0]?.merchandise?.title;
const title2 = cartLines[1]?.merchandise?.title || "";
useMemo(() => {
    fetch(`https://mydeployedapp/ai?firstName=${encodeURIComponent(firstName)}&title1=${encodeURIComponent(title1)}&title2=${encodeURIComponent(title2)}`)
        .then(res => res.text()).then(text => {
        setMessage(text);
    })
}, [firstName, title1, title2]);
```

## Completing the UI

At this stage, you might assume we're almost there, just a bit of CSS, and we're finished! However, that's not entirely
accurate. The React API (based on [remote-ui](https://github.com/Shopify/remote-ui)) of the checkout UI only permits us
to build functional components on top of the existing ones.
Unfortunately, CSS isn't supported. We're limited to using the predefined parameters of the components, which hampers
our ability to create the exact interface we desire.

Maybe this will change in the future, maybe not.

## Image Generation Process

To solve that problem we will generate an image, on the server, with the message! This image will
then be returned as a base64-encoded string.

If the concept of displaying text within an image doesn't evoke a sense of nostalgia from the 2000s, I'm not sure what
will.

To achieve this, we will utilize [CanvasJS](https://canvasjs.com/) for image generation. The code responsible for
creating the image is quite extensive, and you can review it in the repository. However, it's not a critical aspect of
the tutorial. I find the result quite satisfactory:

![Message generated](/tutorials/clippify/message.png#centered)

## Final UI

The final UI is quite straightforward; our main task is to display the GIF along with the message (picture).

By default, the image will contain a default message, which will be replaced once the fetch operation is
successful.

```jsx
const [message, setMessage] = useState("data:image/png;base64,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");

return <Grid columns={["30%", "fill"]}>
    <View>
        <Image source="https://filippi.dev/tutorials/clippify/tiger.gif"/>
    </View>
    <View>
        <Image source={message}/>
    </View>
</Grid>
```

# Demo

## Deploy

We are deploying our app on Heroku. Following (this)[https://shopify.dev/docs/apps/deployment/web]

```bash
$ heroku login
$ heroku container:login
$ heroku create -a clippify -s container
$ yarn shopify app env show
```

We create a `heroku.yml` file with the following content:

```yaml
build:
  docker:
    web: Dockerfile
  config:
    SHOPIFY_API_KEY: 6.......................c
```

Because we are using `canvasjs` that uses `glibc` we can't use `alpine` (unless we install the `glibc` package). So we
are
modifying `Dockerfile` replacing `node:18-alpine` with `node:18-bullseye-slim` and
adding `RUN apt-get update && apt-get install -y -q libfontconfig1` to install the fonts.

We need to update the heroku environment variables with the ones from the shopify app and our open api key.

```bash
$ heroku config:set -a clippify SCOPES=write_products SHOPIFY_APP_URL=<SHOPIFY_APP_URL> SHOPIFY_API_KEY=<SHOPIFY_API_KEY> SHOPIFY_API_SECRET=<SHOPIFY_API_SECRET>
$ heroku config:set -a clippify OPEN_API_KEY=<my open ai api key>
$ git push heroku
```

The app is now on heroku. We can add the block in our checkout and test it.

## Positioning the block

I struggled **a lot** to make the app appear in the block list under the checkout customization. The simplified
deployment
introduced a "Development Store Preview" that needs to be **OFF** when installing the app to make it visible in the
checkout block list.
To understand that took about 20% of the time spent on this project. But now our puppy is in the right spot...

![block](/tutorials/clippify/block.png#centered)

## The Result

Pretty, pretty, pretty good, not bad!

<center>
<video src="/tutorials/clippify/c-twitter.mp4" controls="controls" style="max-width: 730px; text-align: center;margin: 20px 0 20px 0">
</video>
</center>

# Conclusion

It was really nice to work on Checkout UI, it's fun. The UI limitations are a real struggle and when the checkout
customization
will come to an end will be fun to see how shops will *React*.

## The Code

This is the repository if you want the full code: [github.com/faaabio1618/clippify](github.com/faaabio1618/clippify)

<sub><sup>Clippy is a registered trademark of Microsoft Corporation in the United States and/or other countries. The use
of the Clippy image is for parody purposes only and is not endorsed by Microsoft. I'm not affiliated with Microsoft (buy
I can send a CV if asked). </sup></sub>
