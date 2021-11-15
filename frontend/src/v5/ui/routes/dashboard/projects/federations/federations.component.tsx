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

import React from 'react';
import { Trans } from '@lingui/react';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import {
	DashboardListEmptyText,
	Divider,
} from '@components/dashboard/dashboardList/dashboardList.styles';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks/federationsSelectors.hooks';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { DashboardSkeletonList } from '@components/dashboard/dashboardList/dashboardSkeletonList';
import { Content } from '@/v5/ui/routes/dashboard/projects/projects.styles';
import { Button } from '@controls/button';
import { useFederationsData } from './federations.hooks';
import { FederationsList } from './federationsList';
import { SkeletonListItem } from './federationsList/skeletonListItem';

export const Federations = (): JSX.Element => {
	const {
		filteredFederations,
		favouriteFederations,
		hasFederations,
		isListPending,
	} = useFederationsData();

	const favouritesFilterQuery = FederationsHooksSelectors.selectFavouritesFilterQuery();
	const allFilterQuery = FederationsHooksSelectors.selectAllFilterQuery();
	const { setFavouritesFilterQuery, setAllFilterQuery } = FederationsActionsDispatchers;

	return (
		<Content>
			{isListPending ? (
				<DashboardSkeletonList itemComponent={<SkeletonListItem />} />
			) : (
				<>
					<FederationsList
						hasFederations={hasFederations.favourites}
						search={{
							query: favouritesFilterQuery,
							dispatcher: setFavouritesFilterQuery,
						}}
						federations={favouriteFederations}
						title={(
							<Trans
								id="federations.favourites.collapseTitle"
								message="Favourites"
							/>
						)}
						titleTooltips={{
							collapsed: <Trans id="federations.favourites.collapse.tooltip.show" message="Show favourites" />,
							visible: <Trans id="federations.favourites.collapse.tooltip.hide" message="Hide favourites" />,
						}}
						emptyMessage={(
							<DashboardListEmptyText>
								<Trans
									id="federations.favourites.emptyMessage"
									message="You haven’t added any Favourites. Click the star on a Federation to add your first favourite Federation."
								/>
							</DashboardListEmptyText>
						)}
					/>
					<Divider />
					<FederationsList
						hasFederations={hasFederations.all}
						search={{
							query: allFilterQuery,
							dispatcher: setAllFilterQuery,
						}}
						federations={filteredFederations}
						title={(
							<Trans
								id="federations.all.collapseTitle"
								message="All Federations"
							/>
						)}
						titleTooltips={{
							collapsed: <Trans id="federations.all.collapse.tooltip.show" message="Show federations" />,
							visible: <Trans id="federations.all.collapse.tooltip.hide" message="Hide federations" />,
						}}
						showBottomButton
						emptyMessage={(
							<>
								<DashboardListEmptyText>
									<Trans id="federations.all.emptyMessage" message="You haven’t created any Federations." />
								</DashboardListEmptyText>
								<Button
									startIcon={<AddCircleIcon />}
									variant="contained"
									color="primary"
								>
									<Trans id="federations.all.newFederation" message="New Federation" />
								</Button>
							</>
						)}
					/>
				</>
			)}
		</Content>
	);
};
