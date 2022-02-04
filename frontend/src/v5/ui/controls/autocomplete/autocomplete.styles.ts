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

import { TextField } from '@material-ui/core';
import { Typography } from '@controls/typography';
import Autocomplete from '@material-ui/lab/Autocomplete';

export const Input = styled(Autocomplete)`
`;

export const TextInput = styled(TextField)`
	margin: 0;
	width: 271px;
	border: none;
	>.MuiInputBase-root {
		>.MuiInputBase-input {
			font-weight: bold;
		}
		${({ state, theme }) => {
		if (state === 'new') {
			return `
					>.MuiInputBase-input { color: ${theme.palette.primary.main}; };
					background-color: ${theme.palette.primary.lightest};
					fieldset { border: none; }
				`;
		}
		if (state === 'existing') {
			return `
					>.MuiInputBase-input { color: ${theme.palette.secondary.main} };
					background-color: ${theme.palette.tertiary.lightest};
					fieldset { border: none; }
				`;
		}
		if (state === 'error') {
			return `
					>.MuiInputBase-input { color: ${theme.palette.error.main} };
					background-color: ${theme.palette.error.lightest};
					fieldset { border: none; }
				`;
		}
		return '';
	}}
	}
`;

export const ContainerName = styled(Typography).attrs({
	variant: 'h5',
	component: 'span',

})`
	width: calc(100% - 30px);
`;

export const LastRevision = styled(Typography).attrs({
	component: 'div',
	variant: 'h5',
})`
	width: 100%;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const ExistingContainer = styled.div`
	display: flex;
	flex-direction: column;
	color: ${({ theme }) => theme.palette.secondary.main};
	width: 100%;
`;

export const NewContainer = styled.div`
	color: ${({ theme, error }) => (error ? theme.palette.error.main : theme.palette.primary.dark)};
	display: inline-flex;
	width: 100%;
	
	svg {
		height: 18px;
		width: 18px;
		box-sizing: border-box;
		margin: 6px;
		flex-shrink: 0;
		path {
			fill: ${({ theme }) => theme.palette.primary.dark};
		}
	}
`;
