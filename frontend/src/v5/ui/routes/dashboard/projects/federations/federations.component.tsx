/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import AddCircleIcon from '@assets/icons/add_circle.svg';
import {
	DashboardListEmptyText,
	Divider,
} from '@components/dashboard/dashboardList/dashboardList.styles';
import { DashboardSkeletonList } from '@components/dashboard/dashboardList/dashboardSkeletonList';
import { Button } from '@controls/button';
import { filterFederations } from '@/v5/store/federations/federations.helpers';
import { useParams } from 'react-router';
import { enableRealtimeFederationUpdates } from '@/v5/services/realtime/federation.events';
import { useFederationsData } from './federations.hooks';
import { FederationsList } from './federationsList';
import { SkeletonListItem } from './federationsList/skeletonListItem';

export const Federations = (): JSX.Element => {
	const { teamspace, project } = useParams();
	const {
		federations,
		favouriteFederations,
		hasFederations,
		isListPending,
	} = useFederationsData();

	useEffect(() => {
		if (isListPending) return null;
		return enableRealtimeFederationUpdates(teamspace, project);
	}, [isListPending]);

	const [favouritesFilterQuery, setFavouritesFilterQuery] = useState<string>('');
	const [allFilterQuery, setAllFilterQuery] = useState<string>('');

	return (
		<>
			{isListPending ? (
				<DashboardSkeletonList itemComponent={<SkeletonListItem />} />
			) : (
				<>
					<FederationsList
						hasFederations={hasFederations.favourites}
						filterQuery={favouritesFilterQuery}
						onFilterQueryChange={setFavouritesFilterQuery}
						federations={filterFederations(favouriteFederations, favouritesFilterQuery)}
						title={(
							<FormattedMessage
								id="federations.favourites.collapseTitle"
								defaultMessage="Favourites"
							/>
						)}
						titleTooltips={{
							collapsed: <FormattedMessage id="federations.favourites.collapse.tooltip.show" defaultMessage="Show favourites" />,
							visible: <FormattedMessage id="federations.favourites.collapse.tooltip.hide" defaultMessage="Hide favourites" />,
						}}
						emptyMessage={(
							<DashboardListEmptyText>
								<FormattedMessage
									id="federations.favourites.emptyMessage"
									defaultMessage="You haven’t added any Favourites. Click the star on a Federation to add your first favourite Federation."
								/>
							</DashboardListEmptyText>
						)}
					/>
					<Divider />
					<FederationsList
						hasFederations={hasFederations.all}
						filterQuery={allFilterQuery}
						onFilterQueryChange={setAllFilterQuery}
						federations={filterFederations(federations, allFilterQuery)}
						title={(
							<FormattedMessage
								id="federations.all.collapseTitle"
								defaultMessage="All Federations"
							/>
						)}
						titleTooltips={{
							collapsed: <FormattedMessage id="federations.all.collapse.tooltip.show" defaultMessage="Show federations" />,
							visible: <FormattedMessage id="federations.all.collapse.tooltip.hide" defaultMessage="Hide federations" />,
						}}
						showBottomButton
						emptyMessage={(
							<>
								<DashboardListEmptyText>
									<FormattedMessage id="federations.all.emptyMessage" defaultMessage="You haven’t created any Federations." />
								</DashboardListEmptyText>
								<Button
									startIcon={<AddCircleIcon />}
									variant="contained"
									color="primary"
								>
									<FormattedMessage id="federations.all.newFederation" defaultMessage="New Federation" />
								</Button>
							</>
						)}
					/>
				</>
			)}
		</>
	);
};
