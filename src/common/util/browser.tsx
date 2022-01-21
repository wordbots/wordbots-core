import { detect, Browser } from 'detect-browser';
import { History } from 'history';
import * as ReactGA from 'react-ga';
import * as ReactDOM from 'react-dom';
import { ReactNode, ReactPortal } from 'react';

declare const window: {
  location: { pathname: string, hostname: string }
  process?: { title: string, env: { NODE_ENV: string, JEST_WORKER_ID?: string } }
};

let currentLocation: string;

if (inBrowser()) {
  ReactGA.initialize('UA-345959-18');
}

export function inBrowser(): boolean {
  return !(typeof document === 'undefined' ||
    (window.process?.title.includes('node')) ||
    (window.process?.title.includes('test')) ||
    (window.process?.env.JEST_WORKER_ID !== undefined));
}

export function onLocalhost(): boolean {
  // eslint-disable-next-line compat/compat
  return inBrowser() && window.location.hostname === 'localhost';
}

export function inTest(): boolean {
  return typeof window !== 'undefined' && window.process?.env?.NODE_ENV === 'test' || false;
}

export function logAnalytics(): void {
  if (inBrowser() && window.location.pathname !== currentLocation) {
    currentLocation = window.location.pathname;
    ReactGA.set({ page: currentLocation });
    ReactGA.pageview(currentLocation);
  }
}

export function transformHistory(history: History, func: (path: string) => string): void {
  if (history?.location) {
    const currentPath = history.location.pathname;
    const newPath = func(currentPath === '/' ? '/home' : currentPath);
    history.push(newPath);
  }
}

export function getHash(history: History): string {
  return history?.location.hash.split('#')[1];
}

export function setHash(history: History, hash: string): void {
  transformHistory(history, (path) => `${path}#${hash}`);
}

export function loadFromLocalStorage(key: string): string | undefined {
  if (typeof localStorage !== 'undefined') {
    return localStorage[`wb$${key}`];
  } else {
    return undefined;
  }
}

export function saveToLocalStorage(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage[`wb$${key}`] = value;
  }
}

export function isFlagSet(flag: string): boolean {
  return loadFromLocalStorage(flag) === 'true';
}

export function toggleFlag(flag: string): void {
  saveToLocalStorage(flag, isFlagSet(flag) ? 'false' : 'true');
}


export function getGameAreaNode(): HTMLElement {
  return document.querySelector('#gameArea') || document.body;
}

// Wordbots requires full SVG support, as well as flexbox, webkit-text-stroke, etc
// (In practice, most modern browsers from 2017+ support all of these features, except pre-Chromium Edge)
const SUPPORTED_BROWSER_VERSIONS: Partial<Record<Browser, number>> = {
  // Major desktop browsers
  chrome: 53,
  firefox: 49,
  safari: 10,
  edge: 79, // (only Chromium-based Edge supported)
  opera: 40,
  // Other browsers
  samsung: 13,
};

export function isSupportedBrowser(): boolean {
  if (isFlagSet('hideUnsupportedBrowserMessage')) {
    return true;
  }

  // To debug this message, uncomment the following line:
  // return false;

  const browserInfo = detect();
  if (browserInfo?.type === 'browser') {
    const { name, version } = browserInfo;
    const requiredVersion = SUPPORTED_BROWSER_VERSIONS[name];
    const majorVersion = parseInt(version.split('.')[0]);
    if (requiredVersion && majorVersion && majorVersion >= requiredVersion) {
      return true;
    }
  }

  return false;
}

export function createSafePortal(children: ReactNode, container: Element): ReactPortal | null {
  if (inBrowser()) {
    return ReactDOM.createPortal(children, container);
  } else {
    return null;
  }
}
