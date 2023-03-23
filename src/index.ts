import './types';
import './polyfill';
import renderer from './renderer';
import { events, init, update, createElement, Fragment } from './suiact';

export * from './hooks';

export default {
	Fragment,
	createElement,
	render: (element: JSX.Element) => init(element, renderer),
	update: () => update(),
	addEventListener: (...args: Parameters<typeof events.on>) => events.on(...args),
	removeEventListener: (...args: Parameters<typeof events.off>) => events.off(...args),
};