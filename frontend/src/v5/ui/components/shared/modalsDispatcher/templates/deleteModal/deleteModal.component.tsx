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
	Modal,
	Actions,
	RetypeCheck,
	ConfirmationPhrase,
	RetypeCheckField,
	Message,
	TruncatableTitle,
	Instruction,
	ModalContent,
	CloseButton,
} from '@components/shared/modalsDispatcher/modalsDispatcher.styles';
import { CircledIcon } from '@controls/circledIcon';
import { useForm } from 'react-hook-form';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { isContainerPartOfFederation } from '@/v5/validation/errors.helpers';
import { useErrorInterceptor } from '@controls/errorMessage/useErrorInterceptor';
import { ErrorMessage } from '@controls/errorMessage/errorMessage.component';
import { formatMessage } from '@/v5/services/intl';

interface IDeleteModal {
	onClickClose?: () => void,
	onClickConfirm: () => Promise<void>,
	name: string,
	message?: string,
	confidenceCheck?: boolean,
	titleLabel?: string,
	confirmLabel?: string,
	open: boolean,
}

export const DeleteModal = ({
	onClickConfirm,
	onClickClose,
	name,
	message,
	confidenceCheck,
	titleLabel,
	confirmLabel,
	open,
}: IDeleteModal) => {
	const error = useErrorInterceptor();
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
		<Modal open={open} onClose={onClickClose}>
			<ModalContent>
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
				<CloseButton onClick={onClickClose}>
					<CloseIcon />
				</CloseButton>
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
					<UnhandledErrorInterceptor expectedErrorValidators={[isContainerPartOfFederation]} />
					{ isContainerPartOfFederation(error)
						&& (
							<ErrorMessage title={formatMessage({ id: 'containers.delete.partOfFederation', defaultMessage: 'Part of a federation' })}>
								<FormattedMessage id="containers.delete.partOfFederationDetail" defaultMessage="The container cannot be deleted as is part of a federation." />
							</ErrorMessage>
						)}
				</Message>
				<Actions>
					{ !error
						&& (
							<>
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
							</>
						)}

					{error
						&& (
							<Button onClick={onClickClose} variant="contained" color="primary">
								<FormattedMessage
									id="deleteModal.action.close"
									defaultMessage="Close"
								/>
							</Button>
						)}
				</Actions>
			</ModalContent>
		</Modal>
	);
};
