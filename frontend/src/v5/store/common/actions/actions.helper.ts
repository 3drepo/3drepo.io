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

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// eslint-disable-next-line max-len
type CapitalLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

type Constant<S extends string> =
S extends `${infer First}${CapitalLetter}${infer Second}` ? `${Uppercase<First>}_S${Uppercase<Second>}` : Uppercase<S>;

export type Constants<Type> = {
	[Property in keyof Type as Constant<`${string & Property}`>]: Constant<`${string & Property}`>;
};

let dispatch = null;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const wrapActions = <T>(ActionsCreators: T) => {
	const exportObject = {};
	Object.keys(ActionsCreators).forEach((key) => {
		exportObject[key] = (...args) => dispatch(ActionsCreators[key].apply(null, args));
	});

	return exportObject as T;
};

export const initializeActions = (dispatchFunc): void => dispatch = dispatchFunc;