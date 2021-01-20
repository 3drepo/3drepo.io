import Button from '@material-ui/core/Button';
import DialogContent from '@material-ui/core/DialogContent';
import React from 'react';

import { DialogActions, Link } from './newUpdateDialog.styles';

interface IProps {
	handleResolve: () => void;
	handleClose: () => void;
}

export const NewUpdateDialog = (props: IProps) => {
	const { handleResolve, handleClose } = props;

	return (
		<>
			<DialogContent>
				A new version of 3D Repo is available!
				<br />
				Please reload the page for the latest version.
				See the latest changelog <Link href="https://github.com/3drepo/3drepo.io/releases/latest" target="_blank">
					here
				</Link>.
			</DialogContent>

			<DialogActions>
				<Button onClick={handleClose} color="primary">I'll reload in a moment</Button>
				<Button onClick={handleResolve} variant="contained" color="secondary">Reload</Button>
			</DialogActions>
		</>
	);
};
