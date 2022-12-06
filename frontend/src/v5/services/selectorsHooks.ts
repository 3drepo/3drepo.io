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
import * as ContainersSelectors from '@/v5/store/containers/containers.selectors';
import * as CurrentUserSelectors from '@/v5/store/currentUser/currentUser.selectors';
import * as ProjectsSelectors from '@/v5/store/projects/projects.selectors';
import * as FederationsSelectors from '@/v5/store/federations/federations.selectors';
import * as GroupsSelectors from '@/v4/modules/groups/groups.selectors';
import * as RevisionsSelectors from '@/v5/store/revisions/revisions.selectors';
import * as TicketsSelectors from '@/v5/store/tickets/tickets.selectors';
import * as TicketsCardSelectors from '@/v5/store/tickets/card/ticketsCard.selectors';
import * as TeamspacesSelectors from '@/v5/store/teamspaces/teamspaces.selectors';
import * as UsersSelectors from '@/v5/store/users/users.selectors';

export const AuthHooksSelectors = createHooksSelectors(AuthSelectors);
export const ContainersHooksSelectors = createHooksSelectors(ContainersSelectors);
export const CurrentUserHooksSelectors = createHooksSelectors(CurrentUserSelectors);
export const FederationsHooksSelectors = createHooksSelectors(FederationsSelectors);
export const GroupsHooksSelectors = createHooksSelectors(GroupsSelectors);
export const ProjectsHooksSelectors = createHooksSelectors(ProjectsSelectors);
export const RevisionsHooksSelectors = createHooksSelectors(RevisionsSelectors);
export const TicketsHooksSelectors = createHooksSelectors(TicketsSelectors);
export const TicketsCardHooksSelectors = createHooksSelectors(TicketsCardSelectors);
export const TeamspacesHooksSelectors = createHooksSelectors(TeamspacesSelectors);
export const UsersHooksSelectors = createHooksSelectors(UsersSelectors);
