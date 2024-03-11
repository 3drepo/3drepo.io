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
import { FormattedMessage } from 'react-intl';
import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { Display } from '@/v5/ui/themes/media';
import { formatShortDateTime } from '@/v5/helpers/intl.helper';
import { DrawingTitle } from './drawingTitle/drawingTitle.component';
import { IsMainList } from '../../../containers/mainList.context';
import { DrawingsEllipsisMenu } from './drawingsEllipsisMenu/drawingsEllipsisMenu.component';
import { DRAWING_LIST_COLUMN_WIDTHS } from '@/v5/store/drawings/drawings.helpers';

interface IDrawingsListItem {
	isSelected: boolean;
	drawing: any; // TODO add drawing type
	onSelectOrToggleItem: (id: string) => void;
}

export const DrawingListItem = memo(({
	isSelected,
	drawing,
	onSelectOrToggleItem,
}: IDrawingsListItem): JSX.Element => {
	const isMainList = useContext(IsMainList);

	useEffect(() => {
		if (isMainList) {
			// TODO add realtime events
		}
		return null;
	}, [drawing._id]);

	const onChangeFavourite = () => {
		// TODO add set favourite call
	};

	return (
		<DashboardListItem
			selected={isSelected}
			key={drawing._id}
		>
			<DashboardListItemRow
				selected={isSelected}
				onClick={() => onSelectOrToggleItem(drawing._id)}
			>
				<DrawingTitle
					drawing={drawing}
					isSelected={isSelected}
				/>
				<DashboardListItemButton
					onClick={() => onSelectOrToggleItem(drawing._id)}
					width={DRAWING_LIST_COLUMN_WIDTHS.name}
					hideWhenSmallerThan={Display.Desktop}
					tooltipTitle={
						<FormattedMessage id="drawings.list.item.revisions.tooltip" defaultMessage="View revisions" />
					}
				>
					<FormattedMessage
						id="drawings.list.item.revisions"
						defaultMessage="{count, plural, =0 {No revisions} one {# revision} other {# revisions}}"
						values={{ count: drawing.total }}
					/>
				</DashboardListItemButton>
				{/* Todo add actual calibration button component */}
				<DashboardListItemButton
					onClick={() => onSelectOrToggleItem(drawing._id)}
					width={DRAWING_LIST_COLUMN_WIDTHS.calibration}
					hideWhenSmallerThan={Display.Desktop}
					tooltipTitle={
						<FormattedMessage id="drawings.list.item.calibration.tooltip" defaultMessage="Calibration state" /> // TODO What should this be??
					}
				>
					{/* Todo add value */}
					Calibrated 
				</DashboardListItemButton>
				<DashboardListItemText
					selected={isSelected}
					width={DRAWING_LIST_COLUMN_WIDTHS.code}
				>
					{drawing.code || 'PH' + Math.random() ** 2}
					{/* TODO - remove placeholder */}
				</DashboardListItemText>
				<DashboardListItemText
					width={DRAWING_LIST_COLUMN_WIDTHS.type}
					hideWhenSmallerThan={Display.Tablet}
					selected={isSelected}
				>
					{drawing.type || 'Lorem'}
					{/* TODO - remove placeholder */}
				</DashboardListItemText>
				<DashboardListItemText
					width={DRAWING_LIST_COLUMN_WIDTHS.lastUpdated}
					selected={isSelected}
					dontHighlight
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
				<div> Revisions...</div>
			)}
		</DashboardListItem>
	);
});
