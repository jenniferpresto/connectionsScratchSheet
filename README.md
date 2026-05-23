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

or 

```bash
npm run dev
```

## Using local data

In `app.js`:

-   Change `IS_DEV` from `false` to `true` to use local data, rather than hitting the Times API.

Current data format (as of 2025-09-20):

`testData/testJson2025-09-20.json`

For images:

`testPics2026-02-07.json`

## Dev notes

### Image tiles

This app was updated to handle images on May 23, 2026.

The updates require that *all* elements be either images or words; the app can't mix them. If you start with an images board and you want to add new words, the entire board is wiped, and the isImages flag is flipped to false. People can then add new text words.

"Delete One" is not fixed for an images board, so if you delete one word on an images board and try to add a new word, you'll get the same image tile back that you just deleted.
