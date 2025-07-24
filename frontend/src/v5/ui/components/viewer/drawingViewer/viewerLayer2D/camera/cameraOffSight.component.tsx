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
import { useRef, useState, useEffect, MouseEventHandler } from 'react';
import { useParams } from 'react-router';
import { Vector2 } from 'three';
import { useModelLoading, useViewpointSubscription } from './viewer.hooks';
import { CameraOffSightContainer, CameraOffSightIcon } from './camera.styles';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { setCameraPos } from './camera.helpers';

interface Props {
	onCameraSightChanged: (cameraOnSight: boolean) => void;
	viewbox: any;
	viewport: any;
}


const cameraPadding = 3;
const iconSize = 56;

export const CameraOffSight = ({ onCameraSightChanged, viewport, viewbox }: Props) => {
	const viewpoint = useRef(null);
	const viewportRef = useRef(viewport);
	const camInSight = useRef(false);
	const scaleRef = useRef(viewbox.scale);

	const [drawingId] = useSearchParam('drawingId');
	const { containerOrFederation } = useParams<ViewerParams>();
	const [position, setPosition] = useState({ x:0, y:0 });
	const [angle, setAngle] = useState(0);
	const transform2DTo3D = DrawingsHooksSelectors.selectTransform2DTo3D(drawingId, containerOrFederation);
	const transform3DTo2D = DrawingsHooksSelectors.selectTransform3DTo2D(drawingId, containerOrFederation);
	const modelLoading = useModelLoading();

	useEffect(() => { viewportRef.current = viewport; }, [viewport]);
	useEffect(() => { scaleRef.current = viewbox.scale; }, [viewbox.scale]);

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


		if (cameraInSight) return;

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

	const [dragging, setDragging] = useState(false);

	const onMouseMove = (ev: MouseEvent) => {
		ev.stopPropagation();
		ev.stopImmediatePropagation();
		ev.preventDefault();

		const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
		const offsetX = ev.clientX - rect.left;
		const offsetY = ev.clientY - rect.top;

		const x = (-viewbox.x + offsetX) / viewbox.scale;
		const y = (-viewbox.y + offsetY) / viewbox.scale;
		// console.log(JSON.stringify({ posx: offsetX, left: rect.x }));

		const newPosition = transform2DTo3D([x, y]);

		setCameraPos(newPosition, viewpoint.current);
	};

	const onMouseUp = (ev: MouseEvent) => {
		const target = ev.currentTarget as HTMLElement;
		target.removeEventListener('mousemove', onMouseMove);
		target.removeEventListener('mouseup', onMouseUp);
		target.removeEventListener('mouseleave', onMouseUp);
		setDragging(false);
	};

	const onMouseDown:MouseEventHandler<HTMLElement> = (ev) => {
		ev.stopPropagation();
		ev.nativeEvent.stopPropagation();
		ev.nativeEvent.stopImmediatePropagation();
		setDragging(true);
		const container = ev.currentTarget.parentElement;

		container.addEventListener('mousemove', onMouseMove);
		container.addEventListener('mouseup', onMouseUp);
		container.addEventListener('mouseleave', onMouseUp);
	};



	if (!transform3DTo2D || (camInSight.current && !dragging) || modelLoading ) {
		return null;
	}

	return (
		<CameraOffSightContainer style={{ transform: `translate(${position.x}px, ${position.y}px) ` }} 
			onMouseDown={onMouseDown}>
			{!camInSight.current && <CameraOffSightIcon arrowAngle={angle}/>}
		</CameraOffSightContainer>
	);
};