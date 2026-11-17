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

import { getPropertyLabel } from '@/v5/ui/routes/dashboard/projects/tickets/tabularView/ticketsTable.helper';
import { getPathsOfChanges } from '../../ticketHistory.helpers';
import { ChangePropertyName, ChangeRow, ChangesContainer, DetailContainer } from './changesTable.styles';
import { ChangeDetail } from './changeDetail.component';
import { get } from 'lodash';
import type { ITemplate, TicketChange } from '@/v5/store/tickets/tickets.types';

type IChangesTable = {
	changes: Record<string, TicketChange>;
	template: ITemplate;
};

export const ChangesTable = ({ changes, template }: IChangesTable) => {
	const paths = getPathsOfChanges(changes);
	return (
		<ChangesContainer>
			{paths.map((propertyName) => (
				<ChangeRow key={propertyName}>
					<ChangePropertyName>{getPropertyLabel(propertyName)}</ChangePropertyName>
					<DetailContainer>
						<ChangeDetail template={template} propertyName={propertyName} change={get(changes, propertyName)} />
					</DetailContainer>
				</ChangeRow>
			))}
		</ChangesContainer>
	);
};
