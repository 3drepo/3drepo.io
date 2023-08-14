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

import styled from 'styled-components';

export const ColorPickerStyler = styled.div`
	display: contents;
	
	.react-colorful {
		width: unset;
		height: unset;

		&__saturation {
			height: 183px;
			width: 183px;
			margin-bottom: 15px;
			border-radius: 5px;
			border: none;
		}
	
		&__hue {
			height: 14px;
			width: 183px;
			border-radius: 25px;
		}
	
		&__saturation-pointer,
		&__hue-pointer {
			width: 18px;
			height: 18px;
			border-radius: 18px;
			border: solid 2px ${({ theme }) => theme.palette.primary.contrast};
			box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
		}
	}
`;
