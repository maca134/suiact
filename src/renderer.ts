import { events } from "./suiact";
import { indexOf } from "./utils";

let shouldUpdateLayout = true;

events.on('commit', (fiber: Suiact.Fiber) => {
	if (fiber.element && fiber.effectTag === 'PLACEMENT') {
		shouldUpdateLayout = true;
	}
	if (shouldUpdateLayout && fiber.element && (fiber.element instanceof Window || fiber.element instanceof Panel)) {
		shouldUpdateLayout = false;
		if (fiber.effectTag === 'PLACEMENT' && fiber.element instanceof Window) {
			fiber.element.show();
		} else {
			fiber.element.layout.layout(true);
			fiber.element.layout.resize();
		}
	}
});

events.on('remove', () => shouldUpdateLayout = true);

function create(fiber: Suiact.Fiber<_Control>) {
	if (fiber.type === 'root' || fiber.type === 'fragment') {
		return;
	}
	if (fiber.type !== 'window' && (!fiber.parent.element || !fiber.parent.element.add)) {
		throw new Error("Can not add control to parent element.");
	}
	const type = fiber.type as keyof JSX.IntrinsicElements;

	let control: _Control;
	const props = fiber.props as any;
	const ignoreFields = ['properties', 'children', 'ref'];

	switch (type) {
		case 'window':
			if (props.usePanel && props.usePanel instanceof Panel) {
				return props.usePanel;
			} else {
				control = new Window(
					props.type,
					props.text,
					props.bounds,
					props.properties
				);
				ignoreFields.push('type', 'text', 'bounds');
			}
			break;

		case 'group':
			control = fiber.parent.element.add(
				type,
				props.bounds,
				props.properties
			);
			ignoreFields.push('bounds');
			break;

		case 'button':
		case 'checkbox':
		case 'edittext':
		case 'panel':
		case 'radiobutton':
		case 'statictext':
		case 'tab':
		case 'tabbedpanel':
			control = fiber.parent.element.add(
				type,
				props.bounds,
				props.text,
				props.properties
			);
			ignoreFields.push('text', 'bounds');
			break;

		case 'slider':
		case 'progressbar':
			control = fiber.parent.element.add(
				type,
				props.bounds,
				props.value,
				props.minvalue,
				props.maxvalue,
				props.properties
			);
			ignoreFields.push('bounds', 'value', 'minvalue', 'maxvalue');
			break;

		case 'dropdownlist':
		case 'listbox':
		case 'treeview':
			control = fiber.parent.element.add(
				type,
				props.bounds,
				props.items,
				props.properties
			);
			ignoreFields.push('bounds', 'items');
			break;

		case 'image':
		case 'iconbutton':
			control = fiber.parent.element.add(
				type,
				props.bounds,
				props.icon,
				props.properties
			);
			ignoreFields.push('bounds', 'icon');
			break;

		case 'item':
			control = fiber.parent.element.add(
				type,
				props.text,
			);
			ignoreFields.push('text');
			break;
	}

	for (const key in props) {
		if (indexOf(ignoreFields, key) !== -1) {
			continue;
		}
		if (key.indexOf('on') === 0 && typeof props[key] === 'function') {
			control[key] = () => props[key](control);
		} else {
			control[key] = props[key];
		}
	}

	if (props.width) {
		control.preferredSize.width = props.width;
	}
	if (props.height) {
		control.preferredSize.height = props.height;
	}

	return control;
}

function update(fiber: Suiact.Fiber) {
	if (
		!fiber.element
		|| fiber.type === 'root'
		|| fiber.type === 'fragment'
		|| (fiber.type === 'window' && fiber.element instanceof Panel) // we dont want to be change the parent panel
	) {
		return;
	}
	const current = fiber.prev.props as any;
	const next = fiber.props as any;

	for (const key in current) {
		if (next[key] === undefined) {
			fiber.element[key] = undefined;
		}
	}
	for (const key in next) {
		if (key in ['properties', 'children', 'ref']) {
			continue;
		}
		if (!current || !current[key] || current[key] !== next[key]) {
			if (key.indexOf('on') === 0 && typeof next[key] === 'function') {
				fiber.element[key] = () => next[key](fiber.element);
			} else {
				fiber.element[key] = next[key];
			}
		}
	}
}

function remove(fiber: Suiact.Fiber) {
	if (fiber.element instanceof Window) {
		fiber.element.close();
	} else {
		fiber.element.parent.remove(fiber.element);
	}
}

export default {
	create,
	update,
	remove,
};