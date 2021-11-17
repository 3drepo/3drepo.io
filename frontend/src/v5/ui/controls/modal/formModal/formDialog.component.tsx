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
import { Dialog, Button, DialogActions, DialogContent } from '@material-ui/core';

import { CloseButton } from '@controls/modal/modal.styles';
import CloseIcon from '@assets/icons/close_form_modal.svg';
import { Form, Header, Subtitle, Title } from './formDialog.styles';

interface IFormDialog extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	onClickClose?: () => void;
	title: string;
	subtitle?: string;
	open?: boolean;
	confirmLabel?: string;
}

export const FormModal = ({
	onClickClose,
	title,
	subtitle,
	confirmLabel,
	open,
	children,
	className,
	...formProps
}: IFormDialog) => (
	<Dialog open={open} onClose={onClickClose} className={className} maxWidth="xl" fullWidth>
		<Form {...formProps}>
			<Header>
				<Title>
					{title}
				</Title>
				{subtitle && <Subtitle>{subtitle}</Subtitle>}
				<CloseButton aria-label="Close dialog" onClick={onClickClose}>
					<CloseIcon />
				</CloseButton>
			</Header>
			<DialogContent>
				{children}
			</DialogContent>
			<DialogActions>
				<Button type="submit" variant="contained" color="primary" size="small">
					{confirmLabel || 'OK'}
				</Button>
			</DialogActions>
		</Form>
	</Dialog>
);
