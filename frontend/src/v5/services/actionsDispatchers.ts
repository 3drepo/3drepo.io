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
/* eslint-disable max-len */
import { createActionsDispatchers } from '@/v5/helpers/actionsDistpatchers.helper';
import { AuthActions, IAuthActionCreators } from '@/v5/store/auth/auth.redux';
import { BimActions } from '@/v4/modules/bim';
import { ContainersActions, IContainersActionCreators } from '@/v5/store/containers/containers.redux';
import { CurrentUserActions, ICurrentUserActionCreators } from '@/v5/store/currentUser/currentUser.redux';
import { DialogsActions, IDialogsActionCreators } from '@/v5/store/dialogs/dialogs.redux';
import { IDrawingsActionCreators, DrawingsActions } from '@/v5/store/drawings/drawings.redux';
import { FederationsActions, IFederationsActionCreators } from '@/v5/store/federations/federations.redux';
import { GroupsActions } from '@/v4/modules/groups';
import { JobsActions } from '@/v4/modules/jobs';
import { MeasurementsActions } from '@/v4/modules/measurements';
import { IProjectsActionCreators, ProjectsActions } from '@/v5/store/projects/projects.redux';
import { IContainerRevisionsActionCreators, ContainerRevisionsActions } from '@/v5/store/containers/revisions/containerRevisions.redux';
import { ITeamspacesActionCreators, TeamspacesActions } from '@/v5/store/teamspaces/teamspaces.redux';
import { SequencesActions } from '@/v4/modules/sequences';
import { TicketsActions, ITicketsActionCreators } from '@/v5/store/tickets/tickets.redux';
import { TicketsCardActions, ITicketsCardActionCreators } from '@/v5/store/tickets/card/ticketsCard.redux';
import { TicketCommentsActions, ITicketCommentsActionCreators } from '@/v5/store/tickets/comments/ticketComments.redux';
import { TreeActions } from '@/v4/modules/tree';
import { IUsersActions, UsersActions } from '@/v5/store/users/users.redux';
import { ViewerActions, ViewerActionsCreators } from '@/v5/store/viewer/viewer.redux';
import { ViewerGuiActions } from '@/v4/modules/viewerGui';
import { Action } from 'redux';
import { CanvasHistoryActions } from '@/v4/modules/canvasHistory';

import { ClipMode, GizmoMode, MeasureMode, NavigationMode, ProjectionMode } from '../ui/routes/viewer/toolbar/toolbar.types';
import { DrawingRevisionsActions, IDrawingRevisionsActionCreators } from '../store/drawings/revisions/drawingRevisions.redux';
import { CompareActions } from '@/v4/modules/compare';
import { ViewpointsActions } from '@/v4/modules/viewpoints';

interface IBimActionCreators {
	setIsActive: (active: boolean) => Action;
}

interface ICanvasHistoryActionCreators {
	update: (elementName: string, properties: Record<string, number>) => Action;
	undo: () => Action;
	redo: () => Action;
}


interface ICompareActionCreators {
	resetComponentState: () => Action;
}

interface ITreeActionCreators {
	showAllNodes: () => Action;
	hideSelectedNodes: () => Action;
	isolateSelectedNodes: (containerOrFederation: string) => Action;
	stopListenOnSelections: () => Action;
	startListenOnSelections: () => Action;
}
interface IGroupsActionCreators {
	setColorOverrides: (groupIds: string[], on: boolean) => Action;
	isolateGroups: (groupIds: string[]) => Action;
	setActiveGroup: (group: any) => Action;
	showDetails: (group: any) => Action;
	clearSelectionHighlights: (shouldClearTree?: boolean) => Action;
}

interface ISequencesActionCreators {
	showSequenceDate: (date: Date | null) => Action;
	setSelectedDate: (date: Date | null) => Action;
	prefetchFrames: () => Action,
}

interface IJobsActionCreators {
	fetchJobs: (teamspace: string) => Action;
}

interface IMeasurementsActionCreators {
	setMeasureMode: (mode: MeasureMode | '') => Action;
}

