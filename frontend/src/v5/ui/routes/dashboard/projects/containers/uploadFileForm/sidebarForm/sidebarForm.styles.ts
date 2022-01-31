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

import styled from 'styled-components';
import { Typography } from '@controls/typography';
import { Select } from '@controls/select';
import { FormControl as FormControlMui, FormControlLabel, TextField } from '@material-ui/core';

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

export const UnitSelect = styled(Select)`
	width: 109px;
`;

export const TypeSelect = styled(Select)`
	width: 221px;
`;

export const TimezoneSelect = styled(Select)`
	width: 340px;
`;

export const Input = styled(TextField)`
	margin-top: 33px;
`;

export const FormControl = styled(FormControlMui)`
	width: auto;
	& + & {
		padding: 0 0 0 10px;
		label { padding: 0 0 0 10px }
	}
`;

export const RevisionTitle = styled(Typography).attrs({
	variant: 'h3',
})`
	margin-top: 29px;
`;

export const AnimationsCheckbox = styled(FormControlLabel)`
	padding: 15px 0 0;
	height: 24px;
`;
