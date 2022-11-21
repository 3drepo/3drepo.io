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
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';

type ICamera = {
	type: 'perspective' | 'orthographic';
	position: number[];
	forward: number[];
	up: number[];
	size?: number;
};

type IViewpoint = {
	screenshot?: any;
	camera: ICamera;
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
	const { teamspace, containerOrFederation } = useParams<DashboardParams>();
	const convertCameraToUnity = (
		{ position, up, forward: view_dir, type, size: orthographicSize }: ICamera,
	) => ({ position, up, view_dir, type, orthographicSize });

	const convertCameraFromUnity = (
		{ position, up, view_dir: forward, type, orthographicSize: size },
	): ICamera => ({ position, up, forward, type, size });

	const createViewpoint = async () => {
		const currentViewpoint = await ViewerService.getCurrentViewpoint({ teamspace, model: containerOrFederation });
		const camera: ICamera = convertCameraFromUnity(currentViewpoint);
		const generatedObject: IViewpoint = {
			camera,
		};
		onChange?.(generatedObject);
	};
	const goToViewpoint = async () => {
		if (!value.camera) return;
		await ViewerService.setCamera(convertCameraToUnity(value.camera));
	};
	const deleteViewpoint = async () => {
		console.log('Delete Viewpoint');
	};

	useEffect(() => onBlur?.(), [value]);

	/* eslint-disable react/button-has-type */
	return (
		<>
			{label}
			<button onClick={createViewpoint}> Create viewpoint </button>
			<button onClick={goToViewpoint}> Go to viewpoint </button>
			<button onClick={deleteViewpoint}> Delete viewpoint </button>
			{error && helperText}
		</>
	);
};
