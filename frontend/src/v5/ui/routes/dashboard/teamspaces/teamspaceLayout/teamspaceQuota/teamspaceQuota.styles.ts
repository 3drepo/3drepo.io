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

import styled from 'styled-components';
import WarningIconSmall from '@assets/icons/warning_small.svg';

export const TeamspaceQuotaLayout = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
`;

export const QuotaValuesContainer = styled.div<{$disabled:boolean, $error}>` 
	${({ theme }) => (theme.typography.caption)}

	color: ${({ $disabled, $error, theme }) => {
		if ($error) return theme.palette.error.lightest;
		if ($disabled) return theme.palette.base.main;
		return theme.palette.primary.contrast;
	}};

	background-color: ${({ $error, theme }) => ($error ? theme.palette.error.main : 'inherit')};
`;

export const WarningIcon = styled(WarningIconSmall)`
	transform: scale(1.5);
`;
