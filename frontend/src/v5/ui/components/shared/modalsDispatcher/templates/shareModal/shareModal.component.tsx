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

import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { ShareTextField } from '@controls/shareTextField';
import { ModalHeader } from '@controls/formModal/modalHeader/modalHeader.component';
import { ModalBody } from '@controls/formModal/modalBody/modalBody.styles';
import { Modal } from '@components/shared/modalsDispatcher/modalsDispatcher.styles';
import { Form } from '@controls/formModal/formModal.styles';
import { MailToButton } from './shareModal.styles';
import { ShareModalProps } from './shareModal.types';

export const ShareModal = ({
	title,
	name,
	subject,
	onClickClose,
	link,
	open,
}: ShareModalProps) => (
	<Modal open={open} onClose={onClickClose}>
		<Form>
			<ModalHeader onClickClose={onClickClose} title={title} />
			<ModalBody>
				<ShareTextField
					label={formatMessage({
						id: 'shareModal.linkLabel',
						defaultMessage: 'Link',
					})}
					value={link}
				/>
				<MailToButton href={`mailto:?subject=3D Repo ${subject} - ${name}&body=${link}`}>
					<FormattedMessage
						id="shareModal.mailTo"
						defaultMessage="Send by email"
					/>
				</MailToButton>
			</ModalBody>
		</Form>
	</Modal>
);
