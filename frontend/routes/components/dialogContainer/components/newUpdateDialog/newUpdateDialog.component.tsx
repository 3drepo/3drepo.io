/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
