/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { MenuItem } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { FormSelect } from '@controls/inputs/formInputs.component';
import { formatMessage } from '@/v5/services/intl';
import _ from 'lodash';
import { GROUP_BY_OPTIONS, NONE_OPTION, NONE_OPTION_MESSAGE } from '../ticketsTable/ticketsTable.helper';

const getEntriesSortedByValue = (obj) => _.sortBy(_.toPairs(obj), 1).reverse();

export const GroupByFormSelect = (props) => (
	<FormSelect
		{...props}
		label={formatMessage({ id: 'ticketTable.groupBy.placeholder', defaultMessage: 'Group by:' })}
		renderValue={(groupBy: string | null) => (
			<>
				<FormattedMessage id="ticketTable.groupBy.renderValue" defaultMessage="Group by:" />
				<b> {GROUP_BY_OPTIONS[groupBy] || NONE_OPTION_MESSAGE}</b>
			</>
		)}
	>
		<MenuItem value={NONE_OPTION}>{NONE_OPTION_MESSAGE}</MenuItem>
		{getEntriesSortedByValue(GROUP_BY_OPTIONS).map(([key, val]) => (<MenuItem value={key} key={key}>{val}</MenuItem>))}
	</FormSelect>
);
