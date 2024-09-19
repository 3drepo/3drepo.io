/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { Button, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Modal, ModalContent, Actions, CloseButton } from '@components/shared/modalsDispatcher/modalsDispatcher.styles';
import { formatMessage } from '@/v5/services/intl';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { ReactNode } from 'react';

export interface IInfoModal {
	title: string;
	message: string | ReactNode;
	primaryButtonLabel?: string;
	secondaryButtonLabel?: string;
	open: boolean,
	onClickClose?: () => void;
	onClickSecondary?: () => void;
	Icon?: ReactNode;
}

export const InfoModal = ({
	title,
	message,
	primaryButtonLabel = formatMessage({
		id: 'infoModal.action.primaryDefault',
		defaultMessage: 'Ok, close window',
	}),
	secondaryButtonLabel,
	onClickClose,
	onClickSecondary,
	open,
	Icon,
}: IInfoModal) => (
	<Modal open={open} onClose={onClickClose}>
		<ModalContent>
			{Icon && <Icon />}
			<DialogTitle>
				{ title }
			</DialogTitle>
			<CloseButton onClick={onClickClose}>
				<CloseIcon />
			</CloseButton>
			<DialogContent>
				<DialogContentText>
					{ message }
				</DialogContentText>
			</DialogContent>
			<Actions>
				<Button autoFocus variant="contained" color="primary" onClick={onClickClose}>
					{primaryButtonLabel}
				</Button>
				{secondaryButtonLabel && onClickSecondary && (
					<Button
						variant="outlined"
						color="secondary"
						onClick={() => { onClickClose(); onClickSecondary?.(); }}
					>
						{secondaryButtonLabel}
					</Button>
				)}
			</Actions>
		</ModalContent>
	</Modal>
);
