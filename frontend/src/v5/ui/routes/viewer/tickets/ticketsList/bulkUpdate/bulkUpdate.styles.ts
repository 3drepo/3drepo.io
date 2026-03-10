/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { Typography } from '@controls/typography';
import { Checkbox } from '@mui/material';
import styled from 'styled-components';

export const AllTicketsCheckboxContainer = styled(Typography)<{ $withFilters?: boolean }>`
	margin: 0;
	padding: 0;
	position: relative;
	padding-left: 12px;
	flex-shrink: 0;
	color: ${({ theme }) => theme.palette.base.main};
	
	display: inline;
	height: ${({ $withFilters }) => ($withFilters) ?  '0' : 'auto'};
	top: ${({ $withFilters }) => ($withFilters) ?  '-22px' : 'auto'};
	padding-bottom: ${({ $withFilters }) => ($withFilters) ?  '0' : '5px'};
`;


export const AllTicketsCheckbox = styled(Checkbox)`
	margin: 0;
	padding: 0 5px 0 0;
`;
