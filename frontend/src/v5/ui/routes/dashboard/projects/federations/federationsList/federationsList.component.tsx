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

import { ReactNode } from 'react';
import { useParams } from 'react-router';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
	DashboardList,
	DashboardListCollapse,
	DashboardListEmptyContainer,
	DashboardListEmptySearchResults,
	DashboardListHeader,
	DashboardListHeaderLabel,
} from '@components/dashboard/dashboardList';
import { IFederation } from '@/v5/store/federations/federations.types';
import { SearchInput } from '@controls/searchInput';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import { FederationListItem } from '@/v5/ui/routes/dashboard/projects/federations/federationsList/federationListItem';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks/federationsSelectors.hooks';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { Button } from '@controls/button';
import { DashboardListButton, DashedButtonContainer } from '@components/dashboard/dashboardList/dashboardList.styles';
import { formatMessage } from '@/v5/services/intl';
import { Display } from '@/v5/ui/themes/media';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { CollapseSideElementGroup, Container } from './federationsList.styles';

type IFederationsList = {
	emptyMessage: ReactNode;
	federations: IFederation[];
	title: ReactNode;
	titleTooltips: {
		collapsed: ReactNode;
		visible: ReactNode;
	},
	hasFederations: boolean;
	showBottomButton?: boolean;
	onClickCreate: () => void;
	onFilterQueryChange? : (query: string) => void;
	filterQuery?: string;
};

export const FederationsList = ({
	emptyMessage,
	federations,
	title,
	titleTooltips,
	filterQuery,
	onFilterQueryChange,
	onClickCreate,
	showBottomButton = false,
	hasFederations,
}: IFederationsList): JSX.Element => {
	const { teamspace, project } = useParams<DashboardParams>();

	const { sortedList, setSortConfig } = useOrderedList(federations, DEFAULT_SORT_CONFIG);

	const isListPending = FederationsHooksSelectors.selectIsListPending();
	const areStatsPending = FederationsHooksSelectors.selectAreStatsPending();

	const setFavourite = (id: string, value: boolean) => {
		if (value) {
			FederationsActionsDispatchers.addFavourite(teamspace, project, id);
		} else {
			FederationsActionsDispatchers.removeFavourite(teamspace, project, id);
		}
	};

	return (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && `(${federations.length})`}</>}
				tooltipTitles={titleTooltips}
				isLoading={areStatsPending}
				sideElement={(
					<CollapseSideElementGroup>
						<SearchInput
							onClear={() => onFilterQueryChange('')}
							onChange={(event) => onFilterQueryChange(event.currentTarget.value)}
							value={filterQuery}
							placeholder={formatMessage({ id: 'federations.search.placeholder',
								defaultMessage: 'Search...' })}
							disabled={isListPending}
						/>
						<Button
							startIcon={<AddCircleIcon />}
							variant="contained"
							color="primary"
							onClick={onClickCreate}
						>
							<FormattedMessage id="federations.newFederation" defaultMessage="New Federation" />
						</Button>
					</CollapseSideElementGroup>
				)}
			>
				<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
					<DashboardListHeaderLabel name="name" minWidth={90}>
						<FormattedMessage id="federations.list.header.federation" defaultMessage="Federation" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="issues" width={165} hideWhenSmallerThan={1080}>
						<FormattedMessage id="federations.list.header.issues" defaultMessage="Open issues" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="risks" width={165} hideWhenSmallerThan={890}>
						<FormattedMessage id="federations.list.header.risks" defaultMessage="Open risks" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="containers" width={165} hideWhenSmallerThan={Display.Tablet}>
						<FormattedMessage id="federations.list.header.containers" defaultMessage="Containers" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="code" width={188} minWidth={43}>
						<FormattedMessage id="federations.list.header.code" defaultMessage="Code" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={180} minWidth={150}>
						<FormattedMessage id="federations.list.header.lastUpdated" defaultMessage="Last updated" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				<DashboardList>
					{!isEmpty(sortedList) ? (
						sortedList.map((federation, index) => (
							<FederationListItem
								index={index}
								key={federation._id}
								federation={federation}
								filterQuery={filterQuery}
								onFavouriteChange={setFavourite}
							/>
						))
					) : (
						<DashboardListEmptyContainer>
							{filterQuery && hasFederations ? (
								<DashboardListEmptySearchResults searchPhrase={filterQuery} />
							) : emptyMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
				{showBottomButton && !isListPending && hasFederations && (
					<DashedButtonContainer>
						<DashboardListButton
							startIcon={<AddCircleIcon />}
							onClick={onClickCreate}
						>
							<FormattedMessage id="federations.addFederationButton" defaultMessage="Add new Federation" />
						</DashboardListButton>
					</DashedButtonContainer>
				)}
			</DashboardListCollapse>
		</Container>
	);
};
