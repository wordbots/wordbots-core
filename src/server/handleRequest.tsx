import { Request, Response } from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Helmet, { HelmetData } from 'react-helmet';
import { Provider } from 'react-redux';
import { StaticRouter, StaticRouterContext } from 'react-router';

import App from '../common/containers/App';
import configureStore from '../common/store/configureStore';
import * as packagejson from '../../package.json';

export default function handleRequest(request: Request, response: Response): void {
  produceResponse(response, request.url);
}

function produceResponse(response: Response, location: string) {
  const context: StaticRouterContext = {};
  const html = ReactDOMServer.renderToString(
    <Provider store={configureStore({})}>
      <StaticRouter location={location} context={context}>
        <App />
      </StaticRouter>
    </Provider>
  );

  if (context.url) {
    response
      .writeHead(301, { Location: context.url })
      .end();
  } else {
    const head = Helmet.rewind();
    response
      .status(200)
      .end(renderFullPage(html, head));
  }
}

function renderFullPage(html: string, head: HelmetData): string {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        ${head.title.toString()}

        <style type="text/css">
          ${loaderCss}
        </style>

        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />

        <link rel="preload" href="static/public/fonts/rpgawesome-webfont.woff2" as="font" type="font/woff2" crossorigin />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Roboto:100,400,700" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Carter+One" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=VT323" rel="stylesheet">

        <meta property="og:url" content="http://app.wordbots.io" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Wordbots" />
        <meta property="og:description" content="Wordbots is a customizable hex-based card game with a twist – you, the player, get to create the cards!" />
        <meta property="og:image" content="/static/screenshot.png" />

        <link rel="icon" href="/static/favicon.ico" />
        <link rel="apple-touch-icon" sizes="57x57" href="/static/icons/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/static/icons/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/static/icons/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/static/icons/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/static/icons/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/static/icons/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/static/icons/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/static/icons/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/static/icons/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192"  href="/static/icons/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/static/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/static/icons/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/static/icons/favicon-16x16.png" />
        <link rel="manifest" href="/static/icons/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/static/icons/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body style="margin: 0;">
          <div id="root">${html}</div>
          <div id="modal-root"></div>
          <script>
            window.VERSION = '${packagejson.version}+${process.env.HEROKU_SLUG_COMMIT || 'local'}';
          </script>
          <script src="/static/bundle.js"></script>
      </body>
    </html>
  `;
}

const loaderCss = `
  body {
    height: 100%;
    background-color: #EEE;
  }

  .spinning-gears {
    height: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
        -ms-flex-pack: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
        -ms-flex-align: center;
            align-items: center; }

  .spinning-gears .machine {
    width: 60vmin;
    fill: #bbb; }

  .spinning-gears .small-shadow, .spinning-gears .medium-shadow, .spinning-gears .large-shadow {
    fill: rgba(0, 0, 0, 0.05); }

  .spinning-gears .small {
    -webkit-animation: counter-rotation 2.5s infinite linear;
      -moz-animation: counter-rotation 2.5s infinite linear;
        -o-animation: counter-rotation 2.5s infinite linear;
            animation: counter-rotation 2.5s infinite linear;
    -webkit-transform-origin: 100.136px 225.345px;
        -ms-transform-origin: 100.136px 225.345px;
            transform-origin: 100.136px 225.345px; }

  .spinning-gears .small-shadow {
    -webkit-animation: counter-rotation 2.5s infinite linear;
      -moz-animation: counter-rotation 2.5s infinite linear;
        -o-animation: counter-rotation 2.5s infinite linear;
            animation: counter-rotation 2.5s infinite linear;
    -webkit-transform-origin: 110.136px 235.345px;
        -ms-transform-origin: 110.136px 235.345px;
            transform-origin: 110.136px 235.345px; }

  .spinning-gears .medium {
    -webkit-animation: rotation 3.75s infinite linear;
      -moz-animation: rotation 3.75s infinite linear;
        -o-animation: rotation 3.75s infinite linear;
            animation: rotation 3.75s infinite linear;
    -webkit-transform-origin: 254.675px 379.447px;
        -ms-transform-origin: 254.675px 379.447px;
            transform-origin: 254.675px 379.447px; }

  .spinning-gears .medium-shadow {
    -webkit-animation: rotation 3.75s infinite linear;
      -moz-animation: rotation 3.75s infinite linear;
        -o-animation: rotation 3.75s infinite linear;
            animation: rotation 3.75s infinite linear;
    -webkit-transform-origin: 264.675px 389.447px;
        -ms-transform-origin: 264.675px 389.447px;
            transform-origin: 264.675px 389.447px; }

  .spinning-gears .large {
    -webkit-animation: counter-rotation 5s infinite linear;
      -moz-animation: counter-rotation 5s infinite linear;
        -o-animation: counter-rotation 5s infinite linear;
            animation: counter-rotation 5s infinite linear;
    -webkit-transform-origin: 461.37px 173.694px;
        -ms-transform-origin: 461.37px 173.694px;
            transform-origin: 461.37px 173.694px; }

  .spinning-gears .large-shadow {
    -webkit-animation: counter-rotation 5s infinite linear;
      -moz-animation: counter-rotation 5s infinite linear;
        -o-animation: counter-rotation 5s infinite linear;
            animation: counter-rotation 5s infinite linear;
    -webkit-transform-origin: 471.37px 183.694px;
        -ms-transform-origin: 471.37px 183.694px;
            transform-origin: 471.37px 183.694px; }

  @-webkit-keyframes rotation {
      from {-webkit-transform: rotate(0deg);}
      to   {-webkit-transform: rotate(359deg);}
  }
  @-moz-keyframes rotation {
      from {-moz-transform: rotate(0deg);}
      to   {-moz-transform: rotate(359deg);}
  }
  @-o-keyframes rotation {
      from {-o-transform: rotate(0deg);}
      to   {-o-transform: rotate(359deg);}
  }
  @keyframes rotation {
      from {transform: rotate(0deg);}
      to   {transform: rotate(359deg);}
  }

  @-webkit-keyframes counter-rotation {
      from {-webkit-transform: rotate(359deg);}
      to   {-webkit-transform: rotate(0deg);}
  }
  @-moz-keyframes counter-rotation {
      from {-moz-transform: rotate(359deg);}
      to   {-moz-transform: rotate(0deg);}
  }
  @-o-keyframes counter-rotation {
      from {-o-transform: rotate(359deg);}
      to   {-o-transform: rotate(0deg);}
  }
  @keyframes counter-rotation {
      from {transform: rotate(359deg);}
      to   {transform: rotate(0deg);}
  }
`;
