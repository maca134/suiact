/* eslint-disable no-prototype-builtins */

if (!Array.isArray) {
	Array.isArray = function (value): value is unknown[] {
		return value.reflect.name === 'Array';
	};
}

if (!Object.keys) {
	Object.keys = (function () {
		const hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new Error('Object.keys called on non-object');

			const result = [];

			for (const prop in obj) {
				if (hasOwnProperty.call(obj, prop)) result.push(prop);
			}

			if (hasDontEnumBug) {
				for (let i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
				}
			}
			return result;
		}
	})()
}

if (!Object.assign) {
	Object.assign = function <T>(target: T, ...sources: Partial<T>[]): T {
		for (const source of sources) {
			if (!source)
				continue;
			for (const key in source) {
				target[key] = source[key];
			}
		}
		return target;
	}
}

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function indexOf(searchElement, fromIndex) {
		let k;
		if (this == null) {
			throw new Error('"this" is null or not defined');
		}
		const o = Object(this);
		const len = o.length >>> 0;
		if (len === 0) {
			return -1;
		}
		const n = fromIndex | 0;
		if (n >= len) {
			return -1;
		}
		k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
		while (k < len) {
			if (k in o && o[k] === searchElement) {
				return k;
			}
			k++;
		}
		return -1;
	};
}