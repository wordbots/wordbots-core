import { History } from 'history';
import * as ReactGA from 'react-ga';

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

export function isFlagSet(flag: string): boolean {
  return typeof localStorage !== 'undefined' && localStorage[`wb$${flag}`] === 'true';
}

export function toggleFlag(flag: string): void {
  localStorage[`wb$${flag}`] = !isFlagSet(flag);
}

export function getGameAreaNode(): HTMLElement {
  return document.querySelector('#gameArea') || document.body;
}
