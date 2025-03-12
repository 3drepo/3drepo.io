/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { FormattedMessage } from 'react-intl';
import { FormModalActions } from '@controls/formModal/modalButtons/modalButtons.styles';
import { ModalCancelButton } from '@controls/formModal/modalButtons/modalButtons.component';
import { TabContent } from '../editProfileModal.styles';
import { UnhandledError } from '@controls/errorMessage/unhandledError/unhandledError.component';
import { resetPassword } from '@/v5/services/api/auth';
import { useState } from 'react';
import { SuccessMessage } from '@controls/successMessage/successMessage.component';
import { Button, Title } from './editProfilePasswordTab.styles';
import { Gap } from '@controls/gap';

type EditProfilePasswordTabProps = {
	onClickClose: () => void,
};
	
export const EditProfilePasswordTab = ({ onClickClose }: EditProfilePasswordTabProps) => {
	const [status, setStatus] = useState<{ success: boolean, error? }>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const sendEmail = async () => {
		setStatus(null);
		setIsSubmitting(true);
		try {
			await resetPassword();
			setStatus({ success: true });
		} catch (error) {
			setStatus({ success: false, error });
		}
		setIsSubmitting(false);
	};

	return (
		<>
			<TabContent>
				<Gap $height='10px' />
				<Title>
					<FormattedMessage
						id="editProfile.passwordTab.title"
						defaultMessage="Clicking the button below will send an email to your inbox with a link and the instructions to update your password"
					/>
				</Title>
				<Button onClick={sendEmail} isPending={isSubmitting}>
					<FormattedMessage
						id="editProfile.passwordTab.changePassword"
						defaultMessage="Change password"
					/>
				</Button>
				{status?.success && (
					<SuccessMessage>
						<FormattedMessage
							id="editProfile.passwordTab.successMessage"
							defaultMessage="Link sent"
						/>
					</SuccessMessage>
				)}
				{status?.error && (
					<UnhandledError error={status?.error} />
				)}
			</TabContent>
			<FormModalActions>
				<ModalCancelButton onClick={onClickClose} />
			</FormModalActions>
		</>
	);
};