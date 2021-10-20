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
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { AllReturnTypes, ExtendedAction } from '@/v5/store/store.types';

export interface IFederation {
	_id: string;
	name: string;
	role: string;
	isFavourite: boolean;
	code: string;
	status: UploadStatuses;
	subModels: string[];
	issues: number;
	risks: number;
	category: string;
	lastUpdated: Date;
}

export interface IFederationsState {
	federations: Record<string, IFederation[]>;
	allFilterQuery: string;
	favouritesFilterQuery: string;
	isListPending: boolean;
	areStatsPending: boolean;
}

export interface IFederationsActionCreators {
	setAllFilterQuery: (query: string) => ExtendedAction<{query: string }, 'setFilterQuery'>;
	setFavouritesFilterQuery: (query: string) => ExtendedAction<{query: string }, 'setFilterQuery'>;
}

export type IFederationsActions = AllReturnTypes<IFederationsActionCreators>;
