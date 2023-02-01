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
import { Form, RemoveWhiteCorners } from './formModal.styles';
import { ModalHeader } from './modalHeader/modalHeader.component';
import { ModalBody } from './modalBody/modalBody.component';
import { FormModalActions } from './modalButtons/modalButtons.styles';
import { ModalCancelButton, ModalSubmitButton } from './modalButtons/modalButtons.component';

export interface IFormModal extends Omit<DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'ref'> {
	onSubmit?: (event) => void;
	onClickClose?: () => void;
	onClickCancel?: () => void;
	title?: any;
	subtitle?: string;
	open?: boolean;
	confirmLabel?: string;
	cancelLabel?: string;
	isValid?: boolean;
	maxWidth?: DialogProps['maxWidth'];
	isSubmitting?: boolean;
	disableClosing?: boolean;
	hideHorizontalScroll?: boolean;
}

export const FormModal = ({
	onSubmit = () => {},
	onClickClose,
	onClickCancel,
	title,
	subtitle,
	confirmLabel,
	cancelLabel,
	open,
	children,
	className,
	isValid = true,
	maxWidth = false,
	isSubmitting = false,
	disableClosing = false,
	hideHorizontalScroll = true,
	...formProps
}: IFormModal) => {
	const handleClose = () => {
		if (disableClosing) return;
		(onClickCancel || onClickClose)();
	};

	return (
		<Dialog
			onClose={handleClose}
			open={open}
			PaperComponent={RemoveWhiteCorners}
			className={className}
			maxWidth={maxWidth}
			fullWidth={!!maxWidth}
		>
			<Form {...formProps}>
				<ModalHeader onClickClose={handleClose} title={title} subtitle={subtitle} disableClosing={disableClosing} />
				<ModalBody hideHorizontalScroll={hideHorizontalScroll}>
					{children}
				</ModalBody>
				<FormModalActions>
					<ModalCancelButton onClick={handleClose} disabled={isSubmitting}>
						{cancelLabel}
					</ModalCancelButton>
					<ModalSubmitButton disabled={!isValid} onClick={onSubmit} isPending={isSubmitting}>
						{confirmLabel}
					</ModalSubmitButton>
				</FormModalActions>
			</Form>
		</Dialog>
	);
};
