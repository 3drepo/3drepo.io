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

export const reTry = async (func, retries:number, interval:number) => {
	const retryData = { intervalId:  null, retries };
	let error = undefined;

	const promData =  { resolve: undefined, reject: undefined };

	const prom = new Promise((resolve, reject) =>  {
		promData.resolve = resolve;
		promData.reject = reject;
	});

	let value = undefined;

	retryData.intervalId = setInterval(async () => {
		if (!retryData.retries) {
			clearInterval(retryData.intervalId);
			if (error) promData.reject(error);
			else promData.resolve(value);
		}

		try {
			value = await func();
			retryData.retries = 0;
			error = null;

		} catch (e) {
			error = e;
			retryData.retries--;
		}

	}, interval); 

	return prom;
};