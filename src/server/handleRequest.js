import childProcess from 'child_process';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Provider } from 'react-redux';
import Helmet from 'react-helmet';

import App from '../common/containers/App';
import configureStore from '../common/store/configureStore';
import getUser from '../common/api/user';
import packagejson from '../../package.json';

export default function handleRequest(request, response) {
  getUser(request.cookies.token || false, (user) => {
    const store = getStore(request, user);
    produceResponse(response, store, request.url);
  });
}

function getVersionWithSha() {
  const shaCommand = 'echo ${HEAD_HASH:-$(git rev-parse HEAD)}';
  const sha = childProcess.execSync(shaCommand).toString().trim().slice(0, 7);
  return `${packagejson.version}+${sha}`;
}

function getStore(request, user) {
  if (user) {
    return configureStore({
      version: getVersionWithSha(),
      user: {
        userId: user.id,
        info: user,
        token: request.cookies.token
      }
    });
  } else {
    return configureStore({
      version: getVersionWithSha()
    });
  }
}

function produceResponse(response, store, location) {
  const context = {};
  const html = ReactDOMServer.renderToString(
    <Provider store={store}>
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
    const initialState = Object.assign(store.getState());

    response
      .status(200)
      .end(renderFullPage(html, initialState, head));
  }
}

function renderFullPage(html, initialState, head) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        ${head.title.toString()}
        <link rel="icon" href="/static/favicon.ico" />
        <link rel="stylesheet" type="text/css" href="/static/app.css" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Carter+One" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Roboto:100,400,700" rel="stylesheet" />
        <meta property="og:url" content="http://app.wordbots.io" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Wordbots" />
        <meta property="og:description" content="Wordbots is a customizable hex-based card game with a twist – you, the player, get to create the cards!" />
        <meta property="og:image" content="http://app.wordbots.io/static/screenshot.png" />


        <link rel="apple-touch-icon" sizes="57x57" href="/static/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/static/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/static/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/static/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/static/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/static/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/static/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/static/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192"  href="/static/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/static/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16x16.png" />
        <link rel="manifest" href="/static/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/static/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
          <div id="root">${html}</div>
          <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
          </script>
          <script src="/static/bundle.js"></script>
      </body>
    </html>
  `;
}
