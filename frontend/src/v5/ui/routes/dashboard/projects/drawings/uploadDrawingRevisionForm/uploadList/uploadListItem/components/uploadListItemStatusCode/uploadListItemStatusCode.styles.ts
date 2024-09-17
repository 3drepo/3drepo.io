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

import { AutocompleteInput } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/uploadListItemDestination.styles';
import styled from 'styled-components';
import { Autocomplete as AutocompleteBase } from '@mui/material';

export const Autocomplete = styled(AutocompleteBase)`
	margin-left: 12px;
`;

export const OptionContainer = styled.li`
	display: flex;
	flex-direction: column;
	color: ${({ theme }) => theme.palette.base.main};
	align-items: baseline;
	overflow-x: hidden;
`;

export const Value = styled.div`
	width: calc(100% - 10px);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-weight: 600;
`;

export const Description = styled.span`
	${({ theme }) => theme.typography.body1}
	max-width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const StatusCodeInput = styled(AutocompleteInput)`
	.Mui-disabled fieldset {
		border: none;
	}
`;
