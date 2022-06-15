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
import { ModalContainer, Actions } from '@/v5/ui/components/shared/modals/modals.styles';
import { formatMessage } from '@/v5/services/intl';

interface IInfoModal {
	title: string;
	message: string;
	primaryButtonLabel?: string;
	secondaryButtonLabel?: string;
	onClickClose?: () => void;
	onClickSecondary: () => void;
}

export const InfoModal = ({
	title,
	message,
	primaryButtonLabel = formatMessage({
		id: 'infoModal.action.primaryDefault',
		defaultMessage: 'Ok, close window',
	}),
	secondaryButtonLabel = formatMessage({
		id: 'infoModal.action.secondaryDefault',
		defaultMessage: 'Go back to Teamspace',
	}),
	onClickClose,
	onClickSecondary,
}: IInfoModal) => (
	<ModalContainer>
		<DialogTitle>
			{ title }
		</DialogTitle>
		<DialogContent>
			<DialogContentText>
				{ message }
			</DialogContentText>
		</DialogContent>
		<Actions>
			<Button autoFocus variant="contained" color="primary" onClick={onClickClose}>
				{primaryButtonLabel}
			</Button>
			<Button
				variant="outlined"
				color="secondary"
				onClick={onClickSecondary}
			>
				{secondaryButtonLabel}
			</Button>
		</Actions>
	</ModalContainer>
);
