/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { ChangeEvent } from 'react';

export const uploadFile = (accept) => new Promise((resolve) => {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = accept;

	const getFileFromInputEvent = (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files.length) return null;
		return event.target.files[0];
	};

	input.onchange = (e) => {
		const file = getFileFromInputEvent(e as any);
		resolve(file);
	};

	input.click();
});
