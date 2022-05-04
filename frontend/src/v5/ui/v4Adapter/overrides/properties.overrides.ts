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

import { StyledTextField } from '@/v4/routes/components/textField/textField.styles';
import { css } from 'styled-components';

export default css`
	.description {
		margin-top: 16px;
		${StyledTextField} {
			margin: 0;
		}
		
		label {
			font-size: 12px;
			transform: scale(1);
			left: 1px;
			top: -18px;
		}
		.MuiFormControl-root {
			margin-top: 0;
		}
		button {
			margin: 8px 4px 2px 0;
		}
	}
`;
