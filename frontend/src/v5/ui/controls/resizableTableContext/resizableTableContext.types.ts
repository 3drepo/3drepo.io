/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { ValuesOf } from '@/v5/helpers/types.helpers';

export enum ResizableEvent {
	WIDTH_CHANGE = 'WIDTH_CHANGE',
	VISIBLE_COLUMNS_CHANGE = 'VISIBLE_COLUMNS_CHANGE',
	MOVING_COLUMN_CHANGE = 'MOVING_COLUMN_CHANGE',
	MOVING_COLUMN_DROP_INDEX_CHANGE = 'MOVING_COLUMN_DROP_INDEX_CHANGE',
}

export type ResizableEventType = ValuesOf<typeof ResizableEvent>;
export type TableColumn = { name: string; minWidth?: number; width: number; };
export type UnsubscribeFn = () => void;
