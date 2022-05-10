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

import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { viewerRoute } from '@/v5/services/routing/routing';
import { useParams } from 'react-router-dom';
import { ShareTextField } from '@controls/shareTextField';
import { IContainer } from '@/v5/store/containers/containers.types';
import { IFederation } from '@/v5/store/federations/federations.types';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { MailToButton } from './shareModal.styles';

type IShareModal = {
	openState: boolean;
	title: string;
	containerOrFederation: IContainer | IFederation;
	onClickClose: () => void;
};

export const ShareModal = ({
	openState,
	title,
	containerOrFederation,
	onClickClose,
}: IShareModal): JSX.Element => {
	const { teamspace, project } = useParams<DashboardParams>();
	const link = viewerRoute(teamspace, project, containerOrFederation, null, true);

	return (
		<FormModal
			open={openState}
			onClickClose={onClickClose}
			title={title}
			showButtons={false}
		>
			<ShareTextField
				label={formatMessage({
					id: 'shareModal.linkLabel',
					defaultMessage: 'Link',
				})}
				value={link}
			/>
			<MailToButton href={`mailto:?subject=3D Repo container - ${containerOrFederation.name}&body=${link}`}>
				<FormattedMessage
					id="shareModal.mailTo"
					defaultMessage="Send by email"
				/>
			</MailToButton>
		</FormModal>
	);
};
