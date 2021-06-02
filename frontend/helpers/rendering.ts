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

import { result } from 'lodash';

export const getWindowWidth = () =>
	window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

export const getWindowHeight = () =>
	window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

export const renderWhenTrue = (
	Component: JSX.Element | JSX.Element[] | (() => JSX.Element | JSX.Element[])
) => (trueStatement) => {
	return (trueStatement ? result({ Component }, 'Component') : null) as JSX.Element | JSX.Element[];
};

export const renderWhenTrueOtherwise =
	(
		ComponentTrue: JSX.Element | (() => JSX.Element),
		ComponentFalse: JSX.Element | (() => JSX.Element)
	) => (trueStatement) => {
	return (
		trueStatement ?
		result({ ComponentTrue }, 'ComponentTrue') :
		result({ ComponentFalse }, 'ComponentFalse')
	) as JSX.Element | JSX.Element[];
};
