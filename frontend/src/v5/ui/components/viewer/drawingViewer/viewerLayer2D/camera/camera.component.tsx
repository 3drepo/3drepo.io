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
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Vector3 } from 'three';
import { useModelLoading, useViewpointSubscription } from './viewer.hooks';
import { CameraIcon } from './camera.styles';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { setCameraPos } from './camera.helpers';



const haloAngleCutoff = Math.PI / 4;

export const Camera = ({ scale, offsetRef }) => {
	const viewpoint = useRef(null);
	const scaleRef = useRef(scale);
	
	const [drawingId] = useSearchParam('drawingId');
	const { containerOrFederation } = useParams<ViewerParams>();
	const [position, setPosition] = useState({ x:0, y:0 });
	const [angle, setAngle] = useState(0);
	const [haloVisibility, setHaloVisibility] = useState(1);
	const transform2DTo3D = DrawingsHooksSelectors.selectTransform2DTo3D(drawingId, containerOrFederation);
	const transform3DTo2D = DrawingsHooksSelectors.selectTransform3DTo2D(drawingId, containerOrFederation);

	const modelLoading = useModelLoading();

	useEffect(() => scaleRef.current = scale, [scale]);

	useViewpointSubscription((v) => {
		if (!transform3DTo2D) return;

		const newPosition =  transform3DTo2D(v.position);
		setPosition(newPosition);

		const v3 = new Vector3(...v.view_dir);
	
		let angleToYaxis =  (v3.angleTo(new Vector3(0, 1, 0)));
		
		if (angleToYaxis > Math.PI / 2) {
			// Math.PI % angle is to make the halo logic disregard if the user is looking up or down 
			angleToYaxis = Math.PI  % angleToYaxis;
		}
		
		const halo = angleToYaxis < haloAngleCutoff ? angleToYaxis / haloAngleCutoff : 1;
		setHaloVisibility(halo);

		const lookat = transform3DTo2D([v.position[0] + v.view_dir[0], v.position[1] + v.view_dir[1], v.position[2] + v.view_dir[2]]);
		lookat.sub(newPosition);

		setAngle(lookat.angle());
		viewpoint.current = v;
	}, [transform3DTo2D]);

	const getCursorOffset = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const offsetX = e.clientX - rect.left - offsetRef.current.x;
		const offsetY = e.clientY - rect.top - offsetRef.current.y;
		return [ offsetX / scaleRef.current, offsetY / scaleRef.current];
	};

	const onMouseMove = async (ev: MouseEvent) => {
		ev.stopPropagation();

		const point = getCursorOffset(ev);
		const newPosition = transform2DTo3D(point);

		setCameraPos(newPosition, viewpoint.current);
	};

	const onMouseUp = (ev: MouseEvent) => {
		const target = ev.currentTarget as HTMLElement;
		target.removeEventListener('mousemove', onMouseMove);
		target.removeEventListener('mouseup', onMouseUp);
		target.removeEventListener('mouseleave', onMouseUp);
	};

	const onMouseDown: React.MouseEventHandler<SVGSVGElement> = (ev) => {
		ev.stopPropagation();
		ev.nativeEvent.stopPropagation();
		ev.nativeEvent.stopImmediatePropagation();

		const container = ev.currentTarget.parentElement.parentElement.parentElement;

		container.addEventListener('mousemove', onMouseMove);
		container.addEventListener('mouseup', onMouseUp);
		container.addEventListener('mouseleave', onMouseUp);
	};

	if (!transform2DTo3D || modelLoading) {
		return null;
	}

	return (<CameraIcon onMouseDown={onMouseDown} haloVisibility={haloVisibility} style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${1 / scale}) rotate(${angle}rad)` }}/>);
};