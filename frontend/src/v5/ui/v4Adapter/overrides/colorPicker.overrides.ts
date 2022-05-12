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

import { css } from 'styled-components';
import { ColorSelect, Dot, OpacityVisibilityCheckbox, StyledIconButton } from '@/v4/routes/components/colorPicker/colorPicker.styles';


export default css`
	// color picker
	${ColorSelect} {
		width: unset;
		padding-left: 8px;
		border-radius: 5px;
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};

		${Dot} {
			width: 13px;
			height: 13px;
		}

		${StyledIconButton} {
			margin: 0;

			&:hover {
				background-color: transparent;
			}
		}
	}

	// TODO modal
	${OpacityVisibilityCheckbox} {
		margin-left: -8px;
		margin-right: 0;
	}
`;