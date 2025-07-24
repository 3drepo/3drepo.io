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

import { useEffect, type JSX } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import {
	DashboardListEmptyText,
	Divider,
} from '@components/dashboard/dashboardList/dashboardList.styles';
import { DashboardSkeletonList } from '@components/dashboard/dashboardList/dashboardSkeletonList';
import { Button } from '@controls/button';
import { enableRealtimeNewFederation } from '@/v5/services/realtime/federation.events';
import { SearchContextComponent } from '@controls/search/searchContext';
import { FEDERATION_SEARCH_FIELDS } from '@/v5/store/federations/federations.helpers';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { FederationsList } from './federationsList';
import { SkeletonListItem } from './federationsList/skeletonListItem';
import { CreateFederationForm } from './createFederationForm';
import { useFederationsData } from './federations.hooks';
import { DashboardParams } from '../../../routes.constants';

export const Federations = (): JSX.Element => {
	const {
		federations,
		favouriteFederations,
		isListPending,
	} = useFederationsData();

	const { teamspace, project } = useParams<DashboardParams>();
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	const onClickCreate = () => DialogsActionsDispatchers.open(CreateFederationForm);

	useEffect(() => { enableRealtimeNewFederation(teamspace, project); }, [project]);

	if (isListPending) {
		return (<DashboardSkeletonList itemComponent={<SkeletonListItem />} />);
	}

	return (
		<>
			<SearchContextComponent items={favouriteFederations} fieldsToFilter={FEDERATION_SEARCH_FIELDS}>
				<FederationsList
					onClickCreate={onClickCreate}
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
								defaultMessage="Click on the star to mark a federation as favourite"
							/>
						</DashboardListEmptyText>
					)}
				/>
			</SearchContextComponent>
			<Divider />
			<SearchContextComponent items={federations} fieldsToFilter={FEDERATION_SEARCH_FIELDS}>
				<FederationsList
					onClickCreate={onClickCreate}
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
					emptyMessage={(
						<>
							<DashboardListEmptyText>
								<FormattedMessage id="federations.all.emptyMessage" defaultMessage="You haven’t created any Federations." />
							</DashboardListEmptyText>
							{isProjectAdmin && (
								<Button
									startIcon={<AddCircleIcon />}
									variant="contained"
									color="primary"
									onClick={onClickCreate}
								>
									<FormattedMessage id="federations.all.newFederation" defaultMessage="New Federation" />
								</Button>
							)}
						</>
					)}
				/>
			</SearchContextComponent>
		</>
	);
};
