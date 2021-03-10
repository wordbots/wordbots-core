import { Request, Response } from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Helmet, { HelmetData } from 'react-helmet';
import { Provider } from 'react-redux';
import { StaticRouter, StaticRouterContext } from 'react-router';

import App from '../common/containers/App';
import configureStore from '../common/store/configureStore';
import * as packagejson from '../../package.json';

function shouldRedirectToHTTPS(request: Request) {
  return !request.secure &&
    process.env.NODE_ENV === 'production' &&
    !request.headers.host?.includes('staging');
}

export default function handleRequest(request: Request, response: Response): void {
  if (shouldRedirectToHTTPS(request)) {
    response.redirect(`https://${request.headers.host}${request.url}`);
  } else {
    produceResponse(response, request.url);
  }
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

        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />

        <link rel="stylesheet" type="text/css" href="/static/app.css" />

        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Carter+One" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Roboto:100,400,700" rel="stylesheet" />
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
          <script>
            window.VERSION = '${packagejson.version}+${process.env.HEROKU_SLUG_COMMIT || 'local'}';
          </script>
          <script src="/static/bundle.js"></script>
      </body>
    </html>
  `;
}
