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
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { IContainer } from '@/v5/store/containers/containers.types';
import { LatestRevision } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision/latestRevision.component';
import { FixedOrGrowContainerProps } from '@controls/fixedOrGrowContainer';
import { Highlight } from '@controls/highlight';
import { SearchContext } from '@controls/search/searchContext';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { DashboardListItemTitle } from '../dashboardListItemTitle.component';

interface IContainerTitle extends FixedOrGrowContainerProps {
	container: IContainer;
	isSelected?: boolean;
	openInNewTab?: boolean;
}

export const DashboardListItemContainerTitle = ({
	container,
	isSelected = false,
	openInNewTab = false,
}: IContainerTitle): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const { query } = useContext(SearchContext);

	const hasRevisions = container.revisionsCount > 0;
	const linkProps = {
		to: hasRevisions ? viewerRoute(teamspace, project, container) : '#',
		target: openInNewTab ? '_blank' : '_self',
		rel: 'noopener noreferrer',
	};

	return (
		<DashboardListItemTitle
			subtitle={(
				<LatestRevision
					name={(
						<Highlight search={[query]}>
							{container.latestRevision}
						</Highlight>
					)}
					status={container.status}
					error={container.errorReason}
					hasRevisions={hasRevisions}
				/>
			)}
			selected={isSelected}
			tooltipTitle={
				hasRevisions ? (
					<FormattedMessage id="containers.list.item.title.tooltip" defaultMessage="Launch latest revision" />
				) : (
					<FormattedMessage id="containers.list.item.title.tooltip.empty" defaultMessage="No revisions" />
				)
			}
			disabled={!hasRevisions}
		>
			<Link {...linkProps}>
				<Highlight search={[query]}>
					{container.name}
				</Highlight>
			</Link>
		</DashboardListItemTitle>
	);
};
