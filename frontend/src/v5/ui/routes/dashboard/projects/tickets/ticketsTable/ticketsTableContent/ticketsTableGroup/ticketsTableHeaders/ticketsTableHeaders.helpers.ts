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

import { BaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { PopoverOrigin } from '@mui/material';

export const TICKET_HEADER_POPOVER_PROPS = {
	anchorOrigin: {
		vertical: 'bottom',
		horizontal: 'left',
	} as PopoverOrigin,
	transformOrigin: {
		vertical: 'top',
		horizontal: 'left',
	} as PopoverOrigin,
};

export const NON_BULK_EDITABLE_COLUMNS = [
	'id',
	`properties.${BaseProperties.OWNER}`,
	'modelName',
	`properties.${BaseProperties.CREATED_AT}`,
	`properties.${BaseProperties.UPDATED_AT}`,
	BaseProperties.TITLE,
];
