# WordBots
[![CircleCI](https://circleci.com/gh/wordbots/wordbots-core.svg?style=svg)](https://circleci.com/gh/wordbots/wordbots-core)
[![Test Coverage](https://codeclimate.com/github/wordbots/wordbots-core/badges/coverage.svg)](https://codeclimate.com/github/wordbots/wordbots-core/coverage)
[![Code Climate](https://codeclimate.com/github/wordbots/wordbots-core/badges/gpa.svg)](https://codeclimate.com/github/wordbots/wordbots-core)

## Development Installation

```
$ npm install
$ npm start
```

Then visit
```
http://localhost:3000
```

## Releasing to Production

Production has Devtools, logging and hot reloading middleware removed and the scripts/css compressed.

```
$ npm run build
$ npm run start-prod
```

Then visit
```
http://localhost:3000
```

## Lint and test
```
node_modules/eslint/bin/eslint.js . --fix && npm test -- --coverage
```

## Acknowledgements

Some code taken from the following (all MIT licensed):

* [`redux-react-material-boilerplate`](https://github.com/WapGeaR/redux-react-material-boilerplate)
* [`react-hexgrid`](https://github.com/hellenic/react-hexgrid)
* notsurt's [`spritegen`](https://github.com/not-surt/spritegen)
* gimenete's [`identicons-react`](https://github.com/gimenete/identicons-react)
