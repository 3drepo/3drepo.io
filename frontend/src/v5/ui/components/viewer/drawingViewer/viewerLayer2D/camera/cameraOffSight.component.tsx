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

import { clamp } from 'lodash';
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Vector2 } from 'three';
import { useModelLoading, useViewpointSubscription } from './viewer.hooks';
import { CameraOffSightIcon } from './camera.styles';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';

interface Props {
	onCameraSightChanged: (cameraOnSight: boolean) => void;
	scale: any;
	viewport: any;
}


const cameraPadding = 3;
const iconSize = 56;

export const CameraOffSight = ({ onCameraSightChanged, viewport, scale }: Props) => {
	const viewpoint = useRef(null);
	const viewportRef = useRef(viewport);
	const camInSight = useRef(false);
	const scaleRef = useRef(scale);

	const [drawingId] = useSearchParam('drawingId');
	const { containerOrFederation } = useParams<ViewerParams>();
	const [position, setPosition] = useState({ x:0, y:0 });
	const [angle, setAngle] = useState(0);
	const transform2DTo3D = DrawingsHooksSelectors.selectTransform2Dto3D(drawingId, containerOrFederation);
	const transform3DTo2D = DrawingsHooksSelectors.selectTransform3Dto2D(drawingId, containerOrFederation);
	const modelLoading = useModelLoading();

	useEffect(() => viewportRef.current = viewport, [viewport]);
	useEffect(() => scaleRef.current = scale, [scale]);

	useViewpointSubscription((v) => {
		if (!transform2DTo3D) return;
		const p = transform3DTo2D(v.position);
		const vp = viewportRef.current;


		const padding = (cameraPadding / scaleRef.current);

		const x = clamp(p.x, vp.left + padding, vp.right - padding);
		const y = clamp(p.y, vp.top + padding,  vp.bottom - padding); 

		const cameraInSight = p.x === x && p.y === y;

		if (camInSight.current !== cameraInSight) {
			onCameraSightChanged(cameraInSight);
			camInSight.current = cameraInSight;
			setPosition({ x:0, y:0 });
		}


		if (cameraInSight) 
			return;

		const vpWidth = (vp.right - vp.left) * scaleRef.current;
		const vpHeight = (vp.bottom - vp.top) * scaleRef.current;

		setPosition({
			x: clamp((x - vp.left) * scaleRef.current - iconSize / 2, 0, vpWidth - iconSize),
			y: clamp((y - vp.top) * scaleRef.current - iconSize / 2, 0, vpHeight - iconSize),
		});

		const ang = p.sub(new Vector2(x, y)).angle();
		setAngle(ang);
		viewpoint.current = v;
	}, [transform3DTo2D]); 


	if (!transform3DTo2D || camInSight.current || modelLoading) {
		return null;
	}

	return (<CameraOffSightIcon  style={{ transform: `translate(${position.x}px, ${position.y}px) `, transformOrigin: '0 0' }} arrowAngle={angle}/>);
};