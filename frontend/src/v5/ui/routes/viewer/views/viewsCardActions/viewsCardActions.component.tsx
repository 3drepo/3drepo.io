/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { SortAmountDown, SortAmountUp } from '@/v4/routes/components/fontAwesomeIcon';
import { ViewpointsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { ViewpointsHooksSelectors } from '@/v5/services/selectorsHooks';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { CardAction } from '@components/viewer/cards/cardAction/cardAction.styles';
import { Tooltip } from '@mui/material';

export const ViewsCardActions = () => {
	const onClickSort = () => ViewpointsActionsDispatchers.toggleSortOrder();
	const sortOrder = ViewpointsHooksSelectors.selectSortOrder();
	return (
		<Tooltip
			title={formatMessage({ id: 'viewer.card.views.sortOrder', defaultMessage: 'Change sorting order' })}
			onClick={onClickSort} >
			<CardAction>
				{sortOrder === SortingDirection.ASCENDING ? <SortAmountUp /> : <SortAmountDown />}
			</CardAction>
		</Tooltip>
	);
};

