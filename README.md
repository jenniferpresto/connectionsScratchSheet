# Connections Scratch Sheet

A scratch page to work through the [Connections game](https://nytimes.com/games/connections).

## Running locally

This is a node app. To install packages, from the root directory, type:

```bash
npm install
```

To run at `http://localhost:5500`:

```bash
npm start
```

## Using local data

In `app.js`:

-   Change `IS_DEV` from `false` to `true` to use local data, rather than hitting the Times API.

Current data format (as of 2025-09-20):

`testData/testJson2025-09-20.json`
