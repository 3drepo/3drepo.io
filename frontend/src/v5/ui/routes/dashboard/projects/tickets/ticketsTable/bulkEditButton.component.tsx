/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { Button } from '@controls/button';
import { useContext } from 'react';
import { TicketsTableContext } from './ticketsTableContext/ticketsTableContext';

// This is a temporary component
// It is just used to check the ticket IDs are correctly selected
export const BulkEditButton = () => {
	const { selectedIds, onBulkEdit } = useContext(TicketsTableContext);
	return (
		<Button variant="contained" onClick={onBulkEdit} disabled={selectedIds.length === 0}>
			Bulk Edit
		</Button>
	);
};