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
import { FC, useEffect } from 'react';
import { Button, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Modal, Actions, Details, Status, WarningIcon, ModalContent, CloseButton } from '@components/shared/modalsDispatcher/modalsDispatcher.styles';
import { getErrorCode, getErrorMessage, getErrorStatus, isPathNotFound, isPathNotAuthorized, isTeamspaceInvalid, isTeamspaceUnauthenticated, isTeamspaceUnuthenticatedBySameUserOnDifferentSession } from '@/v5/validation/errors.helpers';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { AlertModalProps } from './alertModal.types';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useSafePath } from '@/v5/validation/useSafePath';


export const AlertModal: FC<AlertModalProps> = ({ onClickClose, currentActions = '', error, details, open }) => {
	const [redirectToSafePath, getSafePathName] = useSafePath(error);

	const message = getErrorMessage(error);
	const code = getErrorCode(error);
	const status = getErrorStatus(error);
	const errorStatus = status && code ? `${status} - ${code}` : '';
	const pathNotFound = isPathNotFound(error);
	const teamspaceInvalid = isTeamspaceInvalid(code);
	const teamspaceUnauthenticatedError = isTeamspaceUnauthenticated(code);
	const unauthorized = isPathNotAuthorized(error);
	const sessionIsValidButTeamspaceHasLostAuthentication = isTeamspaceUnuthenticatedBySameUserOnDifferentSession(error);

	useEffect(() => () => {
		if (sessionIsValidButTeamspaceHasLostAuthentication) {
			AuthActionsDispatchers.setAuthenticatedTeamspace(null);
		}
		if (pathNotFound || unauthorized || teamspaceInvalid || sessionIsValidButTeamspaceHasLostAuthentication) {
			redirectToSafePath();
		}
	}, []);

	if (teamspaceUnauthenticatedError && !sessionIsValidButTeamspaceHasLostAuthentication) {
		return (<></>);
	}

	return (
		<Modal open={open} onClose={onClickClose}>
			<ModalContent>
				<WarningIcon />
				<DialogTitle>
					<FormattedMessage
						id="alertModal.header"
						defaultMessage="Something went wrong when {currentActions}"
						values={{ currentActions }}
					/>
					{pathNotFound || unauthorized || teamspaceInvalid || sessionIsValidButTeamspaceHasLostAuthentication && (
						<>.
							<br />
							<FormattedMessage
								id="alertModal.redirect"
								defaultMessage="You'll be redirected to {to}."
								values={{ to: getSafePathName() }}
							/>
						</>
					)}
				</DialogTitle>
				<CloseButton onClick={onClickClose}>
					<CloseIcon />
				</CloseButton>
				<DialogContent>
					<DialogContentText>
						{message}
					</DialogContentText>
					{!!status && <Status>{errorStatus}</Status>}
				</DialogContent>
				<Actions>
					<Button autoFocus type="submit" onClick={onClickClose} variant="contained" color="primary">
						<FormattedMessage
							id="alertModal.action.ok"
							defaultMessage="Ok, close window"
						/>
					</Button>
					<Button href="https://3drepo.com/contact/" variant="outlined" color="secondary">
						<FormattedMessage
							id="alertModal.action.contactSupport"
							defaultMessage="Contact support"
						/>
					</Button>
				</Actions>
				{details && <Details>{details}</Details>}
			</ModalContent>
		</Modal>
	);
};
