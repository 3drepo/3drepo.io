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

import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { useEffect } from 'react';

type ICamera = {
	type: 'perspective' | 'orthographic';
	position: number[];
	forward: number[];
	up: number[];
	size?: number;
};

type ClippingPlane = {
	normal: number[];
	distance: number[];
	clipDirection: 1 | -1;
};

type IViewpoint = {
	screenshot?: any;
	camera: ICamera;
	clippingPlanes: ClippingPlane[];
};

type ITicketView = {
	value: IViewpoint;
	label: string;
	error: boolean;
	helperText: string;
	required: boolean;
	onBlur: () => void;
	onChange: (newValue) => void;
};

export const TicketView = ({
	value,
	label,
	error,
	helperText,
	required,
	onBlur,
	onChange,
}: ITicketView) => {
	const createViewpoint = async () => {
		const currentViewpoint = await ViewerService.getViewpoint();
		onChange?.(currentViewpoint);
	};
	const goToViewpoint = async () => {
		if (!value) return;
		await ViewerService.setViewpoint(value);
	};
	const deleteViewpoint = async () => {
		onChange?.(null);
	};

	useEffect(() => onBlur?.(), [value]);

	/* eslint-disable react/button-has-type */
	return (
		<>
			{label}
			<button type="button" onClick={createViewpoint}> Create viewpoint </button>
			<button type="button" onClick={goToViewpoint}> Go to viewpoint </button>
			<button type="button" onClick={deleteViewpoint}> Delete viewpoint </button>
			{error && helperText}
		</>
	);
};
