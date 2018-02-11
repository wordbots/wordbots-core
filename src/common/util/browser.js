let ReactGA, currentLocation;
if (inBrowser()) {
  ReactGA = require('react-ga');
  ReactGA.initialize('UA-345959-18');
}

export function inBrowser() {
  return !(typeof document === 'undefined' || (window.process && window.process.title.includes('node')));
}

export function logAnalytics() {
  if (inBrowser() && window.location.pathname !== currentLocation) {
    currentLocation = window.location.pathname;
    ReactGA.set({ page: currentLocation });
    ReactGA.pageview(currentLocation);
  }
}

export function transformHistory(history, func) {
  if (history && history.location) {
    const currentPath = history.location.pathname;
    const newPath = func(currentPath === '/' ? '/home' : currentPath);
    history.push(newPath);
  }
}

export function getHash(history) {
  return history && history.location.hash.split('#')[1];
}

export function setHash(history, hash) {
  transformHistory(history, path => `${path}#${hash}`);
}

export function isFlagSet(flag) {
  return typeof localStorage !== 'undefined' && localStorage[`wb$${flag}`] === 'true';
}

export function toggleFlag(flag) {
  localStorage[`wb$${flag}`] = !isFlagSet(flag);
}

export function logIfFlagSet(flag, msg) {
  if (flag) {
    /* eslint-disable no-console */
    console.log(msg);
    /* eslint-enable no-console */
  }
}

export function getGameAreaNode() {
  return document.getElementById('gameArea') || document.body;
}
