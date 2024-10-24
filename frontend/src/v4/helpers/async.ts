/**
 *  Copyright (C) 2020 3D Repo Ltd
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

export const delay = async (time, val) => new Promise((resolve) => setTimeout(() => resolve(val), time));

export const asyncTimeout = (time, func, ...args) => {
	return new Promise(async (resolve, reject) => {
		const result = await Promise.race([
			delay(time, new Error('timeout')),
			func(...args)
		]);

		if (result instanceof Error) {
			reject(result);
		} else {
			resolve(result);
		}
	});
};

export const queuableFunction = (func: (...arg) => Promise<any>, context) => {
	let lastWait = Promise.resolve(true);
	let lastCallNumber = 0;

	const resetQueue = () => {
		lastWait = Promise.resolve(true);
		lastCallNumber = 0;
	};

	return async (...args) => {
		const currentCall = lastCallNumber;
		lastWait = lastWait.then(() => func.apply(context, args), resetQueue); // if there is a problem, reset the queue
		lastCallNumber++;
		await lastWait;
		if (currentCall === lastCallNumber) {
			resetQueue();
		}
	};
};
