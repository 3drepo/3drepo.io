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

import { RISK_LEVELS_MAP, STATUS_MAP, TREATMENT_LEVELS_MAP } from '@controls/chip/chip.types';
import { FlexRow } from '../ticketItem.styles';
import { Chip } from '@controls/chip/chip.component';
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { ITicket } from '@/v5/store/tickets/tickets.types';

export const TicketItemChips = ({ properties, modules: { safetibase = {} } }: ITicket) => {
	const { status } = getPropertiesInCamelCase(properties);
	const { treatmentStatus = null, levelOfRisk = null } = getPropertiesInCamelCase(safetibase);
	return (
		<FlexRow>
			<Chip {...STATUS_MAP[status]} variant="outlined" />
			{levelOfRisk && <Chip {...RISK_LEVELS_MAP[levelOfRisk]} variant="filled" />}
			{treatmentStatus && <Chip {...TREATMENT_LEVELS_MAP[treatmentStatus]} variant="filled" />}
		</FlexRow>
	);
};