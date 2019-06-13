import * as React from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';

import { DialogActions } from './disconnectedDialog.styles';

interface IProps {
	handleResolve: () => void;
	handleClose: () => void;
}
export const DisconnectedDialog = (props: IProps) => {
	const { handleResolve, handleClose } = props;

	return (
		<>
			<DialogContent>
				Your connection to the 3D Repo's notification service has dropped.
				<br />
				3D Repo may not behave as expected when commenting and changing issues
				<br /><br />
				Try refreshing the page to reconnect.
			</DialogContent>

			<DialogActions>
				<Button onClick={handleClose} color="primary">Mute notifications</Button>;
				<Button onClick={handleResolve} variant="raised" color="secondary">Continue</Button>;
			</DialogActions>
		</>
	);
};
