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

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { DrawingsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { SearchContextComponent } from '@controls/search/searchContext';
import { FormattedMessage } from 'react-intl';
import { DashboardListEmptyText, Divider } from '@components/dashboard/dashboardList/dashboardList.styles';
import { IsMainList } from '../containers/mainList.context';
import { Button } from '@controls/button';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { DrawingsList } from './drawingsList/drawingsList.component';
import { DRAWINGS_SEARCH_FIELDS } from '@/v5/store/drawings/drawings.helpers';
import { DialogsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CreateDrawingDialog } from './drawingDialogs/createDrawingDialog.component';
import { DashboardSkeletonList } from '@components/dashboard/dashboardList/dashboardSkeletonList/dashboardSkeletonList.component';
import { SkeletonListItem } from '../containers/containersList/skeletonListItem/skeletonListItem.component';
import { enableRealtimeNewDrawing } from '@/v5/services/realtime/drawings.events';

export const Drawings = () => {
	const { teamspace, project } = useParams<DashboardParams>();
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const isListPending = DrawingsHooksSelectors.selectIsListPending();
	const drawings = DrawingsHooksSelectors.selectDrawings();
	const favouriteDrawings = DrawingsHooksSelectors.selectFavouriteDrawings();

	useEffect(() => {
		if (!project) return;
		DrawingsActionsDispatchers.fetchDrawings(teamspace, project);
	}, [project]);

	const onClickCreate = () => DialogsActionsDispatchers.open(CreateDrawingDialog);

	useEffect(() => { enableRealtimeNewDrawing(teamspace, project); }, [project]);
	useEffect(() => () => { DrawingsActionsDispatchers.resetDrawingStatsQueue(); }, []);

	if (isListPending) return (<DashboardSkeletonList itemComponent={<SkeletonListItem />} />);

	return (
		<>
			<SearchContextComponent items={favouriteDrawings} fieldsToFilter={DRAWINGS_SEARCH_FIELDS}>
				<DrawingsList
					title={(
						<FormattedMessage
							id="drawings.favourites.collapseTitle"
							defaultMessage="Favourites"
						/>
					)}
					titleTooltips={{
						collapsed: <FormattedMessage id="drawings.favourites.collapse.tooltip.show" defaultMessage="Show favourites" />,
						visible: <FormattedMessage id="drawings.favourites.collapse.tooltip.hide" defaultMessage="Hide favourites" />,
					}}
					onClickCreate={onClickCreate}
					emptyMessage={(
						<DashboardListEmptyText>
							<FormattedMessage
								id="drawings.favourites.emptyMessage"
								defaultMessage="Click on the star to mark a drawing as favourite"
							/>
						</DashboardListEmptyText>
					)}
				/>
			</SearchContextComponent>
			<Divider />
			<IsMainList.Provider value>
				<SearchContextComponent items={drawings} fieldsToFilter={DRAWINGS_SEARCH_FIELDS}>
					<DrawingsList
						title={(
							<FormattedMessage
								id="drawings.all.collapseTitle"
								defaultMessage="All Drawings"
							/>
						)}
						titleTooltips={{
							collapsed: <FormattedMessage id="drawings.all.collapse.tooltip.show" defaultMessage="Show all" />,
							visible: <FormattedMessage id="drawings.all.collapse.tooltip.hide" defaultMessage="Hide all" />,
						}}
						onClickCreate={onClickCreate}
						emptyMessage={(
							<>
								<DashboardListEmptyText>
									<FormattedMessage id="drawings.all.emptyMessage" defaultMessage="You haven’t created any drawings." />
								</DashboardListEmptyText>
								{ isProjectAdmin && (
									<Button
										startIcon={<AddCircleIcon />}
										variant="contained"
										color="primary"
										onClick={onClickCreate}
									>
										<FormattedMessage id="drawings.all.newDrawing" defaultMessage="New Drawing" />
									</Button>
								)}
							</>
						)}
					/>
				</SearchContextComponent>
			</IsMainList.Provider>
		</>
	);
};