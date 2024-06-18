/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { BaseClearButton } from '@/v5/ui/routes/viewer/toolbar/selectionToolbar/selectionToolbar.styles';
import styled, { css } from 'styled-components';

export const ClearCalibrationButton = styled(BaseClearButton)<{ disabled }>`
	background-color: transparent;
	border: solid 1px currentColor;
	margin-left: 11px;

	&:hover {
		border: none;
		color: ${({ theme }) => theme.palette.primary.main};
	}

	${({ disabled }) => disabled ? css`
		color: ${({ theme }) => theme.palette.base.main};
		pointer-events: none;
		cursor: default;
	` : css`
		color: ${({ theme }) => theme.palette.primary.contrast};

		&:hover {
			border: none;
			color: ${({ theme }) => theme.palette.secondary.main};
			background-color: ${({ theme }) => theme.palette.primary.contrast};
		}
	`}
`;
