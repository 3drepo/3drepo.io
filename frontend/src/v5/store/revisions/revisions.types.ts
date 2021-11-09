/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { Action } from 'redux';

export interface IRevision {
	_id: string;
	timestamp: Date;
	tag: string;
	author: string;
	desc: string;
	void?: boolean;
}

export interface IRevisionsState {
	revisions: Record<string, IRevision[]>;
	isPending: Record<string, boolean>;
}

export type FetchRevisionsPayload = {
	teamspace: string;
	projectId: string;
	containerId: string;
};

export type RevisionVoidStatusPayload = {
	teamspace?: string;
	projectId: string;
	containerId: string;
	revisionId: string;
	isVoid: boolean;
};

export type SetRevisionVoidStatusAction = Action<'SET_REVISION_VOID_STATUS'> & RevisionVoidStatusPayload;
export type SetRevisionVoidStatusSuccessAction = Action<'SET_REVISION_VOID_STATUS_SUCCESS'> & { projectId: string, containerId: string; revisionId: string, isVoid: boolean };
export type FetchAction = Action<'FETCH'> & FetchRevisionsPayload;
export type FetchSuccessAction = Action<'FETCH_SUCCESS'> & { containerId: string, revisions: IRevision[] };
export type SetIsPendingAction = Action<'SET_IS_PENDING'> & { containerId: string, isPending: boolean };

export interface IRevisionsActionCreators {
	setVoidStatus: (teamspace: string, projectId: string, containerId: string, revisionId: string, isVoid: boolean) =>
	SetRevisionVoidStatusAction;
	setVoidStatusSuccess: (containerId: string, revisionId: string, isVoid: boolean) =>
	SetRevisionVoidStatusSuccessAction;
	fetch: (teamspace: string, projectId: string, containerId: string) => FetchAction;
	fetchSuccess: (containerId: string, revisions: IRevision[]) => FetchSuccessAction;
	setIsPending: (containerId: string, isPending: boolean) => SetIsPendingAction;
}
