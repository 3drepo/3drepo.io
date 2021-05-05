import React from 'react';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import { ROUTES } from '../../../../../constants/routes';

interface IProps {
	content?: string;
	handleResolve: () => void;
	handleClose: () => void;
	history: any;
}

export const UnauthorizedAccessDialog = ({ content, history }: IProps) => {

	const handleClose = () => history.push(`${ROUTES.TEAMSPACES}`);

	return (
		<>
			<DialogContent>
				<div dangerouslySetInnerHTML={{ __html: content }} />
			</DialogContent>

			<DialogActions>
				<Button onClick={handleClose} variant="contained" color="secondary">Back to teamspace</Button>
			</DialogActions>
		</>
	);
};
