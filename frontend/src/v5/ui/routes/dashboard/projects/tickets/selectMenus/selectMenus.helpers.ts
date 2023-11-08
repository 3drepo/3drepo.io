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

import { formatMessage } from '@/v5/services/intl';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';

export const openUnsavedNewTicketWarningModal = () => {
	DialogsActionsDispatchers.open('warning', {
		title: formatMessage({
			id: 'ticketTable.warning.ticketNotSaved.title',
			defaultMessage: 'New ticket is not saved',
		}),
		message: formatMessage({
			id: 'ticketTable.warning.ticketNotSaved.message',
			defaultMessage: 'Changing the value of this input will close the side panel and the ticket will not be saved.',
		}),
	});
};
