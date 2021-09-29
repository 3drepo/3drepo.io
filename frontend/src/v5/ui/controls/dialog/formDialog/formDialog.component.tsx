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

import { Button, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import React from 'react';
import { Dialog } from '../dialog.component';

interface IFormDialog extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	onClickClose?: () => void;
	title?: string;
	open?: boolean;
	confirmLabel?: string;
}

export const FormDialog = (props: IFormDialog) => {
	const { onClickClose, title, confirmLabel, open, children, className, ...formProps } = props;
	return (
		<Dialog onClickClose={onClickClose} open={open} className={className}>
			<form {...formProps}>
				<DialogTitle>
					{title}
				</DialogTitle>
				<DialogContent>
					{children}
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={onClickClose} variant="outlined" color="secondary">
						Cancel
					</Button>
					<Button type="submit" variant="contained" color="primary">
						{confirmLabel || 'OK'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};
