import DialogActionsComponent from '@material-ui/core/DialogActions';
import DialogTitleComponent from '@material-ui/core/DialogTitle';
import styled from 'styled-components';

import { COLOR } from '../../../../../styles';
import {
	StyledIconButton,
} from '../../../../viewerGui/components/panelBarActions/lockPanelButton/lockPanelButton.styles';

export const DialogActions = styled(DialogActionsComponent)`
	&& {
		margin-right: 8px;
		margin-bottom: 10px;
	}
`;

export const DialogTitle = styled(DialogTitleComponent)`
	&& {
		align-items: center;
		justify-content: space-between;
		padding-right: 0;
	}
`;

export const TopDialogActions = styled.span`
	&& {
		${StyledIconButton} {
			color: ${COLOR.WHITE};
		}
	}
`;