interface IViewerGuiActionCreators {
	goToHomeView: () => Action;
	setIsFocusMode: (mode: boolean) => Action;
	setProjectionMode: (mode: ProjectionMode) => Action;
	setNavigationMode: (mode: NavigationMode) => Action;
	getHelicopterSpeed: (teamspace: string, containerOrFederation: string) => Action;
	increaseHelicopterSpeed: (teamspace: string, containerOrFederation: string) => Action;
	decreaseHelicopterSpeed: (teamspace: string, containerOrFederation: string) => Action;
	resetHelicopterSpeed: (teamspace: string, containerOrFederation: string) => Action;
	setClippingMode: (mode: ClipMode) => Action;
	setGizmoMode: (mode: GizmoMode) => Action;
	setCoordView: (visible: boolean) => Action;
	setPanelVisibility: (panelName: string, visible?: boolean) => Action;
	setClipEdit: (isClipEdit: boolean) => Action;
	clearColorOverrides: () => Action;
	clearTransformations: () => Action;
	resetPanels: () => Action;
}

interface IViewpointsActionCreators {
	showViewpoint: (teamspace: string, modelId: string, view: any, ignoreCamera?: boolean) => Action,
	clearColorOverrides: () => Action,
	clearTransformations: () => Action,
}

export const AuthActionsDispatchers = createActionsDispatchers<IAuthActionCreators>(AuthActions);
export const BimActionsDispatchers = createActionsDispatchers<IBimActionCreators>(BimActions);
export const CanvasHistoryActionsDispatchers = createActionsDispatchers<ICanvasHistoryActionCreators>(CanvasHistoryActions);
export const CompareActionsDispatchers = createActionsDispatchers<ICompareActionCreators>(CompareActions);
export const ContainersActionsDispatchers = createActionsDispatchers<IContainersActionCreators>(ContainersActions);
export const ContainerRevisionsActionsDispatchers = createActionsDispatchers<IContainerRevisionsActionCreators>(ContainerRevisionsActions);
export const CurrentUserActionsDispatchers = createActionsDispatchers<ICurrentUserActionCreators>(CurrentUserActions);
export const DialogsActionsDispatchers = createActionsDispatchers<IDialogsActionCreators>(DialogsActions);
export const DrawingsActionsDispatchers =  createActionsDispatchers<IDrawingsActionCreators>(DrawingsActions);
export const DrawingRevisionsActionsDispatchers =  createActionsDispatchers<IDrawingRevisionsActionCreators>(DrawingRevisionsActions);
export const FederationsActionsDispatchers = createActionsDispatchers<IFederationsActionCreators>(FederationsActions);
export const GroupsActionsDispatchers = createActionsDispatchers<IGroupsActionCreators>(GroupsActions);
export const JobsActionsDispatchers = createActionsDispatchers<IJobsActionCreators>(JobsActions);
export const MeasurementsActionsDispatchers = createActionsDispatchers<IMeasurementsActionCreators>(MeasurementsActions);
export const ProjectsActionsDispatchers = createActionsDispatchers<IProjectsActionCreators>(ProjectsActions);
export const SequencesActionsDispatchers = createActionsDispatchers<ISequencesActionCreators>(SequencesActions);
export const TeamspacesActionsDispatchers = createActionsDispatchers<ITeamspacesActionCreators>(TeamspacesActions);
export const TicketsActionsDispatchers = createActionsDispatchers<ITicketsActionCreators>(TicketsActions);
export const TicketsCardActionsDispatchers = createActionsDispatchers<ITicketsCardActionCreators>(TicketsCardActions);
export const TicketCommentsActionsDispatchers = createActionsDispatchers<ITicketCommentsActionCreators>(TicketCommentsActions);
export const TreeActionsDispatchers = createActionsDispatchers<ITreeActionCreators>(TreeActions);
export const UsersActionsDispatchers = createActionsDispatchers<IUsersActions>(UsersActions);
export const ViewerActionsDispatchers = createActionsDispatchers<ViewerActionsCreators>(ViewerActions);
export const ViewerGuiActionsDispatchers = createActionsDispatchers<IViewerGuiActionCreators>(ViewerGuiActions);
export const ViewpointsActionsDispatchers = createActionsDispatchers<IViewpointsActionCreators>(ViewpointsActions);
