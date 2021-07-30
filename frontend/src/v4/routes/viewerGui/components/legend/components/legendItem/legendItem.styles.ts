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

import { COLOR } from '../../../../../../styles';
import {
	ActionsLine,
	StyledLinkableField,
	StyledMarkdownField
} from '../../../../../components/textField/textField.styles';
import { StyledTextField as TextField  } from '../../../measurements/components/measureItem/measureItem.styles';
import { StyledForm as Form } from '../../../views/components/viewItem/viewItem.styles';

export const Container = styled.li`
	color: ${COLOR.BLACK_60};
	border-bottom: 1px solid ${COLOR.BLACK_6};
	background-color: ${COLOR.WHITE};
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 43px;
	box-sizing: border-box;
	padding: 0 8px 0 18px;

	&:last-of-type {
		border-bottom: none;
	}
`;

export const StyledTextField = styled(TextField)`
	${ActionsLine} {
		top: 7px;
		bottom: inherit;
	}

	${StyledMarkdownField} {
		margin-top: 	px;
	}

	${StyledLinkableField} {
		margin-top: 14px;
	}
`;

export const StyledForm = styled(Form)`
	height: 100%;
	align-items: flex-start;
	overflow: hidden;
	margin-top: 0;
`;
