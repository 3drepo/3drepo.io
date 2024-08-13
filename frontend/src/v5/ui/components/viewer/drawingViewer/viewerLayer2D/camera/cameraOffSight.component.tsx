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
import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import CameraOffSightIcon from '@assets/icons/viewer/camera_off_sight.svg';
import { clamp } from 'lodash';
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';

interface Props {
	onCameraSightChanged: (cameraOnSight: boolean) => void;
	scale: any;
	viewport: any;
}


const cameraPadding = 5;
const iconSize = 30;

export const CameraOffSight = ({ onCameraSightChanged, viewport, scale }: Props) => {
	const animationFrame = useRef(0);
	const viewpoint = useRef(null);
	const viewportRef = useRef(viewport);
	const camInSight = useRef(false);
	const scaleRef = useRef(scale);

	// const cameraRef = useRef<HTMLElement>();
	
	const [drawingId] = useSearchParam('drawingId');
	const { containerOrFederation } = useParams();
	const [position, setPosition] = useState({ x:0, y:0 });
	const [angle, setAngle] = useState(0);
	const transform2DTo3D = DrawingsHooksSelectors.selectTransform2Dto3D(drawingId, containerOrFederation);
	const transform3DTo2D = DrawingsHooksSelectors.selectTransform3Dto2D(drawingId, containerOrFederation);


	useEffect(() => {
		scaleRef.current = scale;
	}, [scale]);


	const onEnterFrame = async () => {
		animationFrame.current = requestAnimationFrame(onEnterFrame);

		// console.log({ viewBox: scaleRef.current });
		
		const v = await ViewerService.getCurrentViewpointInfo();
		const p = transform3DTo2D(v.position);
		const vp = viewportRef.current;


		const padding = (cameraPadding / scaleRef.current);
		const isize = (iconSize / scaleRef.current);

		const x = clamp(p.x, vp.left + padding, vp.right - padding - isize);
		const y = clamp(p.y, vp.top + padding,  vp.bottom - padding - isize); 

		const cameraInSight = p.x === x && p.y === y;

		if (camInSight.current !== cameraInSight) {
			onCameraSightChanged(cameraInSight);
			camInSight.current = cameraInSight;
			setPosition({ x:0, y:0 });
		}


		if (cameraInSight) 
			return;

		setPosition({
			x: (x - vp.left) * scaleRef.current,
			y: (y - vp.top) * scaleRef.current,
		});

		const lookat = transform3DTo2D([v.position[0] + v.view_dir[0], v.position[1] + v.view_dir[1], v.position[2] + v.view_dir[2]]);
		lookat.sub(p);
		setAngle(lookat.angle());
		viewpoint.current = v;
	};

	useEffect(() => viewportRef.current = viewport, [viewport]);

	useEffect(() => {
		if (!transform2DTo3D) return;

		animationFrame.current = requestAnimationFrame(onEnterFrame);
		return () => {
			cancelAnimationFrame(animationFrame.current);
		};
	}, [transform2DTo3D]);

	if (camInSight.current) {
		return null;
	}

	return (<CameraOffSightIcon  style={{ transform: `translate(${position.x}px, ${position.y}px) `, transformOrigin: '0 0' }}/>);
};