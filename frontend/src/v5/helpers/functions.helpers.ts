/**
 *  Copyright (C) 2023 3D Repo Ltd
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
type QueueItem<T> = { promise: Promise<T>, resolve, reject, args, resolved: boolean };
export class LifoQueue<T> {
	private queue: QueueItem<T>[] = [] ;

	private dict = {};

	private batchSize;

	private reuseCall;

	private running = false;

	private func: (...args) => Promise<T>;

	private createPromise(args) {
		const prom = {} as QueueItem<T>;
		prom.promise = new Promise((resolve, reject) => {
			prom.resolve = resolve;
			prom.reject = reject;
		});
		prom.args = args;
		prom.resolved = false;
		return prom;
	}

	private getPromise(args): QueueItem<T> {
		if (!this.reuseCall) return this.createPromise(args);
	
		let prom = this.dict[JSON.stringify(args)];
		if (!prom) {
			prom = this.createPromise(args);
			this.dict[JSON.stringify(args)] = prom;
		}
		
		return prom;
	}

	private async runqueue() {
		this.running = true;
		while (this.queue.length) {
			const batch =  this.queue.splice(Math.max(this.queue.length - this.batchSize, 0));
			await Promise.all(batch.reverse().map(async (p) => {
				if (p.resolved) {
					return p.promise;
				}
				
				// eslint-disable-next-line no-param-reassign
				p.resolved = true;
				try {
					p.resolve(await this.func(...p.args));
				} catch (e) {
					p.reject(e);
				}
			}));
		}
		this.resetQueue();

	}

	public enqueue(...args): Promise<T> {
		const prom = this.getPromise(args);
		this.queue.push(prom);

		if (this.queue.length && !this.running) {
			this.runqueue();
		}

		return prom.promise;
	}

	public resetQueue() {
		this.queue = [];
		this.dict = {};
		this.running = false;
	}

	public constructor(func: (...args) => Promise<T>, batchSize, reuseCall = true) {
		this.func = func;
		this.batchSize = batchSize;
		this.reuseCall = reuseCall;
	}
}