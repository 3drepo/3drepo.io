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
import {
	DashboardListItemIcon,
	DashboardListItemRow,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';

import { DashboardListItem } from '@components/dashboard/dashboardList';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ButtonSkeleton, SkeletonBlock } from '@controls/skeletonBlock/skeletonBlock.styles';
import { DrawingsListItemTitle } from './drawingsListItemTitle/drawingsListItemTitle.component';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { DrawingsEllipsisMenu } from './drawingsEllipsisMenu/drawingsEllipsisMenu.component';
import { DRAWING_LIST_COLUMN_WIDTHS } from '@/v5/store/drawings/drawings.helpers';

interface IDrawingListItem {
	drawing: IDrawing;
	delay?: number;
}

export const DrawingListItemLoading = ({
	drawing,
	delay,
}: IDrawingListItem): JSX.Element => {
	const { teamspace, project } = useParams<DashboardParams>();

	const onChangeFavourite = ({ currentTarget: { checked } }) => {
		if (checked) {
			DrawingsActionsDispatchers.addFavourite(teamspace, project, drawing._id);
		} else {
			DrawingsActionsDispatchers.removeFavourite(teamspace, project, drawing._id);
		}
	};

	useEffect( () => {
		DrawingsActionsDispatchers.fetchDrawingStats(teamspace, project, drawing._id);
	}, []);

	return (
		<DashboardListItem>
			<DashboardListItemRow>
				<DrawingsListItemTitle drawing={drawing} {...DRAWING_LIST_COLUMN_WIDTHS.name} />
				<FixedOrGrowContainer {...DRAWING_LIST_COLUMN_WIDTHS.revisionsCount} >
					<ButtonSkeleton delay={delay} />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer {...DRAWING_LIST_COLUMN_WIDTHS.calibration} >
					<ButtonSkeleton delay={delay} />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer {...DRAWING_LIST_COLUMN_WIDTHS.number}>
					<SkeletonBlock delay={delay} width="80%" />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer {...DRAWING_LIST_COLUMN_WIDTHS.type} >
					<SkeletonBlock delay={delay} width="80%" />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer {...DRAWING_LIST_COLUMN_WIDTHS.lastUpdated} >
					<SkeletonBlock delay={delay} width="80%" />
				</FixedOrGrowContainer>
				<DashboardListItemIcon>
					<FavouriteCheckbox checked={drawing.isFavourite} onChange={onChangeFavourite} />
				</DashboardListItemIcon>
				<DashboardListItemIcon >
					<DrawingsEllipsisMenu drawing={drawing} />
				</DashboardListItemIcon>
			</DashboardListItemRow>
		</DashboardListItem>
	);
};
