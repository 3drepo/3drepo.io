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
import CloseIcon from '@assets/icons/close.svg';
import { DialogProps } from '@mui/material/Dialog';
import { ScrollArea } from '@controls/scrollArea';
import {
	Form,
	Title,
	Header,
	CloseButton,
	FormDialogContent,
	FormDialogActions,
	RemoveWhiteCorners,
} from './formDialog.styles';

interface IFormModal extends Omit<DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'ref'> {
	onClickClose?: () => void;
	title?: string;
	open?: boolean;
	confirmLabel?: string;
	isValid?: boolean;
	showButtons?: boolean;
	maxWidth?: DialogProps['maxWidth'];
	zeroMargin?: boolean;
}

export const FormModal = (props: IFormModal) => {
	const {
		onClickClose,
		title,
		confirmLabel,
		open,
		children,
		className,
		isValid = true,
		showButtons = true,
		maxWidth = false,
		zeroMargin = false,
		...formProps
	} = props;
	return (
		<Dialog
			onClose={onClickClose}
			open={open}
			PaperComponent={RemoveWhiteCorners}
			className={className}
			maxWidth={maxWidth}
			fullWidth={!!maxWidth}
		>
			<Form {...formProps}>
				<Header>
					<Title>
						{title}
					</Title>
					<CloseButton aria-label="Close dialog" onClick={onClickClose}>
						<CloseIcon />
					</CloseButton>
				</Header>
				<ScrollArea variant="base" autoHeightMax="70vh" autoHeight>
					<FormDialogContent zeroMargin={zeroMargin}>
						{children}
					</FormDialogContent>
				</ScrollArea>
				{showButtons && (
					<FormDialogActions>
						<Button autoFocus onClick={onClickClose} variant="outlined" color="secondary" size="medium">
							Cancel
						</Button>
						<Button disabled={!isValid} type="submit" variant="contained" color="primary" size="medium">
							{confirmLabel || 'OK'}
						</Button>
					</FormDialogActions>
				)}
			</Form>
		</Dialog>
	);
};
