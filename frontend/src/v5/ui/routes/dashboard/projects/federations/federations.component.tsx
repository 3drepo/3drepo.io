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
import { MainHeader } from '@controls/mainHeader';
import { Trans } from '@lingui/react';
import {
	Container,
	Content,
	NewContainerMainHeaderButton,
	UploadFileButton,
} from '@/v5/ui/routes/dashboard/projects/containers/containers.styles';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import ArrowUpCircleIcon from '@assets/icons/arrow_up_circle.svg';
import { DashboardListButton, DashboardListEmptyText } from '@components/dashboard/dashboardList/dasboardList.styles';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks/federationsSelectors.hooks';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { useFederationsData } from './federations.hooks';
import { FederationsList } from './federationsList';

export const Federations = (): JSX.Element => {
	const {
		filteredFederations,
		favouriteFederations,
		hasFederations,
		isPending,
	} = useFederationsData();

	return (
		<Container>
			<MainHeader>
				<NewContainerMainHeaderButton
					startIcon={<AddCircleIcon />}
					variant="outlined"
					color="secondary"
					disabled={isPending}
				>
					<Trans id="federations.mainHeader.newContainer" message="New Container" />
				</NewContainerMainHeaderButton>
				<UploadFileButton
					startIcon={<ArrowUpCircleIcon />}
					variant="contained"
					color="primary"
					disabled={isPending}
				>
					<Trans id="federations.mainHeader.uploadFile" message="Upload file" />
				</UploadFileButton>
			</MainHeader>
			<Content>
				<FederationsList
					search={{
						query: FederationsHooksSelectors.selectFavouritesFilterQuery(),
						dispatcher: FederationsActionsDispatchers.setFavouritesFilterQuery,
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
								message="You haven’t added any Favourites. Click the star on a container to add your first favourite Container."
							/>
						</DashboardListEmptyText>
					)}
				/>
				<FederationsList
					search={{
						query: FederationsHooksSelectors.selectAllFilterQuery(),
						dispatcher: FederationsActionsDispatchers.setAllFilterQuery,
					}}
					federations={filteredFederations}
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
								message="You haven’t added any Favourites. Click the star on a container to add your first favourite Container."
							/>
						</DashboardListEmptyText>
					)}
				/>
				{
					hasFederations.all && (
						<DashboardListButton
							startIcon={<AddCircleIcon />}
							onClick={() => {
								// eslint-disable-next-line no-console
								console.log('->  handle add federation');
							}}
						>
							<Trans id="federations.addFederationButton" message="Add new Federation" />
						</DashboardListButton>
					)
				}
			</Content>
		</Container>
	);
};
