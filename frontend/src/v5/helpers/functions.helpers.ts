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
type FunctionCall<T> = { promise: Promise<T>, resolve, reject, args, resolved: boolean, count: number };

export enum ExecutionStrategy {
	Lifo,
	Fifo,
}

export class AsyncFunctionExecutor<T> {
	private calls: Array<FunctionCall<T>> = [] ;

	private dict = {};

	private batchSize;

	private reuseCall;

	private running = false;

	private strategy: ExecutionStrategy;

	private func: (...args) => Promise<T>;

	private createCall(args) {
		const call = {} as FunctionCall<T>;
		call.promise = new Promise((resolve, reject) => {
			call.resolve = resolve;
			call.reject = reject;
		});
		call.args = args;
		call.resolved = false;
		return call;
	}

	private getCall(args): FunctionCall<T> {
		if (!this.reuseCall) return this.createCall(args);
	
		let call = this.dict[JSON.stringify(args)];
		if (!call) {
			call = this.createCall(args);
			this.dict[JSON.stringify(args)] = call;
		}
		
		return call;
	}

	private async start() {
		this.running = true;
		while (this.calls.length) {
			const start = this.strategy === ExecutionStrategy.Lifo ? Math.max(this.calls.length - this.batchSize, 0) : 0;
			const deleteCount = Math.min(this.batchSize, this.calls.length);

			const batch =  this.calls.splice(start, deleteCount);
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
		this.reset();

	}

	public addCall(...args): Promise<T> {
		const prom = this.getCall(args);
		this.calls.push(prom);

		if (this.calls.length && !this.running) {
			this.start();
		}

		return prom.promise;
	}

	public reset() {
		this.calls = [];
		this.dict = {};
		this.running = false;
	}

	public constructor(func: (...args) => Promise<T>, batchSize, type: ExecutionStrategy = ExecutionStrategy.Lifo, reuseCall = true) {
		this.func = func;
		this.batchSize = batchSize;
		this.reuseCall = reuseCall;
		this.strategy = type;
	}
}