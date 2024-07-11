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

export type Coord2D = [number, number];
type Coord3D = [number, number, number];

export type Vector<CoordType> = [CoordType | null, CoordType | null];

export type Vector2D = Vector<Coord2D>;
export type Vector3D = Vector<Coord3D>;

export enum PlaneType {
	UPPER = 'upper',
	LOWER = 'lower',
}
export type PlanesValues = { [PlaneType.UPPER]: number, [PlaneType.LOWER]: number };