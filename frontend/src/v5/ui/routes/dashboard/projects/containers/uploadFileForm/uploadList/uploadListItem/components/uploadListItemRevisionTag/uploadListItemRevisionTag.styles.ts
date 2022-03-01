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

import styled from 'styled-components';
import { FormTextField } from '@controls/formTextField/formTextField.component';

export const TextField = styled(FormTextField)`
	margin: 0 7px;
	width: 200px;
	.MuiOutlinedInput-root {
		input { height: 31px }
		${({ $selectedrow, theme }) => $selectedrow && `
			&.MuiOutlinedInput-root:not(.Mui-error) {
				input { color: ${theme.palette.primary.contrast}; }
				&.MuiInputBase-formControl fieldset { border-color: transparent; }
				background-color: ${theme.palette.secondary.light};
			}
		`}
	}
`;
