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

import { TextField } from '../../../../../components/textField/textField.component';
import * as TextFieldStyles from '../../../../../components/textField/textField.styles';
import { ViewerPanelContent } from '../../../viewerPanel/viewerPanel.styles';

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	flex: auto;
	overflow: auto;
`;

export const FieldsRow = styled.div`
	display: flex;
	align-items: center;
	margin: 10px 0;
`;

export const StyledTextField = styled(TextField)`
	width: 100%;

	&& {
		margin: 0 25px 0 0;
	}
`;

export const LongLabel = styled.div`
	white-space: nowrap;
`;

export const StyledFormControl = styled(FormControl)`
	width: 100%;

	&& {
		margin: 0;
	}
`;

export const Actions = styled.div`
	display: flex;
	width: 100%;
	align-items: center;
`;

export const ColorPickerWrapper = styled.div`
	display: inline;
`;

export const Description = styled(TextField)`
	${TextFieldStyles.StyledTextField} {
		margin: 1px 0;
	}

	${TextFieldStyles.Container},
	${StyledFormControl} {
		margin: 1px 0;
	}
`;

export const Content = styled(ViewerPanelContent)``;
