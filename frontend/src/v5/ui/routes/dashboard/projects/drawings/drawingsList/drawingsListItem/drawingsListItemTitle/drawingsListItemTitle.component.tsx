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

import { DashboardListItemTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { FixedOrGrowContainerProps } from '@controls/fixedOrGrowContainer';
import { Highlight } from '@controls/highlight';
import { SearchContext } from '@controls/search/searchContext';
import { useContext, type JSX } from 'react';
import { FormattedMessage } from 'react-intl';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { LatestRevision } from '@components/shared/latestRevision/latestRevision.component';
import { formatMessage } from '@/v5/services/intl';

interface IDrawingsListItemTitle extends FixedOrGrowContainerProps {
	drawing: IDrawing;
	isSelected?: boolean;
}

export const DrawingsListItemTitle = ({
	drawing,
	isSelected = false,
	...props
}: IDrawingsListItemTitle): JSX.Element => {
	const { query } = useContext(SearchContext);
	const hasRevisions = drawing.revisionsCount > 0;
	const canLaunchDrawing = drawing.hasStatsPending || hasRevisions;

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
					emptyLabel={formatMessage({ id: 'drawings.list.item.title.latestRevision.empty', defaultMessage: 'Drawing empty' })}
				/>
			)}
			selected={isSelected}
			tooltipTitle={ !isSelected ? 
				(<FormattedMessage id="drawings.list.item.title.tooltip.showRevisions" defaultMessage="Show revisions" />) :
				(<FormattedMessage id="drawings.list.item.title.tooltip.hideRevisions" defaultMessage="Hide revisions" />)
			}
			disabled={!canLaunchDrawing}
		>
			{/* TODO - add open drawing functionality */}
			<Highlight search={query}>
				{drawing.name}
			</Highlight>
		</DashboardListItemTitle>
	);
};
