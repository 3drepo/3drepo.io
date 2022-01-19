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

import React from 'react';

import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { viewerShareLink } from '@/v5/services/routing/routing';
import { IContainer } from '@/v5/store/containers/containers.types';
import { useParams } from 'react-router-dom';
import { ShareTextField } from '@controls/shareTextField';
import { MailToButton } from './shareModal.styles';

type IShareModal = {
	openState: boolean;
	container: IContainer;
	onClickClose: () => void;
};

export const ShareModal = ({ openState, container, onClickClose }: IShareModal): JSX.Element => {
	const { teamspace } = useParams();
	const containerName = container.name;
	const containerLink = viewerShareLink(teamspace, container._id);

	return (
		<FormModal
			open={openState}
			onClickClose={onClickClose}
			title={formatMessage({
				id: 'ShareModal.title',
				defaultMessage: 'Share Container URL',
			})}
			showButtons={false}
		>
			<ShareTextField
				label={formatMessage({
					id: 'shareModal.linkLabel',
					defaultMessage: 'Link',
				})}
				text={containerLink}
			/>
			<MailToButton href={`mailto:?subject=3D Repo container - ${containerName}&body=${containerLink}`}>
				<FormattedMessage
					id="shareModal.mailTo"
					defaultMessage="Send by email"
				/>
			</MailToButton>
		</FormModal>
	);
};
