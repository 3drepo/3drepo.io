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

// TODO - This is almost identical to containerTitle. Can adapt original component and reuse?

import { viewerRoute } from '@/v5/services/routing/routing';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardListItemTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { FixedOrGrowContainerProps } from '@controls/fixedOrGrowContainer';
import { Highlight } from '@controls/highlight';
import { SearchContext } from '@controls/search/searchContext';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { LatestRevision } from '../../../../containers/containersList/latestRevision/latestRevision.component';

interface IDrawingTitle extends FixedOrGrowContainerProps {
	drawing: any; // TODO add drawing type
	isSelected?: boolean;
	openInNewTab?: boolean;
}

export const DrawingTitle = ({
	drawing,
	isSelected = false,
	openInNewTab = false,
	...props
}: IDrawingTitle): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const { query } = useContext(SearchContext);

	const hasRevisions = drawing.revisionsCount > 0;
	const linkProps = {
		to: hasRevisions || drawing.hasStatsPending ? viewerRoute(teamspace, project, drawing) : '#',
		target: openInNewTab ? '_blank' : '_self',
		rel: 'noopener noreferrer',
	};

	const canLaunchDrawing = drawing.hasStatsPending || hasRevisions; // TODO make sure this uses drawing props

	return (
		<DashboardListItemTitle
			{...props}
			subtitle={!drawing.hasStatsPending && (
				<LatestRevision
					name={(
						<Highlight search={query}>
							{drawing.latestRevision}
						</Highlight>
					)}
					status={drawing.status}
					error={drawing.errorReason}
					hasRevisions={hasRevisions}
				/>
			)}
			selected={isSelected}
			tooltipTitle={canLaunchDrawing ? (
				<FormattedMessage id="drawings.list.item.title.tooltip" defaultMessage="Launch latest revision" />
			) : (
				<FormattedMessage id="drawings.list.item.title.tooltip.empty" defaultMessage="No revisions" />
			)
			}
			disabled={!canLaunchDrawing}
		>
			<Link {...linkProps}>
				<Highlight search={query}>
					{drawing.name}
				</Highlight>
			</Link>
		</DashboardListItemTitle>
	);
};
