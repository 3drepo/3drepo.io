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

import { createHooksSelectors } from '@/v5/helpers/selectorsHooks.helper';
import * as AuthSelectors from '@/v5/store/auth/auth.selectors';
import * as BimSelectors from '@/v4/modules/bim/bim.selectors';
import * as CanvasHistorySelectors from '@/v4/modules/canvasHistory/canvasHistory.selectors';
import * as ContainersSelectors from '@/v5/store/containers/containers.selectors';
import * as ContainerRevisionsSelectors from '@/v5/store/containers/revisions/containerRevisions.selectors';
import * as CurrentUserSelectors from '@/v5/store/currentUser/currentUser.selectors';
import * as DrawingsSelectors from '@/v5/store/drawings/drawings.selectors';
import * as DrawingRevisionsSelectors from '@/v5/store/drawings/revisions/drawingRevisions.selectors';
import * as DialogsSelectors from '@/v5/store/dialogs/dialogs.selectors';
import * as ProjectsSelectors from '@/v5/store/projects/projects.selectors';
import * as FederationsSelectors from '@/v5/store/federations/federations.selectors';
import * as GroupsSelectors from '@/v4/modules/groups/groups.selectors';
import * as MeasurementsSelectors from '@/v4/modules/measurements/measurements.selectors';
import * as ModelSelectors from '@/v4/modules/model/model.selectors';
import * as RouterSelectors from '@/v4/modules/router/router.selectors';
import * as SequencesSelctors from '@/v4/modules/sequences/sequences.selectors';
import * as TreeSelectors from '@/v4/modules/tree/tree.selectors';
import * as TicketsSelectors from '@/v5/store/tickets/tickets.selectors';
import * as TicketsCardSelectors from '@/v5/store/tickets/card/ticketsCard.selectors';
import * as TicketCommentsSelectors from '@/v5/store/tickets/comments/ticketComments.selectors';
import * as TeamspacesSelectors from '@/v5/store/teamspaces/teamspaces.selectors';
import * as UsersSelectors from '@/v5/store/users/users.selectors';
import * as ViewerSelectors from '@/v5/store/viewer/viewer.selectors';
import * as ViewerGuiSelectors from '@/v4/modules/viewerGui/viewerGui.selectors';


export const AuthHooksSelectors = createHooksSelectors(AuthSelectors);
export const BimHooksSelectors = createHooksSelectors(BimSelectors);
export const ContainersHooksSelectors = createHooksSelectors(ContainersSelectors);
export const CanvasHistoryHooksSelectors = createHooksSelectors(CanvasHistorySelectors);
export const CurrentUserHooksSelectors = createHooksSelectors(CurrentUserSelectors);
export const DrawingsHooksSelectors = createHooksSelectors(DrawingsSelectors);
export const DrawingRevisionsHooksSelectors = createHooksSelectors(DrawingRevisionsSelectors);
export const DialogsHooksSelectors = createHooksSelectors(DialogsSelectors);
export const FederationsHooksSelectors = createHooksSelectors(FederationsSelectors);
export const GroupsHooksSelectors = createHooksSelectors(GroupsSelectors);
export const MeasurementsHooksSelectors = createHooksSelectors(MeasurementsSelectors);
export const ModelHooksSelectors = createHooksSelectors(ModelSelectors);
export const ProjectsHooksSelectors = createHooksSelectors(ProjectsSelectors);
export const RouterHooksSelectors = createHooksSelectors(RouterSelectors);
export const ContainerRevisionsHooksSelectors = createHooksSelectors(ContainerRevisionsSelectors);
export const SequencesHooksSelectors = createHooksSelectors(SequencesSelctors);
export const TicketsHooksSelectors = createHooksSelectors(TicketsSelectors);
export const TicketsCardHooksSelectors = createHooksSelectors(TicketsCardSelectors);
export const TicketCommentsHooksSelectors = createHooksSelectors(TicketCommentsSelectors);
export const TeamspacesHooksSelectors = createHooksSelectors(TeamspacesSelectors);
export const TreeHooksSelectors = createHooksSelectors(TreeSelectors);
export const UsersHooksSelectors = createHooksSelectors(UsersSelectors);
export const ViewerHooksSelectors = createHooksSelectors(ViewerSelectors);
export const ViewerGuiHooksSelectors = createHooksSelectors(ViewerGuiSelectors);
