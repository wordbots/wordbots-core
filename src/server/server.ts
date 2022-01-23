import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import sslRedirect from 'heroku-ssl-redirect';
import * as webpack from 'webpack';

import webpackConfig from '../../webpack.config';

import launchDiscordBot from './discordBot';
import handleRequest from './handleRequest';
import launchWebsocketServer from './multiplayer/socket';

const app = express();
const { NODE_ENV, PORT } = process.env;

interface Global {
  navigator: any
}
declare const global: Global;

// This resolves the following warning:
//   Warning: Material-UI: userAgent should be supplied in the muiTheme context
//        for server-side rendering.
function userAgentMiddleware(req: express.Request, _res: express.Response, next: express.NextFunction): void {
  global.navigator = {
    userAgent: req.headers['user-agent']
  };
  return next();
}

if (NODE_ENV !== 'production') {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const { publicPath } = webpackConfig.output;

  const compiler = webpack(webpackConfig as webpack.Configuration);
  compiler.plugin('done', (): void => {
    // During tests, we just want to see that we're able to compile the app.
    if (NODE_ENV === 'test') {
      process.exit();
    }
  });

  app.use(webpackDevMiddleware(compiler, { logLevel: 'warn', publicPath }));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use('/static', express.static(`${__dirname}/../..`, { maxAge: '1d' }));
}

app.use(sslRedirect());
app.use(cookieParser());
app.use(userAgentMiddleware);

app.get('/*', handleRequest);

const server = app.listen(PORT || 3000, (): void => {
  const address: { address: string, port: number } = server.address() as { address: string, port: number };
  /* eslint-disable no-console */
  console.log(`App listening at http://${address.address}:${address.port}`);
  /* eslint-enable no-console */
});

launchWebsocketServer(server, '/socket');

launchDiscordBot();
