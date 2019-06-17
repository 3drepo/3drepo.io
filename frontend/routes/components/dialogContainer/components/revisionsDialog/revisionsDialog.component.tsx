import * as React from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';

interface IProps {
	method: string;
	dataType: string;
	message: string;
	status: string;
	handleClose: () => string;
}
export const RevisionsDialog = (props: IProps) => {
	const { method, dataType, message, status } = props;
	console.log('RevisionsDialog');

	return (
		<>
			<DialogContent>
				Revisions
			</DialogContent>

			<DialogActions>
				<Button onClick={props.handleClose} variant="raised" color="secondary">Cancel</Button>;
			</DialogActions>
		</>
	);
};
