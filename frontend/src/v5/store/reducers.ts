/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { federationsReducer } from '@/v5/store/federations/federations.redux';
import { containersReducer } from '@/v5/store/containers/containers.redux';
import { drawingsReducer } from '@/v5/store/drawings/drawings.redux';
import { drawingsCardReducer } from './drawings/card/drawingsCard.redux';
import { drawingRevisionsReducer } from '@/v5/store/drawings/revisions/drawingRevisions.redux';
import { dialogsReducer } from '@/v5/store/dialogs/dialogs.redux';
import { projectsReducer } from '@/v5/store/projects/projects.redux';
import { teamspacesReducer } from '@/v5/store/teamspaces/teamspaces.redux';
import { usersReducer } from '@/v5/store/users/users.redux';
import { currentUserReducer } from '@/v5/store/currentUser/currentUser.redux';
import { authReducer } from '@/v5/store/auth/auth.redux';
import { ticketsReducer } from '@/v5/store/tickets/tickets.redux';
import { containerRevisionsReducer } from '@/v5/store/containers/revisions/containerRevisions.redux';
import { ticketsCardReducer } from '@/v5/store/tickets/card/ticketsCard.redux';
import { ticketCommentsReducer } from '@/v5/store/tickets/comments/ticketComments.redux';
import { viewerReducer } from '@/v5/store/viewer/viewer.redux';

// <-- IMPORT MODULE REDUCER -->

export default {
	auth2: authReducer,
	containers: containersReducer,
	containerRevisions: containerRevisionsReducer,
	currentUser2: currentUserReducer,
	dialogsV5: dialogsReducer,
	drawings: drawingsReducer,
	drawingsCard: drawingsCardReducer,
	drawingRevisions: drawingRevisionsReducer,
	federations: federationsReducer,
	projects: projectsReducer,
	teamspaces2: teamspacesReducer,
	tickets: ticketsReducer,
	ticketsCard: ticketsCardReducer,
	ticketComments: ticketCommentsReducer,
	users: usersReducer,
	viewer2: viewerReducer,
};
