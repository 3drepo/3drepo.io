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

import { memo, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { formatShortDateTime } from '@/v5/helpers/intl.helper';
import { DrawingsListItemTitle } from './drawingsListItemTitle/drawingsListItemTitle.component';
import { DrawingsCalibrationButton } from './drawingsCalibrationButton/drawingsCalibrationButton.styles';
import { IsMainList } from '../../../containers/mainList.context';
import { DrawingsEllipsisMenu } from './drawingsEllipsisMenu/drawingsEllipsisMenu.component';
import { DRAWING_LIST_COLUMN_WIDTHS } from '@/v5/store/drawings/drawings.helpers';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { DialogsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { DrawingRevisionDetails } from '@components/shared/drawingRevisionDetails/drawingRevisionDetails.component';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { SelectModelForCalibration } from './selectModelForCalibration/selectModelForCalibration.component';

interface IDrawingsListItem {
	isSelected: boolean;
	drawing: IDrawing;
	onSelectOrToggleItem: (id: string) => void;
}

export const DrawingsListItem = memo(({
	isSelected,
	drawing,
	onSelectOrToggleItem,
}: IDrawingsListItem) => {
	const { teamspace, project } = useParams<DashboardParams>();
	const isMainList = useContext(IsMainList);
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const drawingId = drawing._id;

	const onChangeFavourite = ({ currentTarget: { checked } }) => {
		if (checked) {
			DrawingsActionsDispatchers.addFavourite(teamspace, project, drawingId);
		} else {
			DrawingsActionsDispatchers.removeFavourite(teamspace, project, drawingId);
		}
	};

	useEffect(() => {
		if (isMainList) {
			// TODO - add realtime events
		}
		return null;
	}, [drawingId]);

	return (
		<DashboardListItem selected={isSelected} key={drawingId}>
			<DashboardListItemRow selected={isSelected} onClick={() => onSelectOrToggleItem(drawingId)}>
				<DrawingsListItemTitle
					drawing={drawing}
					isSelected={isSelected}
					{...DRAWING_LIST_COLUMN_WIDTHS.name}
				/>
				<DashboardListItemButton
					onClick={() => onSelectOrToggleItem(drawingId)}
					tooltipTitle={
						<FormattedMessage id="drawings.list.item.revisions.tooltip" defaultMessage="View revisions" />
					}
					{...DRAWING_LIST_COLUMN_WIDTHS.revisionsCount}
				>
					<FormattedMessage
						id="drawings.list.item.revisions"
						defaultMessage="{count, plural, =0 {No revisions} one {# revision} other {# revisions}}"
						values={{ count: drawing.revisionsCount }}
					/>
				</DashboardListItemButton>
				<DrawingsCalibrationButton
					calibration={drawing.calibration}
					onClick={() => DialogsActionsDispatchers.open(SelectModelForCalibration, { drawingId })}
					disabled={!isProjectAdmin}
					tooltipTitle={
						isProjectAdmin && <FormattedMessage id="drawings.list.item.calibration.tooltip" defaultMessage="Calibrate" />
					}
					{...DRAWING_LIST_COLUMN_WIDTHS.calibration}
				/>
				<DashboardListItemText selected={isSelected} {...DRAWING_LIST_COLUMN_WIDTHS.drawingNumber}>
					{drawing.drawingNumber}
				</DashboardListItemText>
				<DashboardListItemText selected={isSelected} {...DRAWING_LIST_COLUMN_WIDTHS.category}>
					{drawing.category}
				</DashboardListItemText>
				<DashboardListItemText
					selected={isSelected}
					dontHighlight
					{...DRAWING_LIST_COLUMN_WIDTHS.lastUpdated}
				>
					{drawing.lastUpdated && formatShortDateTime(drawing.lastUpdated)}
				</DashboardListItemText>
				<DashboardListItemIcon>
					<FavouriteCheckbox
						checked={drawing.isFavourite}
						selected={isSelected}
						onChange={onChangeFavourite}
					/>
				</DashboardListItemIcon>
				<DashboardListItemIcon selected={isSelected}>
					<DrawingsEllipsisMenu
						selected={isSelected}
						drawing={drawing}
						onSelectOrToggleItem={onSelectOrToggleItem}
					/>
				</DashboardListItemIcon>
			</DashboardListItemRow>
			{isSelected && (
				<DrawingRevisionDetails
					drawingId={drawingId}
					revisionsCount={drawing.revisionsCount}
					status={drawing.status}
				/>
			)}
		</DashboardListItem>
	);
});
