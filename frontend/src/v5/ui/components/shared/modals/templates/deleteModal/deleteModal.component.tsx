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
import { Button, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@assets/icons/delete.svg';
import { FormattedMessage } from 'react-intl';
import { Container, Actions } from '@/v5/ui/components/shared/modals/modals.styles';
import { CircledIcon } from '@controls/circledIcon';

interface IDeleteModal {
	onClickClose?: () => void,
	onClickConfirm: () => void,
	title: string,
	message?: string,
}

export const DeleteModal = ({ onClickConfirm, onClickClose, title, message }: IDeleteModal) => (
	<Container>
		<CircledIcon variant="error" size="large">
			<DeleteIcon />
		</CircledIcon>
		<DialogTitle>
			<FormattedMessage
				id="deleteModal.header"
				defaultMessage={title}
			/>
		</DialogTitle>
		<DialogContent>
			<DialogContentText>
				{message}
			</DialogContentText>
		</DialogContent>
		<Actions>
			<Button autoFocus type="submit" onClick={() => { onClickClose(); onClickConfirm(); }} variant="contained" color="primary">
				<FormattedMessage
					id="deleteModal.action.confirm"
					defaultMessage="Delete"
				/>
			</Button>
			<Button onClick={onClickClose} variant="outlined" color="secondary">
				<FormattedMessage
					id="deleteModal.action.cancel"
					defaultMessage="Cancel"
				/>
			</Button>
		</Actions>
	</Container>
);
