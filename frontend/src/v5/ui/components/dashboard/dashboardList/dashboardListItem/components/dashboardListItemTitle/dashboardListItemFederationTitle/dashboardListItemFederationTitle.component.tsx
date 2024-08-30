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

import { viewerRoute } from '@/v5/services/routing/routing';
import { ContainerUploadStatus } from '@/v5/store/containers/containers.types';
import { IFederation } from '@/v5/store/federations/federations.types';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { FixedOrGrowContainerProps } from '@controls/fixedOrGrowContainer';
import { Highlight } from '@controls/highlight';
import { SearchContext } from '@controls/search/searchContext';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { DashboardListItemTitle } from '../dashboardListItemTitle.component';
import { RevisionStatus } from '@components/shared/latestRevision/revisionStatus/revisionStatus.component';

interface IFederationTitle extends FixedOrGrowContainerProps {
	federation: IFederation;
}

export const DashboardListItemFederationTitle = ({
	federation,
}: IFederationTitle): JSX.Element => {
	const { teamspace, project } = useParams<DashboardParams>();
	const { query } = useContext(SearchContext);

	const { status, desc, name } = federation;
	const uploadStatus = status === ContainerUploadStatus.OK
		? <Highlight search={query}>{desc}</Highlight>
		: <RevisionStatus status={status} name={name} />;

	return (
		<DashboardListItemTitle
			subtitle={uploadStatus}
			tooltipTitle={
				<FormattedMessage id="federations.list.item.title.tooltip" defaultMessage="Launch in Viewer" />
			}
		>
			<Link to={viewerRoute(teamspace, project, federation)}>
				<Highlight search={query}>
					{name}
				</Highlight>
			</Link>
		</DashboardListItemTitle>
	);
};
