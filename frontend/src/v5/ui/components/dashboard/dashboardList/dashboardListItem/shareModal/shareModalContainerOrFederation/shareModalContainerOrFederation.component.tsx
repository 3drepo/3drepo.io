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

import { viewerRoute, prefixBaseDomain } from '@/v5/services/routing/routing';
import { useParams } from 'react-router-dom';
import { IContainer } from '@/v5/store/containers/containers.types';
import { IFederation } from '@/v5/store/federations/federations.types';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { formatMessage } from '@/v5/services/intl';
import { isFederation } from '@/v5/store/store.helpers';
import { ShareModal } from '../shareModal.component';

type IShareModalContainerOrFederation = {
	openState: boolean;
	title: string;
	containerOrFederation: IContainer | IFederation;
	onClickClose: () => void;
};

export const ShareModalContainerOrFederation = ({
	containerOrFederation,
	...props
}: IShareModalContainerOrFederation) => {
	const { teamspace, project } = useParams<DashboardParams>();
	const link = prefixBaseDomain(viewerRoute(teamspace, project, containerOrFederation));
	const subject = isFederation(containerOrFederation)
		? formatMessage({ id: 'shareModal.federation.subject', defaultMessage: 'federation' })
		: formatMessage({ id: 'shareModal.container.subject', defaultMessage: 'container' });

	return <ShareModal subject={subject} link={link} {...props} name={containerOrFederation.name} />;
};
