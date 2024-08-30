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
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { useEffect, useState } from 'react';


export const useModelLoading = () => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		ViewerService.isModelReady().then(() => setLoading(false));
	}, []);

	return loading;
};


let viewpoint:any = undefined;
const onViewpointChangeCallbacks:((viewpoint:any) => void)[] = [];
let animationFrameID = 0;

const onEnterFrame = async () => {
	viewpoint = await ViewerService.getCurrentViewpointInfo();
	animationFrameID = requestAnimationFrame(onEnterFrame);

	onViewpointChangeCallbacks.forEach((callback)=> callback(viewpoint));
};

const subscribeToViewpointChange = (callback) => {
	onViewpointChangeCallbacks.push(callback);

	if (onViewpointChangeCallbacks.length === 1) {
		animationFrameID = requestAnimationFrame(onEnterFrame);
	}

	if (viewpoint) callback(viewpoint);

	return () => {
		const callbackIndex = onViewpointChangeCallbacks.indexOf(callback);

		if (callbackIndex >= 0 ) {
			onViewpointChangeCallbacks.splice(callbackIndex, 1);
		}

		if (!onViewpointChangeCallbacks.length) {
			cancelAnimationFrame(animationFrameID);
		}
	};
};

export const useViewpointSubscription = (onViewpointChange, deps) => {
	useEffect(() => subscribeToViewpointChange(onViewpointChange), deps);
};
