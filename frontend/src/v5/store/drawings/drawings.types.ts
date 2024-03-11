/**
 *  Copyright (C) 2024 3D Repo Ltd
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

// TODO: Unfinished interface
export interface Drawing {
	_id: string;
	name: string;
}

// TODO: Unfinished interface
export interface DrawingStats {
	_id: string,
	revisions: {
		revisionsCount: number,
		lastUpdated?: number,
		latestRevision?: string,
		calibration?: string,
		type?: string,
		code?: string,
		isFavourite: boolean,
	}
}
