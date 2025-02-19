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

import { formatMessage } from '@/v5/services/intl';
import styled, { css } from 'styled-components';

export const RangeContainer = styled.div<{ $showOneError: boolean }>`
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	width: 100%;
	gap: 5px;
	align-items: flex-start;
	color: ${({ theme }) => theme.palette.secondary.main};

	${({ $showOneError }) => $showOneError && css`
		& > *:first-child .MuiFormHelperText-root {
			min-width: 215%;
		}

		& > *:last-child .MuiFormHelperText-root {
			display: none;
		}
	`}
`;

export const RangeInputSeparator = styled.span`
	margin-top: 3px;

	&::after {
		content: "${formatMessage({ id: 'rangeInputs.to', defaultMessage: 'to' })}";
	}
`;
