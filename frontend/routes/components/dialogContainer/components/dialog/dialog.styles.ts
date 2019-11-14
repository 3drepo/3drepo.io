import DialogActionsComponent from '@material-ui/core/DialogActions';
import DialogTitleComponent from '@material-ui/core/DialogTitle';
import styled from 'styled-components';

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
