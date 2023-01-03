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
import { Button, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import { FormattedMessage } from 'react-intl';
import {
	DialogContainer,
	Actions,
	RetypeCheck,
	ConfirmationPhrase,
	RetypeCheckField,
	Message,
	TruncatableTitle,
	Instruction,
} from '@/v5/ui/components/shared/modals/modals.styles';
import { CircledIcon } from '@controls/circledIcon';
import { useForm } from 'react-hook-form';
import { UnhandledErrorInterceptor } from './deleteModal.styles';

interface IDeleteModal {
	onClickClose?: () => void,
	onClickConfirm: () => Promise<void>,
	name: string,
	message?: string,
	confidenceCheck?: boolean,
	titleLabel?: string,
	confirmLabel?: string,
}

export const DeleteModal = ({
	onClickConfirm,
	onClickClose,
	name,
	message,
	confidenceCheck,
	titleLabel,
	confirmLabel,
}: IDeleteModal) => {
	const { control, watch, handleSubmit } = useForm({
		mode: 'onChange',
		defaultValues: { retypedName: '' },
	});
	const isValid = confidenceCheck ? (watch('retypedName') === name) : true;

	const onSubmit = async () => {
		try {
			await onClickConfirm();
			onClickClose();
		} catch (e) {
			// do nothing
		}
	};

	return (
		<DialogContainer>
			<CircledIcon variant="error" size="large">
				<DeleteIcon />
			</CircledIcon>
			<DialogTitle>
				<TruncatableTitle>
					{titleLabel || (
						<FormattedMessage
							id="deleteModal.header"
							defaultMessage="Delete {name}?"
							values={{ name }}
						/>
					)}
				</TruncatableTitle>
			</DialogTitle>
			<Message>
				<DialogContentText>
					{message}
				</DialogContentText>
				{ confidenceCheck && (
					<RetypeCheck>
						<Instruction>
							<FormattedMessage
								id="deleteModal.content.retypeCheck"
								defaultMessage="Confirm by typing {confirmationPhrase} below:"
								values={{
									confirmationPhrase: <ConfirmationPhrase>{name}</ConfirmationPhrase>,
								}}
							/>
						</Instruction>
						<RetypeCheckField
							control={control}
							name="retypedName"
						/>
					</RetypeCheck>
				)}
				<UnhandledErrorInterceptor />
			</Message>
			<Actions>
				<Button onClick={onClickClose} variant="contained" color="primary">
					<FormattedMessage
						id="deleteModal.action.cancel"
						defaultMessage="Cancel"
					/>
				</Button>
				<Button autoFocus type="submit" onClick={handleSubmit(onSubmit)} variant="outlined" color="secondary" disabled={!isValid}>
					{ confirmLabel || (
						<FormattedMessage
							id="deleteModal.action.confirm"
							defaultMessage="Delete"
						/>
					)}
				</Button>
			</Actions>
		</DialogContainer>
	);
};
