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
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { transformAndTranslate } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.helpers';
import { DrawingViewerService } from '../../drawingViewer.service';

export const Camera = ({ scale }) => {
	// console.log(1 / scale);
	const [animationFrame, setAnimationFrame] = useState<number>(0);
	const [drawingId] = useSearchParam('drawingId');
	const { containerOrFederation } = useParams();
	const [position, setPosition] = useState({ x:0, y:0 });
	const transform2DTo3D = DrawingsHooksSelectors.selectTransform2Dto3D(drawingId, containerOrFederation);
	const transform3DTo2D = DrawingsHooksSelectors.selectTransform3Dto2D(drawingId, containerOrFederation);


	const onEnterFrame = async () => {
		const v = await ViewerService.getCurrentViewpointInfo();

		console.log(JSON.stringify({ v }, null, '\t'));
		
		const p =  transform3DTo2D([v.position[0], v.position[2]]);
		setPosition({ x: p[0], y: p[1] });

		// transformAndTranslate([xmax, ymax], tMatrix, vector3DPlane[0]);
		setAnimationFrame(requestAnimationFrame(onEnterFrame));
	};


	useEffect(() => {
		if (!transform2DTo3D) return;


		setAnimationFrame(requestAnimationFrame(onEnterFrame));

		//;

		return () => {
			cancelAnimationFrame(animationFrame);
			console.log('[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]');
			console.log('unlistening camera' + animationFrame);
			console.log('[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]');
		};
	}, transform2DTo3D);
	const onClick = (pos) => {
		console.log(pos);
		
		//transform3DTo2D
	};


	useEffect(() => {
		DrawingViewerService.on('click', onClick);

		return () => DrawingViewerService.off('click', onClick);
	}, []);


	if (!transform2DTo3D) {
		return null;
	}


	return (<CameraIcon style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${1 / scale})`, overflow:'unset', transformOrigin: '0 0' }}/>);
};