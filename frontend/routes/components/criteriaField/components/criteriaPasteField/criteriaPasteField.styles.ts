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
