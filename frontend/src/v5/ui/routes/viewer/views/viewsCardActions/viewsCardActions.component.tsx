import { SortAmountDown, SortAmountUp } from '@/v4/routes/components/fontAwesomeIcon';
import { formatMessage } from '@/v5/services/intl';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { CardAction } from '@components/viewer/cards/cardAction/cardAction.styles';
import { Tooltip } from '@mui/material';

export const ViewsCardActions = ({ sortOrder, setSortOrder }) => (
	<Tooltip
		title={formatMessage({ id: 'viewer.card.views.sortOrder', defaultMessage: 'Change sorting order' })}
		onClick={() => setSortOrder(sortOrder === SortingDirection.ASCENDING ? SortingDirection.DESCENDING : SortingDirection.ASCENDING)} >
		<CardAction>
			{sortOrder === SortingDirection.ASCENDING ? <SortAmountUp /> : <SortAmountDown />}
		</CardAction>
	</Tooltip>
);
