import * as React from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';

interface IProps {
	content?: string;
	handleResolve: () => void;
}
export const SimpleErrorDialog = (props: IProps) => {
	const { content } = props;

	return (
		<>
			<DialogContent>
				{content}
			</DialogContent>

			<DialogActions>
				<Button onClick={props.handleResolve} variant="raised" color="secondary">Ok</Button>;
			</DialogActions>
		</>
	);
};
