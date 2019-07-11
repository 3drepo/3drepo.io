import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import * as React from 'react';

interface IProps {
	content?: string;
	handleResolve: () => void;
	handleClose: () => void;
}

export const ConfirmDialog = (props: IProps) => {
	const { content } = props;
	return (
		<>
			{ content && (
				<DialogContent>
					<div dangerouslySetInnerHTML={{ __html: content }} />
				</DialogContent>
			) }

			<DialogActions>
				<Button onClick={props.handleClose} color="secondary">No</Button>;
				<Button onClick={props.handleResolve} variant="raised" color="secondary">Yes</Button>;
			</DialogActions>
		</>
	);
};
