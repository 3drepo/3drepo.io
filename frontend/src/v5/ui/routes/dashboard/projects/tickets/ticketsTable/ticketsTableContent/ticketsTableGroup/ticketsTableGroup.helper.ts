/**
<<<<<<<< HEAD:backend/src/scripts/migrations/5.22.2/index.js
 *  Copyright (C) 2026 3D Repo Ltd
========
 *  Copyright (C) 2025 3D Repo Ltd
>>>>>>>> f7ca39a809c21e7e0b866af76c1fa06ba2e722ab:frontend/src/v5/ui/routes/dashboard/projects/tickets/ticketsTable/ticketsTableContent/ticketsTableGroup/ticketsTableGroup.helper.ts
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

<<<<<<<< HEAD:backend/src/scripts/migrations/5.22.2/index.js
const updateRepobundleMetadata = require('./updateRepobundleMetadata');

const scripts = [
	{ script: updateRepobundleMetadata, desc: 'Update the repoAssets document for repobundle revisions to include all the latest required metadata' },
];

module.exports = scripts;
========
export const TICKETS_CHUNK_SIZE = 10;

export const SELECTION_COLUMN_WIDTH = 54;
export const SETTINGS_COLUMN_WIDTH = 24;

export const NEW_TICKET_ROW_AREA_NAME = 'newTicketRow';
>>>>>>>> f7ca39a809c21e7e0b866af76c1fa06ba2e722ab:frontend/src/v5/ui/routes/dashboard/projects/tickets/ticketsTable/ticketsTableContent/ticketsTableGroup/ticketsTableGroup.helper.ts
