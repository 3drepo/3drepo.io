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

import { ReactNode, useContext, type JSX } from 'react';
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
import { SearchInput } from '@controls/search/searchInput';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { FederationListItem } from '@/v5/ui/routes/dashboard/projects/federations/federationsList/federationListItem';
import { FederationsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { Button } from '@controls/button';
import { formatMessage } from '@/v5/services/intl';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/federations/federationsList/skeletonListItem';
import { Display } from '@/v5/ui/themes/media';
import { SearchContextType, SearchContext } from '@controls/search/searchContext';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { CollapseSideElementGroup, Container } from './federationsList.styles';

type IFederationsList = {
	emptyMessage: ReactNode;
	title: ReactNode;
	titleTooltips: {
		collapsed: ReactNode;
		visible: ReactNode;
	},
	onClickCreate: () => void;
};

export const FederationsList = ({
	emptyMessage,
	title,
	titleTooltips,
	onClickCreate,
}: IFederationsList): JSX.Element => {
	// eslint-disable-next-line max-len
	const { items: federations, filteredItems: filteredFederations } = useContext<SearchContextType<IFederation>>(SearchContext);
	const hasFederations = federations.length > 0;

	const { sortedList, setSortConfig } = useOrderedList(filteredFederations, DEFAULT_SORT_CONFIG);
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const isListPending = FederationsHooksSelectors.selectIsListPending();
	const areStatsPending = FederationsHooksSelectors.selectAreStatsPending();

	return (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && <CircledNumber>{federations.length}</CircledNumber>}</>}
				tooltipTitles={titleTooltips}
				isLoading={areStatsPending}
				sideElement={(
					<CollapseSideElementGroup>
						<SearchInput
							placeholder={formatMessage({ id: 'federations.search.placeholder',
								defaultMessage: 'Search federations...' })}
							disabled={isListPending}
						/>
						{ isProjectAdmin && (
							<Button
								startIcon={<AddCircleIcon />}
								variant="contained"
								color="primary"
								onClick={onClickCreate}
							>
								<FormattedMessage id="federations.newFederation" defaultMessage="New Federation" />
							</Button>
						)}
					</CollapseSideElementGroup>
				)}
			>
				<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
					<DashboardListHeaderLabel name="name" minWidth={90}>
						<FormattedMessage id="federations.list.header.federation" defaultMessage="Federation" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="tickets" width={165} hideWhenSmallerThan={890}>
						<FormattedMessage id="federations.list.header.tickets" defaultMessage="Open tickets" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="containers" width={165} hideWhenSmallerThan={Display.Tablet}>
						<FormattedMessage id="federations.list.header.containers" defaultMessage="Containers" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="code" width={172} minWidth={43}>
						<FormattedMessage id="federations.list.header.code" defaultMessage="Code" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" width={120} minWidth={100}>
						<FormattedMessage id="federations.list.header.lastUpdated" defaultMessage="Last updated" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="isFavourite" width={90}>
						<FormattedMessage id="federations.list.header.actions" defaultMessage="Actions" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				<DashboardList>
					{!isEmpty(sortedList) ? (
						sortedList.map((federation, index) => (federation.hasStatsPending ? (
							<SkeletonListItem delay={index / 10} key={federation._id} />
						) : (
							<FederationListItem
								key={federation._id}
								federation={federation}
							/>
						)))
					) : (
						<DashboardListEmptyContainer>
							{ hasFederations ? (
								<DashboardListEmptySearchResults />
							) : emptyMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
			</DashboardListCollapse>
		</Container>
	);
};
