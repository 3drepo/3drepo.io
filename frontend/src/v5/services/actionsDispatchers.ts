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

import { createActionsDispatchers } from '@/v5/helpers/actionsDistpatchers.helper';
import { AuthActions, IAuthActionCreators } from '@/v5/store/auth/auth.redux';
import { ContainersActions, IContainersActionCreators } from '@/v5/store/containers/containers.redux';
import { CurrentUserActions, ICurrentUserActionCreators } from '@/v5/store/currentUser/currentUser.redux';
import { DialogsActions, IDialogsActionCreators } from '@/v5/store/dialogs/dialogs.redux';
import { FederationsActions, IFederationsActionCreators } from '@/v5/store/federations/federations.redux';
import { GroupsActions } from '@/v4/modules/groups';
import { IProjectsActions, ProjectsActions } from '@/v5/store/projects/projects.redux';
import { IRevisionsActionCreators, RevisionsActions } from '@/v5/store/revisions/revisions.redux';
import { TicketsActions, ITicketsActionCreators } from '@/v5/store/tickets/tickets.redux';
import { TicketsCardActions, ITicketsCardActionCreators } from '@/v5/store/tickets/card/ticketsCard.redux';
import { ITeamspacesActionCreators, TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { IUsersActions, UsersActions } from '@/v5/store/users/users.redux';
import { Action } from 'redux';

interface IGroupsActionCreators {
	setColorOverrides: (groupIds: string[], on: boolean) => Action;
	isolateGroups: (groupIds: string[]) => Action;
	setActiveGroup: (group: any) => Action;
	showDetails: (group: any) => Action;
}

export const AuthActionsDispatchers = createActionsDispatchers<IAuthActionCreators>(AuthActions);
export const ContainersActionsDispatchers = createActionsDispatchers<IContainersActionCreators>(ContainersActions);
export const CurrentUserActionsDispatchers = createActionsDispatchers<ICurrentUserActionCreators>(CurrentUserActions);
export const DialogsActionsDispatchers = createActionsDispatchers<IDialogsActionCreators>(DialogsActions);
export const FederationsActionsDispatchers = createActionsDispatchers<IFederationsActionCreators>(FederationsActions);
export const GroupsActionsDispatchers = createActionsDispatchers<IGroupsActionCreators>(GroupsActions);
export const ProjectsActionsDispatchers = createActionsDispatchers<IProjectsActions>(ProjectsActions);
export const RevisionsActionsDispatchers = createActionsDispatchers<IRevisionsActionCreators>(RevisionsActions);
export const TeamspacesActionsDispatchers = createActionsDispatchers<ITeamspacesActionCreators>(TeamspacesActions);
export const TicketsActionsDispatchers = createActionsDispatchers<ITicketsActionCreators>(TicketsActions);
export const TicketsCardActionsDispatchers = createActionsDispatchers<ITicketsCardActionCreators>(TicketsCardActions);
export const UsersActionsDispatchers = createActionsDispatchers<IUsersActions>(UsersActions);
