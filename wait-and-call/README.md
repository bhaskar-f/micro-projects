# wait-and-call

## What does it do?

A tiny debounce utility that helps reduce unnecessary search requests to the server. It waits until the user stops typing and then sends the latest query.

## How to install it?

```bash
npm install wait-and-call
```

## How to use it?

```js
import debounce from "wait-and-call";

const searchLater = debounce(search, 300);
// `search` is the function you want to debounce.

searchLater("your query");
```

## How it works

When `searchLater()` is called repeatedly within the specified delay, the previous timer is cancelled and a new one is started.

The `search` function is called only after the user stops making calls for the specified delay.
