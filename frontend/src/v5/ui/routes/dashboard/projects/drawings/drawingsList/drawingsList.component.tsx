/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { DrawingsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardListCollapse, DashboardListHeader, DashboardListHeaderLabel, DashboardList, DashboardListEmptyContainer, DashboardListEmptySearchResults } from '@components/dashboard/dashboardList';
import { DEFAULT_SORT_CONFIG, useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { VirtualList } from '@controls/virtualList/virtualList.component';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { CollapseSideElementGroup, Container } from '../../containers/containersList/containersList.styles';
import { UploadDrawingRevisionForm } from '../uploadDrawingRevisionForm/uploadDrawingRevisionForm.component';
import { AddCircleIcon } from '../../federations/editFederationModal/editFederation/editFederationContainersList/editFederationContainersListItem/groupOption/groupOption.styles';
import { SearchInput } from '../../tickets/tickets.styles';
import { useCallback, useContext, useState } from 'react';
import { SearchContext, SearchContextType } from '@controls/search/searchContext';
import { Button } from '@controls/button';
import ArrowUpCircleIcon from '@assets/icons/filled/arrow_up_circle-filled.svg';
import { DrawingsListItem } from './drawingsListItem/drawingsListItem.component';
import { DRAWING_LIST_COLUMN_WIDTHS } from '@/v5/store/drawings/drawings.helpers';
import { DrawingListItemLoading } from './drawingsListItem/drawingsListItemLoading.component';
import { IDrawing } from '@/v5/store/drawings/drawings.types';

export const DrawingsList = ({
	emptyMessage,
	title,
	titleTooltips,
	onClickCreate,
}) => {
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

	const { items: drawings, filteredItems: filteredDrawings } = useContext<SearchContextType<IDrawing>>(SearchContext);
	const hasDrawings = drawings.length > 0;

	const selectOrToggleItem = useCallback((id: string) => {
		setSelectedItemId((state) => (state === id ? null : id));
	}, []);

	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const isListPending = DrawingsHooksSelectors.selectIsListPending();
	const areStatsPending = DrawingsHooksSelectors.selectAreStatsPending();
	const canUpload = DrawingsHooksSelectors.selectCanUploadToProject();
	const { sortedList, setSortConfig } = useOrderedList(filteredDrawings, DEFAULT_SORT_CONFIG);

	return (
		<Container>
			<DashboardListCollapse
				title={<>{title} {!isListPending && <CircledNumber>{drawings.length}</CircledNumber>}</>}
				tooltipTitles={titleTooltips}
				isLoading={areStatsPending}
				interactableWhileLoading
				sideElement={(
					<CollapseSideElementGroup>
						<SearchInput
							placeholder={formatMessage({ id: 'drawings.search.placeholder', defaultMessage: 'Search drawings...' })}
						/>
						{ isProjectAdmin && (
							<Button
								startIcon={<AddCircleIcon />}
								variant="outlined"
								color="secondary"
								onClick={onClickCreate}
							>
								<FormattedMessage id="drawings.mainHeader.newDrawing" defaultMessage="New drawing" />
							</Button>
						)}
						{ canUpload && (
							<Button
								startIcon={<ArrowUpCircleIcon />}
								variant="contained"
								color="primary"
								onClick={() => DialogsActionsDispatchers.open(UploadDrawingRevisionForm)}
							>
								<FormattedMessage id="drawings.mainHeader.uploadFiles" defaultMessage="Upload files" />
							</Button>
						)}
					</CollapseSideElementGroup>
				)}
			>
				<DashboardListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
					<DashboardListHeaderLabel name="name" {...DRAWING_LIST_COLUMN_WIDTHS.name}>
						<FormattedMessage id="drawings.list.header.drawing" defaultMessage="Drawing" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="revisionsCount" {...DRAWING_LIST_COLUMN_WIDTHS.revisionsCount}>
						<FormattedMessage id="drawings.list.header.revisions" defaultMessage="Revisions" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="calibration" {...DRAWING_LIST_COLUMN_WIDTHS.calibration}>
						<FormattedMessage id="drawings.list.header.calibration" defaultMessage="2D/3D Calibration" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="number" {...DRAWING_LIST_COLUMN_WIDTHS.number}>
						<FormattedMessage id="drawings.list.header.number" defaultMessage="Drawing Number" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="category" {...DRAWING_LIST_COLUMN_WIDTHS.category}>
						<FormattedMessage id="drawings.list.header.category" defaultMessage="Category" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="lastUpdated" {...DRAWING_LIST_COLUMN_WIDTHS.lastUpdated}>
						<FormattedMessage id="drawings.list.header.lastUpdated" defaultMessage="Last Updated" />
					</DashboardListHeaderLabel>
					<DashboardListHeaderLabel name="isFavourite" {...DRAWING_LIST_COLUMN_WIDTHS.actions}>
						<FormattedMessage id="drawings.list.header.actions" defaultMessage="Actions" />
					</DashboardListHeaderLabel>
				</DashboardListHeader>
				<DashboardList>
					{!isEmpty(sortedList) ? (
						<VirtualList items={sortedList} itemHeight={81} itemContent={
							(drawing, index) => (
								drawing.hasStatsPending ? (
									<DrawingListItemLoading  delay={index / 10} drawing={drawing} key={drawing._id} />
								) : (
									<DrawingsListItem
										key={drawing._id}
										isSelected={drawing._id === selectedItemId}
										drawing={drawing}
										onSelectOrToggleItem={selectOrToggleItem}
									/>
								)
							)
						}/>
					) : (
						<DashboardListEmptyContainer>
							{hasDrawings ? (
								<DashboardListEmptySearchResults />
							) : emptyMessage}
						</DashboardListEmptyContainer>
					)}
				</DashboardList>
			</DashboardListCollapse>
		</Container>
	);
};