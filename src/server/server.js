import express from 'express';
import cookieParser from 'cookie-parser';
import webpack from 'webpack';
import injectTapEventPlugin from 'react-tap-event-plugin';

import webpackConfig from '../../webpack.config';

import handleRequest from './handleRequest';
import launchWebsocketServer from './socket';

injectTapEventPlugin();

const app = express();
const { NODE_ENV, PORT } = process.env;

function userAgentMiddleware(req, res, next) {
  global.navigator = {
    userAgent: req.headers['user-agent']
  };
  return next();
}

if (NODE_ENV !== 'production') {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const { publicPath } = webpackConfig.output;

  const compiler = webpack(webpackConfig);
  compiler.plugin('done', () => {
    // During tests, we just want to see that we're able to compile the app.
    if (NODE_ENV === 'test') {
      process.exit();
    }
  });

  app.use(webpackDevMiddleware(compiler, { logLevel: 'warn', publicPath }));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use('/static', express.static(`${__dirname  }/../../dist`));
}

app.use(cookieParser());
app.use(userAgentMiddleware);

app.get('/*', handleRequest);

const server = app.listen(PORT || 3000, () => {
  /* eslint-disable no-console */
  console.log(`App listening at http://${server.address().address}:${server.address().port}`);
  /* eslint-enable no-console */
});
launchWebsocketServer(server, '/socket');

