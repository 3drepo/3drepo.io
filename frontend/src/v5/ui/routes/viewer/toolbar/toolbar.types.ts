/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { VIEWER_CLIP_MODES, VIEWER_MEASURING_MODE, VIEWER_NAV_MODES, VIEWER_PROJECTION_MODES } from '@/v4/constants/viewer';

type ValuesOf<T> = T[keyof T];

export type ProjectionMode = ValuesOf<typeof VIEWER_PROJECTION_MODES>;
export type NavigationMode = ValuesOf<typeof VIEWER_NAV_MODES>;
export type ClipMode = ValuesOf<typeof VIEWER_CLIP_MODES>;
export type MeasureMode = ValuesOf<typeof VIEWER_MEASURING_MODE>;
