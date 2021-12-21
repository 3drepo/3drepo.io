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

import { Button, DialogActions, DialogContent } from '@material-ui/core';
import React from 'react';
import { Modal } from '@controls/modal';
import { Form, Title } from './formDialog.styles';

interface IFormDialog extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	onClickClose?: () => void;
	title?: string;
	open?: boolean;
	confirmLabel?: string;
	isValid?: boolean;
}

export const FormModal = (props: IFormDialog) => {
	const { onClickClose, title, confirmLabel, open, children, className, isValid = true, ...formProps } = props;
	return (
		<Modal onClickClose={onClickClose} open={open} className={className}>
			<Form {...formProps}>
				<Title>
					{title}
				</Title>
				<DialogContent>
					{children}
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={onClickClose} variant="outlined" color="secondary" size="small">
						Cancel
					</Button>
					<Button disabled={!isValid} type="submit" variant="contained" color="primary" size="small">
						{confirmLabel || 'OK'}
					</Button>
				</DialogActions>
			</Form>
		</Modal>
	);
};
