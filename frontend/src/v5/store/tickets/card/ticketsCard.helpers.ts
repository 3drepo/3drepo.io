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

import { IssueProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ITicket } from '../tickets.types';
import { TicketStatuses, TreatmentStatuses } from '@controls/chip/chip.types';
import { get } from 'lodash';

export const getTicketIsCompleted = (ticket: ITicket): boolean => {
	const issuePropertyStatus = get(ticket, `properties.${IssueProperties.STATUS}`);
	const treatmentStatus = get(ticket, `modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`);

	const isCompletedIssueProperty = [TicketStatuses.CLOSED, TicketStatuses.VOID].includes(issuePropertyStatus);
	const isCompletedTreatmentStatus = [TreatmentStatuses.AGREED_FULLY, TreatmentStatuses.VOID].includes(treatmentStatus);

	return (isCompletedIssueProperty || isCompletedTreatmentStatus);
};
