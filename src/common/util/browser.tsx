import { History } from 'history';
import * as React from 'react';
import * as ReactGA from 'react-ga';

// tslint:disable no-typeof-undefined

declare const window: {
  location: { pathname: string }
  process?: { title: string, env: { NODE_ENV: string } }
};

let currentLocation: string;

if (inBrowser()) {
  ReactGA.initialize('UA-345959-18');
}

export function inBrowser(): boolean {
  return !(typeof document === 'undefined' ||
    (window.process && window.process.title.includes('node')) ||
    (window.process && window.process.title.includes('test')));
}

export function inTest(): boolean {
  return typeof window !== 'undefined' && window.process && window.process.env && window.process.env.NODE_ENV === 'test' || false;
}

export function logAnalytics(): void {
  if (inBrowser() && window.location.pathname !== currentLocation) {
    currentLocation = window.location.pathname;
    ReactGA.set({ page: currentLocation });
    ReactGA.pageview(currentLocation);
  }
}

export function transformHistory(history: History, func: (path: string) => string): void {
  if (history && history.location) {
    const currentPath = history.location.pathname;
    const newPath = func(currentPath === '/' ? '/home' : currentPath);
    history.push(newPath);
  }
}

export function getHash(history: History): string {
  return history && history.location.hash.split('#')[1];
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
  return document.getElementById('gameArea') || document.body;
}

export function zeroWidthJoin(...items: React.ReactNode[]): React.ReactNode {
  return items.reduce((a, b) => <span>{a}&zwnj;{b}</span>);
}

// Sometimes we need to perform a firebase update inside a redux reducer, but
// the firebase update needs to run right *after* we finish handling the action,
// to avoid "You may not call store.getState() while the reducer is executing" exceptions.
// The easiest solution for now is to just use setTimeout, but it's pretty gross. TODO find a better way.
export function defer(fn: () => void): void {
  // Run fn() immediately in tests because the test won't wait for the promise.
  if (inTest()) {
    fn();
  }

  // Defer execution until the end of the event loop.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#Guarantees :
  // "Callbacks will never be called before the completion of the current run of the JavaScript event loop."
  Promise.resolve().then(fn);
}
