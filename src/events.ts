type EventMap = Record<string, unknown>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

type Emitter<T extends EventMap> = {
	on<K extends EventKey<T>>(name: K, fn: EventReceiver<T[K]>): void;
	once<K extends EventKey<T>>(name: K, fn: EventReceiver<T[K]>): void;
	off<K extends EventKey<T>>(name: K, fn: EventReceiver<T[K]>): void;
	emit<K extends EventKey<T>>(name: K, params: T[K]): void;
}

type Events<T extends EventMap> = { [K in EventKey<T>]?: EventReceiver<T[K]>[] };

export class EventEmitter<T extends EventMap> implements Emitter<T> {
	private events: Events<T> = {};

	on<K extends EventKey<T>>(name: K, fn: EventReceiver<T[K]>) {
		if (!this.events[name]) {
			this.events[name] = [];
		}
		this.events[name].push(fn);
	}

	off<K extends EventKey<T>>(name: K, fn: EventReceiver<T[K]>) {
		if (!this.events[name]) {
			return;
		}
		const events = [];
		for (let i = 0; i < this.events[name].length; i++) {
			if (this.events[name][i] !== fn) {
				events.push(this.events[i]);
			}
		}
		this.events[name] = events;
	}

	once<K extends EventKey<T>>(name: K, fn: EventReceiver<T[K]>) {
		const wrapper = (params: T[K]) => {
			fn(params);
			this.off(name, wrapper);
		};
		this.on(name, wrapper);
	}

	emit<K extends EventKey<T>>(name: K, params: T[K]) {
		if (!this.events[name]) {
			return;
		}
		for (let i = 0; i < this.events[name].length; i++) {
			this.events[name][i](params);
		}
	}
}
