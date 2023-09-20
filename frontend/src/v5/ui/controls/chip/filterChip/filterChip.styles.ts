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

import styled, { css } from 'styled-components';
import { Chip } from '../chip.component';

export const FilterChip = styled(Chip).attrs(({ theme }) => ({
	color: theme.palette.base.main,
	clickable: false,
}))<{ selected?: boolean }>`
	.MuiChip-root {
		${({ theme }) => theme.typography.kicker};
		height: 18px;
		font-size: 8px;
		border: 1px solid currentColor;
		.MuiChip-label {
			padding: 0;
		}
		&:hover {
			color: ${({ theme }) => theme.palette.primary.main};
		}
		${({ selected }) => selected && css`
				color: ${({ theme }) => theme.palette.primary.main};
				border-color: currentColor;
				&, &:hover {
					background-color: ${({ theme }) => theme.palette.primary.lightest};
				}
		`}
	}
`;
