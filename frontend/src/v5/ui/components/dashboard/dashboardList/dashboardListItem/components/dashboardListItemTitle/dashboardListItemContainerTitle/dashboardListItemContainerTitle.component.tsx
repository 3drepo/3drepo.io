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
import { FixedOrGrowContainerProps } from '@controls/fixedOrGrowContainer';
import { Highlight } from '@controls/highlight';
import { SearchContext } from '@controls/search/searchContext';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { DashboardListItemTitle } from '../dashboardListItemTitle.component';
import { LatestRevision } from '@components/shared/latestRevision/latestRevision.component';
import { formatMessage } from '@/v5/services/intl';

interface IContainerTitle extends FixedOrGrowContainerProps {
	container: IContainer;
	isSelected?: boolean;
	openInNewTab?: boolean;
	maxCharacterLength?: number;
}

const ellipsisLimits = (length) => {
	const lenghtWithoutEllipsis = length - 5; // (...) + 2 characters for padding
	const max = Math.round((2 / 3) * lenghtWithoutEllipsis);
	const min = lenghtWithoutEllipsis - max;
	return { max, min };
};

const middleEllipsis = (str: string, maxLength: number ) => {
	if (str.length > maxLength) {
		const { max, min } = ellipsisLimits(maxLength);
		return str.substring(0, max) + '...' + str.substring(str.length - min, str.length);
	}

	return str;
};

const cutQuery = (query: string, str: string, maxLength: number) =>{
	if (str.length <= maxLength) {
		return query;
	}

	const index = str.toLowerCase().indexOf(query.toLowerCase());
	
	const { max, min } = ellipsisLimits(maxLength);

	//    1. If the query is at the start of the string and it crosses to the ellipsis.
	// or 2. If the query is in the middle of the dots and cross pass the dots.
	if ((index < max && index + query.length > max) || (index > max && index < str.length - min) ) {
		const totalQuery = ' '.repeat(index) + query + ' '.repeat(Math.max(str.length - (index + query.length), 0));
		const res:string = middleEllipsis(totalQuery, maxLength);
		return res.trim();
	}

	return query;
};

export const DashboardListItemContainerTitle = ({
	container,
	isSelected = false,
	openInNewTab = false,
	maxCharacterLength,
	...props
}: IContainerTitle): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const { query } = useContext(SearchContext);

	const hasRevisions = container.revisionsCount > 0;
	const linkProps = {
		to: hasRevisions || container.hasStatsPending ? viewerRoute(teamspace, project, container) : '#',
		target: openInNewTab ? '_blank' : '_self',
		rel: 'noopener noreferrer',
	};

	const canLaunchContainer = container.hasStatsPending || hasRevisions;

	return (
		<DashboardListItemTitle
			{...props}
			subtitle={!container.hasStatsPending && (
				<LatestRevision
					name={(
						<Highlight search={query}>
							{container.latestRevision}
						</Highlight>
					)}
					status={container.status}
					error={container.errorReason}
					hasRevisions={hasRevisions}
					emptyLabel={formatMessage({ id: 'containers.list.item.title.latestRevision.empty', defaultMessage: 'Container empty' })}
				/>
			)}
			selected={isSelected}
			tooltipTitle={container.name}
			disabled={!canLaunchContainer}
		>
			<Link {...linkProps}>
				<Highlight search={maxCharacterLength ? cutQuery(query, container.name, maxCharacterLength) : query}>
					{maxCharacterLength ? middleEllipsis(container.name, maxCharacterLength) : container.name}
				</Highlight>
			</Link>
		</DashboardListItemTitle>
	);
};
