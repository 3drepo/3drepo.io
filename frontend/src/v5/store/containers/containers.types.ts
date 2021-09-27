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

import { AllReturnTypes, ExtendedAction } from '@/v5/store/store.types';

export interface IContainersState {
	containers: IContainer[];
	filterQuery: string;
}

export interface IContainer {
	_id: string;
	name: string;
	latestRevision: string;
	revisionsCount: number;
	lastUpdated: Date;
	type: string;
	code: string;
	isFavourite: boolean;
	role: string;
}

export interface FavouritePayload {
	teamspace: string;
	projectId: string;
	containerId: IContainer['_id'];
}

export interface IContainersActionCreators {
	setFilterQuery: (query: string) => ExtendedAction<{query: string}, 'setFilterQuery'>
	addFavourite: (teamspace: string, projectId: string, containerId: string) => ExtendedAction<FavouritePayload, 'addFavourite'>
	removeFavourite: (teamspace: string, projectId: string, containerId: string) => ExtendedAction<FavouritePayload, 'removeFavourite'>
}

export type IContainersActions = AllReturnTypes<IContainersActionCreators>;
