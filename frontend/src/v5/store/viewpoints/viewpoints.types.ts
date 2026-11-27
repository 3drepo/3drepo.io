/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { ComponentType } from 'react';

interface ClippingPlane {
	normal: number[];
	distance: number;
	clipDirection: number;
}

interface IScreenshot {
	thumbnail: string;
	thumbnailUrl?: string;
}

export interface IViewpointDetails {
	right: number[];
	up: number[];
	view_dir: number[];
	position: number[];
	look_at: number[];
	near: number;
	far: number;
	fov: number;
	aspect_ratio: number;
	type: 'perspective' | 'orthographic';
	hideIfc: boolean;
	hidden_group_id: string;
	highlighted_group_id: string;
	override_group_ids: string[];
	override_groups?: any[];
	transformation_group_ids: string[];
	transformation_groups?: any[];
	clippingPlanes?: ClippingPlane[];
}

export interface IViewpoint {
	_id: string;
	name: string;
	thumbnail?: string;
	viewpoint: IViewpointDetails;
	screenshot?: IScreenshot;
	clippingPlanes?: ClippingPlane[];
}

export interface IPresetViewpoint {
	_id: string;
	name: string;
	preset: string;
	icon: ComponentType<{ className?: any }>;
}