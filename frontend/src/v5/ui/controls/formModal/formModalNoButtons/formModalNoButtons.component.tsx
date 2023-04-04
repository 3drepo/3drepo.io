/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import { Dialog } from '@mui/material';
import { DialogProps } from '@mui/material/Dialog';
import { Form } from '../formModal.styles';
import { ModalHeader } from '../modalHeader/modalHeader.component';
import { ModalBody } from '../modalBody/modalBody.styles';

export interface IFormModalNoButtons extends Omit<DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'ref' | 'onSubmit'> {
	onClickClose?: () => void;
	onClickCancel?: () => void;
	title?: any;
	subtitle?: string;
	open?: boolean;
	maxWidth?: DialogProps['maxWidth'];
	disableClosing?: boolean;
}

export const FormModalNoButtons = ({
	onClickClose,
	onClickCancel,
	title,
	subtitle,
	open,
	children,
	className,
	maxWidth = false,
	disableClosing = false,
	...formProps
}: IFormModalNoButtons) => {
	const handleClose = () => {
		if (disableClosing) return;
		(onClickCancel || onClickClose)();
	};

	return (
		<Dialog
			onClose={handleClose}
			open={open}
			className={className}
			maxWidth={maxWidth}
			fullWidth={!!maxWidth}
		>
			<Form {...formProps}>
				<ModalHeader onClickClose={handleClose} title={title} subtitle={subtitle} disableClosing={disableClosing} />
				<ModalBody>
					{children}
				</ModalBody>
			</Form>
		</Dialog>
	);
};
