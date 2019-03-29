/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';

import * as TextFieldStyles from '../../../../../components/textField/textField.styles';

export const StyledFormControl = styled(FormControl)``;

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	overflow: hidden;

	${TextFieldStyles.StyledTextField} {
		margin: 1px 0;
	}

	${TextFieldStyles.Container},
	${StyledFormControl} {
		margin: 1px 0;
	}
`;

export const FieldsContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: auto;
	overflow: hidden;
	width: 47%;

	${TextFieldStyles.Container},
	${StyledFormControl} {
		margin: 5px 0;
		width: 100%;
	}
`;

export const FieldsRow = styled(Grid)`
	${TextFieldStyles.StyledTextField} {
		margin: 1px 0;
	}

	${TextFieldStyles.Container},
	${StyledFormControl} {
		margin: 1px 0;
		flex: 1;

		&:nth-child(2n + 1) {
			margin-right: 25px;
		}
	}

	.select {
		color: inherit;
	}
`;

export const DescriptionImage = styled.div`
	max-height: 250px;
	overflow: hidden;
`;
