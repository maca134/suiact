export function isArray<T>(value: unknown): value is T[] {
	return value.reflect.name === 'Array';
}

export function assign<T>(target: T, ...sources: Partial<T>[]): T {
	for (const source of sources) {
		if (!source)
			continue;
		for (const key in source) {
			target[key] = source[key];
		}
	}
	return target;
}

export function indexOf<T>(array: T[], value: T) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
}
