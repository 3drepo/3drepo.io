/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import FormControl from '@material-ui/core/FormControl';
import SelectComponent from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';

import { COLOR } from '../../../styles';

export const Container = styled.div`
	height: 100%;
	padding-left: 10px;
	min-height: 55px;
	position: relative;
	overflow: auto;
`;

export const LoaderContainer = styled.div`
	padding: 10px;
`;

export const Label = styled(Typography)`
	&& {
		color: ${COLOR.BLACK_60};
		font-size: 14px;
		margin-right: 5px;
		margin-bottom: 1px;
	}
`;

export const Select = styled(SelectComponent)`
	&& {
		color: ${COLOR.BLACK_60};

		&:after, &:before {
			display: none;
		}

		div[role="button"] {
			padding-right: 22px;
			min-height: unset;
		}
	}
`;

export const FormContainer = styled(FormControl)`
	&& {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
`;

export const FilterWrapper = styled.div`
	box-sizing: border-box;
	width: 100%;
	padding-left: 10px;
	padding-top: 10px;
	z-index: 2;
	position: relative;
`;
