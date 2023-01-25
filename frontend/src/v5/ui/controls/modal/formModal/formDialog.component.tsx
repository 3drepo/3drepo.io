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
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import { Button, Dialog } from '@mui/material';
import { DialogProps } from '@mui/material/Dialog';
import { FormattedMessage } from 'react-intl';
import { ScrollArea } from '@controls/scrollArea';
import {
	Form,
	FormDialogContent,
	FormDialogActions,
	RemoveWhiteCorners,
	SubmitButton,
} from './formDialog.styles';
import { FormModalHeader } from './formModalHeader/formModalHeader.component';

export interface IFormModal extends Omit<DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'ref'> {
	onClickClose?: () => void;
	onSubmit?: (event) => void;
	onClickCancel?: () => void;
	title?: any;
	subtitle?: string;
	open?: boolean;
	confirmLabel?: string;
	cancelLabel?: string;
	isValid?: boolean;
	showButtons?: boolean;
	maxWidth?: DialogProps['maxWidth'];
	isSubmitting?: boolean;
	disableClosing?: boolean;
	hideSubmitButton?: boolean;
	hideHorizontalScroll?: boolean;
}

export const FormModal = (props: IFormModal) => {
	const {
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
		showButtons = true,
		maxWidth = false,
		isSubmitting = false,
		disableClosing = false,
		hideSubmitButton = false,
		hideHorizontalScroll = true,
		...formProps
	} = props;

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
				<FormModalHeader
					title={title}
					subtitle={subtitle}
					handleClose={handleClose}
					disableClosing={disableClosing}
				/>
				<ScrollArea variant="base" autoHeightMax="70vh" autoHeight hideHorizontal={hideHorizontalScroll}>
					<FormDialogContent>
						{children}
					</FormDialogContent>
				</ScrollArea>
				{showButtons && (
					<FormDialogActions>
						<Button autoFocus onClick={handleClose} variant="outlined" color="secondary" size="medium" disabled={isSubmitting}>
							{cancelLabel || <FormattedMessage id="formDialog.actions.cancel" defaultMessage="Cancel" />}
						</Button>
						{!hideSubmitButton && (
							<SubmitButton
								disabled={!isValid}
								onClick={onSubmit}
								variant="contained"
								color="primary"
								size="medium"
								isPending={isSubmitting}
								fullWidth={false}
							>
								{confirmLabel || <FormattedMessage id="formDialog.actions.ok" defaultMessage="OK" />}
							</SubmitButton>
						)}
					</FormDialogActions>
				)}
			</Form>
		</Dialog>
	);
};
