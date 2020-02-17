export class Subscriptions {
	private callbacks: Set<any> = new Set();
	private callbackContext: any = {};

	public subscribe = (callback, context) => {
		this.callbacks.add(callback);
		this.callbackContext[callback] = context;
	}

	public unsubscribe = (callback) => {
		this.callbacks.delete(callback);
		delete this.callbackContext[callback];
	}

	public invokeCallbacks = (...args) => {
		this.callbacks.forEach((cb) => cb.apply(this.callbackContext[cb], args));
	}
}
