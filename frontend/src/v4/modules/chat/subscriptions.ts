/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
