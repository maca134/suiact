import { EventEmitter } from "./events";
import { assign, isArray } from "./utils";

export type Renderer<T = any> = {
	create(fiber: Suiact.Fiber): T;
	update(fiber: Suiact.Fiber): void;
	remove(fiber: Suiact.Fiber): void;
}

export type Events = {
	update: Suiact.Fiber,
	commit: Suiact.Fiber,
	remove: Suiact.Fiber,
}

export const Fragment = 'fragment';

export const events = new EventEmitter<Events>();

let currentRoot: Suiact.Fiber;
let currentRenderer: Renderer;

function reconcile(fiber: Suiact.Fiber, elements: JSX.Element | JSX.Element[] = []) {
	if (!isArray(elements)) {
		elements = [elements];
	}

	let index = 0
	let prevFiber = fiber.prev?.child
	// eslint-disable-next-line prefer-const
	let prevSibling: Suiact.Fiber;

	while (index < elements.length || prevFiber) {
		const element = elements[index]
		const sameType = prevFiber && element && element.type == prevFiber.type

		let newFiber: Suiact.Fiber;
		if (sameType) {
			newFiber = {
				type: prevFiber.type,
				ref: prevFiber.ref,
				ctx: element.ctx,
				props: element.props,
				parent: fiber,
				element: prevFiber.element,
				prev: prevFiber,
				effectTag: "UPDATE",
			}
		}

		if (element && !sameType) {
			newFiber = {
				type: element.type,
				props: element.props,
				ref: element.ref,
				ctx: element.ctx,
				parent: fiber,
				effectTag: "PLACEMENT",
			}
		}

		if (prevFiber && !sameType) {
			prevFiber.effectTag = "DELETION";
			removeHostElement(prevFiber);
		}

		if (prevFiber) {
			prevFiber = prevFiber.sibling;
		}

		if (index == 0) {
			fiber.child = newFiber;
		} else if (element) {
			prevSibling.sibling = newFiber;
		}
		prevSibling = newFiber;
		index = index + 1
	}
}

function commit(fiber: Suiact.Fiber) {
	if (!fiber) {
		return
	}

	if (!fiber.parent) {
		commit(fiber.child)
		currentRoot = fiber;
		return
	}

	if (fiber.effectTag === "UPDATE" && typeof fiber.type !== 'function') {
		updateHostElement(fiber);
	}

	commit(fiber.child);
	commit(fiber.sibling);
	events.emit('commit', fiber);
}

function createHostElement(fiber: Suiact.Fiber) {
	return currentRenderer.create(fiber);
}

function updateHostElement(fiber: Suiact.Fiber) {
	currentRenderer.update(fiber);
}

function removeHostElement(fiber: Suiact.Fiber, isChild = false) {
	if (fiber.child) {
		removeHostElement(fiber.child, true);
	}

	if (isChild && fiber.sibling) {
		removeHostElement(fiber.sibling, true);
	}

	if (
		fiber.type !== 'root'
		&& fiber.type !== Fragment
		&& typeof fiber.type !== 'function'
		&& fiber.element
	) {
		currentRenderer.remove(fiber);
	}
	events.emit('remove', fiber);
}

export function createElement<P extends Suiact.Props>(type: Suiact.Component, props?: P | null, ...children: Suiact.Element[]): Suiact.Element {
	const defaultProps = typeof type === 'function' ? type.defaultProps : {};
	const normalizedProps: Suiact.Props = assign({}, defaultProps, props, { ref: undefined, ctx: undefined });
	if (children) {
		normalizedProps.children = children;
	}
	return {
		type,
		props: normalizedProps,
		ref: props?.ref,
		ctx: props?.ctx
	}
}

export function init(element: JSX.Element, renderer: Renderer): void {
	currentRenderer = renderer;
	const fiber = {
		type: 'root',
		props: {
			children: [element]
		}
	}
	update(fiber);
	commit(fiber);
}

export function update(fiber?: Suiact.Fiber): void {
	if (!fiber) {
		const fiber = {
			type: currentRoot.type,
			element: currentRoot.element,
			props: currentRoot.props,
			prev: currentRoot,
		}
		update(fiber);
		commit(fiber);
		return;
	}
	if (fiber.type === Fragment || typeof fiber.type === 'function') {
		let parent = fiber.parent
		while (!parent.element && parent.parent)
			parent = parent.parent
		fiber.element = parent.element
	}
	if (typeof fiber.type === 'function') {
		events.emit('update', fiber);
		reconcile(fiber, [fiber.type(fiber.props)]);
	} else {
		if (!fiber.element) {
			fiber.element = createHostElement(fiber);
		}
		if (fiber.ref)
			fiber.ref.current = fiber.element
		reconcile(fiber, fiber.props.children);
	}

	if (fiber.child)
		return update(fiber.child)

	let nextFiber = fiber
	while (nextFiber) {
		if (nextFiber.sibling)
			return update(nextFiber.sibling)
		nextFiber = nextFiber.parent
	}
}
