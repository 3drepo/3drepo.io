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

import ButtonBase from '@mui/material/Button';
import styled from 'styled-components';

export const LabelButton = styled(ButtonBase)`
	white-space: nowrap;
	align-items: center;
	padding: 8px 12px 8px 15px;
	color: ${({ theme }) => theme.palette.tertiary.main};
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	${({ theme }) => theme.typography.kicker};

	&:hover, &:active {
		background-color: ${({ theme }) => theme.palette.tertiary.lighter};
		text-decoration-line: none;
	}

	&:disabled {
		background-color: ${({ theme }) => theme.palette.base.lightest};
		color: ${({ theme }) => theme.palette.primary.contrast};
	}

	&.Mui-focusVisible {
		box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	}
`;
