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

import { CircleButton } from '@controls/circleButton';
import * as EllipsisButtonStyles from '@controls/ellipsisButton/ellipsisButton.styles';
import { TextField } from '@material-ui/core';
import styled from 'styled-components';

export const Input = styled(TextField)`
	margin: 0;
	width: 200px;
`;

export const Button = styled(CircleButton)`
	margin: 0 5px;
	color: ${({ theme }) => theme.palette.secondary.light};

	&& path {
		stroke: ${({ theme }) => theme.palette.secondary.main};
		fill: none;
	} 

	&:hover {
		${EllipsisButtonStyles.StyledIconButton} {
			circle {
				fill: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
	}
`;

export const DeleteButton = styled(Button)`
	&& path {
			stroke: none;
			fill: ${({ theme }) => theme.palette.secondary.main};
	}
`;
