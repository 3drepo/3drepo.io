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
import { FormattedMessage } from 'react-intl';
import { ModalContent, Actions, WarningIcon, CloseButton, Modal } from '@components/shared/modalsDispatcher/modalsDispatcher.styles';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { WarningModalProps } from './warningModal.types';

export const WarningModal = ({ title, message, onClickClose, open, secondaryButtonLabel, onClickSecondary }: WarningModalProps) => (
	<Modal open={open} onClose={onClickClose}>
		<ModalContent>
			<WarningIcon />
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
					<FormattedMessage
						id="alertModal.action.ok"
						defaultMessage="Ok, close window"
					/>
				</Button>
				{secondaryButtonLabel && (
					<Button autoFocus variant="outlined" color="secondary" onClick={() => { onClickClose(); onClickSecondary(); }}>
						{secondaryButtonLabel}
					</Button>
				)}
			</Actions>
		</ModalContent>
	</Modal>
);
