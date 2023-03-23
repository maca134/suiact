/* eslint-disable @typescript-eslint/no-explicit-any */
import { events, update, Fragment } from './suiact';

export type Hooks = {
	effects: any[],
	state: any[]
};

export type FiberWithHooks = Suiact.Fiber & { hooks: Hooks };

export type Context<T = unknown> = {
	id: number,
	defaultValue: T,
	value?: T,
	Provider: (props: { value?: T, children?: Suiact.Element | Suiact.Element[] }) => Suiact.Element,
};

export type FiberWithContext<T = unknown> = Suiact.Fiber & { ctx?: Context<T> };

export type Ref<T = any> = { current: T };

let currentFiber: FiberWithHooks;
let currentIndex = 0;
let ctxId = 0;

events.on('update', (fiber: FiberWithHooks) => {
	currentFiber = fiber;
	currentIndex = 0;
	if (fiber.hooks) {
		fiber.hooks.effects = [];
	}
});

events.on('commit', (fiber: FiberWithHooks) => {
	if (!fiber.hooks) {
		return;
	}
	for (let i = 0; i < fiber.hooks.effects.length; i++) {
		const effect = fiber.hooks.effects[i];
		if (effect.cleanup) {
			effect.cleanup();
		}
		effect.cleanup = effect.value();
	}
	fiber.hooks.effects = [];
});

events.on('remove', (fiber: FiberWithHooks) => {
	if (!fiber.hooks) {
		return;
	}
	for (let i = 0; i < fiber.hooks.state.length; i++) {
		const hook = fiber.hooks.state[i];
		if (hook.cleanup) {
			hook.cleanup();
		}
	}
});

function invokeOrReturn(args: any, fn: any) {
	if (typeof fn === 'function') {
		return fn(args);
	} else {
		return fn;
	}
}

function compare<T extends []>(prev: T, next: T) {
	for (let i = 0; i < prev.length; i++) {
		if (prev[i] !== next[i]) {
			return false;
		}
	}
	return true;
}

function argsChanged<T extends []>(prev: T, next: T) {
	if (!prev || !next || prev.length !== next.length) {
		return true;
	}
	return !compare(prev, next);
}

function getHookState() {
	const index = currentIndex++;
	let hooks = currentFiber.hooks
	const prevFiber = currentFiber.prev as FiberWithHooks;
	if (prevFiber && prevFiber.hooks) {
		hooks = prevFiber.hooks
	}
	if (!hooks) {
		hooks = {
			effects: [],
			state: []
		};
	}
	currentFiber.hooks = hooks;
	if (!hooks.state[index]) {
		hooks.state[index] = {};
	}
	return hooks.state[index];
}

export function useReducer<T, U>(reducer: (value: T, action: U) => T, initialState?: T, init?: (value: T) => void): [T, (action: U) => void] {
	const hookState = getHookState();

	hookState.reducer = reducer;
	if (!hookState.action) {
		if (!init) {
			hookState.value = invokeOrReturn(null, initialState);
		} else {
			hookState.value = init(initialState);
		}
		hookState.action = (action: U) => {
			const currentValue = hookState.value;
			const nextValue = hookState.reducer(currentValue, action);
			if (currentValue !== nextValue) {
				hookState.value = nextValue;
				update();
			}
		};
	}
	return [hookState.value, hookState.action];
}

export function useState<T>(initialState?: T): [T, (value: T) => void] {
	return useReducer<T, T>(invokeOrReturn, initialState);
}

export function useEffect(callback: () => (() => void) | void, deps?: any[]) {
	const hookState = getHookState();
	if (argsChanged(hookState.deps, deps)) {
		hookState.value = callback;
		hookState.deps = deps;
		currentFiber.hooks.effects.push(hookState);
	}
}

export function useMemo<T>(callback: () => T, deps?: any[]): T {
	const hookState = getHookState();
	if (argsChanged(hookState.deps, deps)) {
		hookState.value = callback();
		hookState.deps = deps;
	}
	return hookState.value;
}

export function useRef<T>(initialValue: T): Ref<T> {
	return useMemo(() => ({ current: initialValue }), []);
}

export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T {
	return useMemo(() => callback, deps);
}

export function createContext<T>(initial?: T): Context<T> {
	const id = ctxId++;
	return {
		id,
		defaultValue: initial,
		Provider(props: { value?: T, children?: Suiact.Element | Suiact.Element[] }) {
			return {
				type: Fragment,
				props: {
					children: props.children
				},
				ctx: {
					id,
					value: props.value || initial
				}
			};
		},
	};
}

export function useContext<T>(context: Context<T>): T {
	let fiber = currentFiber as FiberWithContext<T>;
	while (fiber) {
		if (fiber.ctx && fiber.ctx.id === context.id) {
			return fiber.ctx.value;
		}
		fiber = fiber.parent as FiberWithContext<T>;
	}
	return context.defaultValue;
}
