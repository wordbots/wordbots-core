import { detect, Browser } from 'detect-browser';
import { History } from 'history';
import nodeFetch from 'node-fetch';
import * as ReactGA from 'react-ga';
import * as ReactDOM from 'react-dom';
import { ReactNode, ReactPortal } from 'react';
import * as qs from 'qs';
import { isUndefined } from 'lodash';

declare const window: {
  location: { protocol: string, pathname: string, host: string, hostname: string }
  process?: { title: string, env: { NODE_ENV: string, JEST_WORKER_ID?: string } }
};

let currentLocation: string;

if (inBrowser()) {
  ReactGA.initialize('UA-345959-18');
}

/** Return whether currently in-browser (versus in a test, etc). */
export function inBrowser(): boolean {
  return !(typeof document === 'undefined' ||
    (window.process?.title.includes('node')) ||
    (window.process?.title.includes('test')) ||
    (window.process?.env.JEST_WORKER_ID !== undefined));
}

/** Return whether currently in-browser and hosted at localhost. */
export function onLocalhost(): boolean {
  // eslint-disable-next-line compat/compat
  return inBrowser() && window.location.hostname === 'localhost';
}

/** Returns whether currently in a running test. */
export function inTest(): boolean {
  return typeof window !== 'undefined' && window.process?.env?.NODE_ENV === 'test' || false;
}

/** Returns 'wss://{host}' if the current protocol is https and 'ws://{host}' otherwise.  */
export function webSocketRoot(): string {
  const { protocol, host } = window.location;
  return `${protocol.includes('https') ? 'wss' : 'ws'}://${host}`;
}

/** Log a page view of the current page in Google Analytics. */
export function logAnalytics(): void {
  if (inBrowser() && window.location.pathname !== currentLocation) {
    currentLocation = window.location.pathname;
    ReactGA.set({ page: currentLocation });
    ReactGA.pageview(currentLocation);
  }
}

/** Navigate (via History) to func(path), where path is the current path. */
export function transformHistory(history: History, func: (path: string) => string): void {
  if (history?.location) {
    const currentPath = history.location.pathname;
    const newPath = func(currentPath === '/' ? '/home' : currentPath);
    history.push(newPath);
  }
}

/** Return the hash part of the current location. */
export function getHash(history: History): string {
  return history?.location.hash.split('#')[1];
}

/** Navigate to #{hash}. */
export function setHash(history: History, hash: string): void {
  transformHistory(history, (path) => `${path}#${hash}`);
}

/** Return the search value corresponding to the given key (or undefined). */
export function getQueryString(history: History, key: string): string | undefined {
  return qs.parse(history.location.search.replace('?', ''))[key];
}

/** Return a value previously saved by `saveToLocalStorage`, or undefined. */
export function loadFromLocalStorage(key: string): string | undefined {
  if (typeof localStorage !== 'undefined') {
    return localStorage[`wb$${key}`];
  } else {
    return undefined;
  }
}

/** Save a value for later retrieval by `loadFromLocalStorage`. */
export function saveToLocalStorage(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage[`wb$${key}`] = value;
  }
}

/** Return whether a given boolean localStorage flag is truthy. */
export function isFlagSet(flag: string, fallbackIfUndefined = false): boolean {
  const flagValue: string | undefined = loadFromLocalStorage(flag);
  if (flagValue === undefined) {
    return fallbackIfUndefined;
  } else {
    return flagValue === 'true';
  }
}

/** Toggle a boolean flag in localStorage. */
export function toggleFlag(flag: string, value?: boolean): void {
  saveToLocalStorage(flag, value !== undefined ? value.toString() : isFlagSet(flag) ? 'false' : 'true');
}

export function setFlagIfUnset(flag: string, value: boolean): void {
  if (isUndefined(loadFromLocalStorage(flag))) {
    toggleFlag(flag, value);
  }
}

/** Return the #gameArea element, falling back to the body element if it can't be found. */
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
  "edge-chromium": 79,
  opera: 40,
  // Other browsers
  samsung: 13,
};

/** Return whether the detected (browser, version) pair is on the supported browser versions list. */
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

/**
 * Returns whether the detected browser supports animation of the content of CSS pseudo-elements, defaulting to true if browser detection failed.
 * See https://css-tricks.com/animating-the-content-property/ (not completely up to date, had to do some manual testing)
 */
export function doesBrowserSupportContentAnimation(): boolean {
  const browserInfo = detect();
  if (browserInfo) {
    const { name, version } = browserInfo;
    const majorVersion = parseInt((version || '').split('.')[0]);
    if ((name === 'safari' && (!majorVersion || majorVersion < 16)) || (name.includes('ios'))) {
      return false;
    }
  }

  return true;  // if we can't detect the browser, just assume yes
}

/** Like ReactDOM.createPortal, but no-op if not in browser. */
export function createSafePortal(children: ReactNode, container: Element): ReactPortal | null {
  if (inBrowser()) {
    return ReactDOM.createPortal(children, container);
  } else {
    return null;
  }
}

/** Like fetch() but can also be called from the server. */
export const fetchUniversal: typeof fetch = inBrowser() ? fetch : (nodeFetch as unknown as typeof fetch);
