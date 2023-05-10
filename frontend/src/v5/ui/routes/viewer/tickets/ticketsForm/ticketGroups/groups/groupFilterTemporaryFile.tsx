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

import { FormattedMessage } from 'react-intl';
import { ActionMenu } from '@controls/actionMenu';
import { Typography } from '@controls/typography';
import styled from 'styled-components';
import { GroupFiltersForm } from './groupFiltersForm/groupFiltersForm.component';

export const FiltersActionMenu = styled(ActionMenu).attrs({
	PopoverProps: {
		anchorOrigin: {
			vertical: 'top',
			horizontal: 'right',
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'left',
		},
	}
})`
	padding: 14px;
	box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	display: flex;
	flex-direction: column;
	width: 328px;
	border-radius: 10px;
`;

export const TriggerButton = styled(Typography).attrs({
	variant: 'link',
})`
	cursor: pointer;
	margin-left: auto;
	width: fit-content;
`;

export const GroupFiltersWithTriggerButton = () => (
	<FiltersActionMenu TriggerButton={(
		<TriggerButton>
			<FormattedMessage id="tickets.groups.addFilter" defaultMessage="Add filter" />
		</TriggerButton>
	)}>
		<GroupFiltersForm />
	</FiltersActionMenu>
);
