export class Subscriptions {
	private callbacks: any[] = [];
	private callbackContext: any = {};

	public subscribe = (callback, context) => {
		if (!this.callbacks.find(callback)) {
			this.callbacks.push(callback);
		}

		this.callbackContext[callback] = context;
	}

	public unsubscribe = (callback) => {
		this.callbacks = this.callbacks.filter((cb) => cb !== callback);
		delete this.callbackContext[callback];
	}

	public invokeCallbacks = (...args) => {
		this.callbacks.forEach((cb) => cb.apply(this.callbackContext[cb], args));
	}
}
