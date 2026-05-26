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

import { TextField, TextFieldProps } from '@controls/inputs/textField/textField.component';

const VALID_CODES = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'];
const META_KEYS = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
const isValidCharacterOrDigit = (val) => /[0-9\.+-]/.test(val);

export const NumberField = (props: TextFieldProps) => {
	const handleKeyDown = (event) => {
		// type="number" does not prevent letters or special characters from being
		// inputed in browsers that are not Chrome, hence, we filter them manually 
		if (
			!isValidCharacterOrDigit(event.key)
			&& !VALID_CODES.includes(event.code)
			&& !META_KEYS.some((k) => event[k])
		) {
			event.preventDefault();
		}
	};

	return (<TextField type="text" onKeyDown={handleKeyDown} {...props} />);
};
