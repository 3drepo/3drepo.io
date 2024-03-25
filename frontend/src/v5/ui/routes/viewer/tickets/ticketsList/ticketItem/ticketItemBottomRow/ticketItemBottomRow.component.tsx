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

import { DueDateWithLabel } from '@controls/dueDate/dueDateWithLabel/dueDateWithLabel.component';
import { IssuePropertiesRow } from '../ticketItem.styles';
import { PRIORITY_LEVELS_MAP } from '@controls/chip/chip.types';
import { IssueProperties } from '../../../tickets.constants';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { getPropertiesInCamelCase, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { Chip } from '@controls/chip/chip.component';
import { ITicket } from '@/v5/store/tickets/tickets.types';

export const TicketItemBottomRow = ({ _id: ticketId, properties }: ITicket) => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const isFederation = modelIsFederation(containerOrFederation);

	const { dueDate = null, priority } = getPropertiesInCamelCase(properties);

	if (!priority) return null;

	const updateTicketProperty = (value) => TicketsActionsDispatchers
		.updateTicket(teamspace, project, containerOrFederation, ticketId, { properties: value }, isFederation);

	const onChangeDueDate = (newVal) => {
		if (newVal !== dueDate) updateTicketProperty({ [IssueProperties.DUE_DATE]: newVal });
	};

	return (
		<IssuePropertiesRow>
			<DueDateWithLabel value={dueDate} onChange={onChangeDueDate} disabled={readOnly} />
			<Chip {...PRIORITY_LEVELS_MAP[priority]} variant="text" />
		</IssuePropertiesRow>
	);
};