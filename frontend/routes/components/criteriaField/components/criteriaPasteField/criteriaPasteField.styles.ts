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

import IconButtonComponent from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';
import styled, { css } from 'styled-components';

import { TextField } from '../../../textField/textField.component';
import * as TextFieldStyles from '../../../textField/textField.styles';

const pasteIconStyle = css`
	&& {
		font-size: 20px;
	}
`;

export const PasteButton = styled(IconButtonComponent)`
	&& {
		width: 28px;
		height: 28px;
		padding: 4px;
		margin-left: 5px;
		margin-top: 5px;
	}
`;

export const StyledSaveIcon = styled(SaveIcon)`
	${pasteIconStyle}
`;

export const StyledCloseIcon = styled(CloseIcon)`
	${pasteIconStyle}
`;

export const PasteContainer = styled.div`
	width: 100%;
	align-items: flex-start;
	display: flex;
`;

export const PasteField = styled(TextField)`
	flex: 1;

	${TextFieldStyles.StyledTextField} {
		margin: 4px 0;
	}
`;
