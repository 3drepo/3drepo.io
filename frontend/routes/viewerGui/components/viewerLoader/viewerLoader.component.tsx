/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import React, { useEffect, useState, useMemo } from 'react';

import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { Container } from './viewerLoader.styles';

interface IProps {
	viewer: any;
	className?: string;
}

export const ViewerLoader = (props: IProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const [message, setMessage] = useState('');
	const [progress, setProgress] = useState(0);

	const messageLabel = useMemo(() => `${message} (${progress}%)`, [message, progress]);

	const handleUnmount = () => {
		props.viewer.off(VIEWER_EVENTS.VIEWER_INIT);
		props.viewer.off(VIEWER_EVENTS.VIEWER_INIT_PROGRESS);
		props.viewer.off(VIEWER_EVENTS.VIEWER_INIT_SUCCESS);
		props.viewer.off(VIEWER_EVENTS.MODEL_LOADED);
	};

	const setProgressState = (updatedMessageLabel) => (updatedProgress = 0) => {
		console.log('progress', updatedMessageLabel, updatedProgress);
		const isVisibleUpdated = progress !== 1;
		const percentageProgress = Number((updatedProgress * 100).toFixed(0));
		setMessage(updatedMessageLabel);
		setProgress(percentageProgress);
		setIsVisible(isVisibleUpdated);
	};

	useEffect(() => {
		if (!isVisible) {
			setTimeout(() => {
				setMessage('');
				setProgress(0);
			}, 250);
		}
	}, [isVisible]);

	useEffect(() => {
		props.viewer.on(VIEWER_EVENTS.VIEWER_INIT, setProgressState('Loading viewer'));
		props.viewer.on(VIEWER_EVENTS.VIEWER_INIT_PROGRESS, setProgressState('Loading viewer'));
		props.viewer.on(VIEWER_EVENTS.MODEL_LOADING_START, setProgressState('Loading model'));
		props.viewer.on(VIEWER_EVENTS.MODEL_LOADING_PROGRESS, setProgressState('Loading model'));
		props.viewer.on(VIEWER_EVENTS.MODEL_LOADING_CANCEL, setProgressState('Loading model'));
		props.viewer.on(VIEWER_EVENTS.MODEL_LOADED, setProgressState(''));

		return handleUnmount;
	}, []);

	return (
		<Container shouldHide={!isVisible}>{messageLabel}</Container>
	);
};
