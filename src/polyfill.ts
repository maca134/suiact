/* eslint-disable no-prototype-builtins */

if (!Array.isArray) {
	Array.isArray = function (value): value is unknown[] {
		return value.reflect.name === 'Array';
	};
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