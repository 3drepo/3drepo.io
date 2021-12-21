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
import { Select, TextField } from '@material-ui/core';
import { Typography } from '@controls/typography';

export const FormInput = styled(TextField)`
	display: flex;
	height: 35px;
	width: auto;
	padding: 10px 15px;
	margin: 0 10px;

	background: ${({ theme }) => theme.palette.primary.contrast};
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-radius: 5px;
`;

export const Label = styled(Typography).attrs({
	variant: 'kicker',
})`
	color: ${({ theme }) => theme.palette.base.main};
	margin: 19px 10px 5px;
	user-select: none;

	&.required {
		::after {
			content:"*";
			color: ${({ theme }) => theme.palette.error.main};
		}
	}
`;

export const FormSelect = styled(Select)`
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	box-sizing: border-box;
	border-radius: 5px;

	background-color: ${({ theme }) => theme.palette.primary.contrast};
	height: 35px;
	padding-left: 15px;

	width: 100%;
`;

export const LabelGroup = styled.span`
	width: 50%;
	display: inline-block;
	box-sizing: border-box;
	padding: 10px;

	> :first-child {
		margin-left: 0;
	}
`;
