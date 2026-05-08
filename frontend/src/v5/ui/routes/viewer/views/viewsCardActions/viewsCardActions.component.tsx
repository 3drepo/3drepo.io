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

