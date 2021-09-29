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

import React from 'react';
import { Button, DialogContent, DialogContentText, DialogTitle, DialogActions } from '@material-ui/core';

interface IInfoDialog extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	onCancel?: () => void,
	title?:string
}

export const InfoDialog: React.FC<IInfoDialog> = ({ onCancel, title, ...formProps }) => {
	const handleOnCancel = () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		onCancel();
	};

	return (
		<>
			<form {...formProps}>
				<DialogTitle>
					Sample dialog
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This is only a sample info dialog content.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={handleOnCancel} variant="outlined" color="secondary">
						Cancel
					</Button>
					<Button type="submit" variant="contained" color="primary">
						OK
					</Button>
				</DialogActions>
			</form>
		</>
	);
};
