import React from 'react';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

interface IProps {
	content?: string;
	message: string;
	status: string;
	handleResolve: () => void;
	handleClose: () => void;
}

export const RedirectToTeamspaceDialog = ({ content, message, status, handleResolve }: IProps) => {
	return (
		<>
			<DialogContent>
				{content}
				<br /><br />
				<strong>{message}</strong>
				<br />
				{status && (<code>(Status Code: {status})</code>)}
				<br /><br />
				If this is unexpected please message support@3drepo.io.
			</DialogContent>

			<DialogActions>
				<Button onClick={handleResolve} variant="contained" color="secondary">Back to teamspace</Button>
			</DialogActions>
		</>
	);
};
