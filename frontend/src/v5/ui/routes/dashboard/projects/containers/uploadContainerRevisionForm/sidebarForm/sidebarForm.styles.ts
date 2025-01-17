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
import { Typography } from '@controls/typography';
import { FormCheckbox, FormSelect } from '@controls/inputs/formInputs.component';
import { MenuItem } from '@mui/material';

export const Title = styled(Typography).attrs({
	variant: 'h3',
})`
	color: ${({ theme }) => theme.palette.secondary.main};
	width: 310px;
	height: 21px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	user-select: none;
`;

export const HiddenMenuItem = styled(MenuItem)`
	display: none;
`;

export const TimezoneSelect = styled(FormSelect)`
	width: 340px;
`;

export const Heading = styled(Typography).attrs({
	variant: 'h3',
})`
	margin-top: 29px;
`;

export const AnimationsCheckbox = styled(FormCheckbox)`
	padding: 15px 0 0;
	height: 39px;
`;

export const FlexContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: flex-start;
	width: 100%;

	> div:first-child {
		flex: 0.5;
		margin-right: 9px;
	}
	> div:last-child {
		flex: 1;
	}
`;
