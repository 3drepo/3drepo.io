/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { isV5 } from '@/v4/helpers/isV5';
import TableSortLabel from '@mui/material/TableSortLabel';
import styled, { css } from 'styled-components';
import { COLOR, FONT_WEIGHT } from '../../../../../styles';

export const SortLabel = styled(TableSortLabel) `
	height: 18px;

	&& {
		flex-direction: row-reverse;
		margin-left: ${({ active }) => active ? 0 : '-5px'};
		color: ${COLOR.BLACK_60};
		font-size: 14px;
		font-weight: ${FONT_WEIGHT.SEMIBOLD}
	}

	&::before {
		width: 18px;
		height: 18px;
		left: -2px;
		border-radius: 100%;
		position: absolute;
		top: 0;
		transition: 200ms ease-in-out;
		content: '';
		background: ${({ active }) => active ? '#15563c' : 'transparent'};
	}

	svg {
		opacity: 1;
		margin-left: 0;
		width: 14px;
		height: 14px;

		fill: ${({ active, theme }) => {
			if (isV5()) {
				return active ? theme.palette.base.main : 'transparent';
			} else {
				return active ? COLOR.WHITE : COLOR.BLACK_60;
			}
		}}
	}
`;
