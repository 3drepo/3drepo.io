/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { css } from 'styled-components';

const breakpoints = {
	large: 1170,
	desktop: 960,
	tablet: 768,
	phone: 600
};

interface IMedia {
	large: any;
	desktop: any;
	tablet: any;
	phone: any;
}

export const media = Object.keys(breakpoints).reduce((accumulator, label) => {
	const emSize = breakpoints[label] / 16;
	accumulator[label] = (...args: any) => css`
		@media (max-width: ${emSize}em) {
			// @ts-ignore
			${css(...args)};
		}
	`;

	return accumulator;
}, {}) as IMedia;
