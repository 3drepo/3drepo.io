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
import CameraIcon from '@assets/icons/viewer/camera.svg';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';

export const Camera = ({ scale }) => {
	// console.log(1 / scale);


	// const [animationFrame, setAnimationFrame] = useState<number>(0);

	const animationFrame = useRef(0);

	
	const [drawingId] = useSearchParam('drawingId');
	const { containerOrFederation } = useParams();
	const [position, setPosition] = useState({ x:0, y:0 });
	const [angle, setAngle] = useState(0);
	const transform2DTo3D = DrawingsHooksSelectors.selectTransform2Dto3D(drawingId, containerOrFederation);
	const transform3DTo2D = DrawingsHooksSelectors.selectTransform3Dto2D(drawingId, containerOrFederation);


	const onEnterFrame = async () => {
		const v = await ViewerService.getCurrentViewpointInfo();

		// console.log(JSON.stringify({ v }, null, '\t'));
		
		const p =  transform3DTo2D(v.position);
		setPosition(p);

		const lookat = transform3DTo2D(v.look_at);
		lookat.sub(p);
		setAngle(lookat.angle());
	
		// transformAndTranslate([xmax, ymax], tMatrix, vector3DPlane[0]);
		animationFrame.current = requestAnimationFrame(onEnterFrame);
	};


	useEffect(() => {
		if (!transform2DTo3D) return;

		animationFrame.current = requestAnimationFrame(onEnterFrame);

		//;

		return () => {
			cancelAnimationFrame(animationFrame.current);
			console.log('[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]');
			console.log('unlistening camera' + animationFrame);
			console.log('[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]');
		};
	}, transform2DTo3D);


	// console.log(animationFrame);

	if (!transform2DTo3D) {
		return null;
	}


	return (<CameraIcon style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${1 / scale}) rotate(${angle}rad)`, overflow:'unset', transformOrigin: '0 0' }}/>);
};