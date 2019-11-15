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

import React, { useEffect, useMemo, useState } from 'react';

import { VIEWER_EVENTS } from '../../../../constants/viewer';
import { Container } from './viewerLoader.styles';

const LOADING_VIEWER_TEXT = 'Loading viewer';
const LOADING_MODEL_TEXT = 'Loading model';
const LOADING_TREE_TEXT = 'Loading tree ...';

interface IProps {
	viewer: any;
	className?: string;
	isTreeProcessed: boolean;
}

export const ViewerLoader = (props: IProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const [message, setMessage] = useState('');
	const [progress, setProgress] = useState(0);

	const messageLabel = useMemo(() => {
		const isVisibleUpdated = progress !== 100;
		if (progress === 0 && message === '') {
			setIsVisible(!props.isTreeProcessed);
		} else {
			setIsVisible(isVisibleUpdated);
		}
		if (message === '' && progress === 0 && !props.isTreeProcessed) {
			return LOADING_TREE_TEXT;
		}
		return `${message} (${progress}%)`;
	}, [message, progress, props.isTreeProcessed]);

	const handleUnmount = () => {
		props.viewer.off(VIEWER_EVENTS.VIEWER_INIT);
		props.viewer.off(VIEWER_EVENTS.VIEWER_INIT_PROGRESS);
		props.viewer.off(VIEWER_EVENTS.VIEWER_INIT_SUCCESS);
		props.viewer.off(VIEWER_EVENTS.MODEL_LOADED);
	};

	const setProgressState = (updatedMessageLabel) => (updatedProgress) => {
		if (updatedProgress !== undefined) {
			const percentageProgress = Number((updatedProgress * 100).toFixed(0));

			setMessage(updatedMessageLabel);
			setProgress(percentageProgress);
		}
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
		props.viewer.on(VIEWER_EVENTS.VIEWER_INIT, setProgressState(LOADING_VIEWER_TEXT));
		props.viewer.on(VIEWER_EVENTS.VIEWER_INIT_PROGRESS, setProgressState(LOADING_VIEWER_TEXT));
		props.viewer.on(VIEWER_EVENTS.VIEWER_INIT_SUCCESS, setProgressState(LOADING_VIEWER_TEXT));
		props.viewer.on(VIEWER_EVENTS.MODEL_LOADING_START, setProgressState(LOADING_MODEL_TEXT));
		props.viewer.on(VIEWER_EVENTS.MODEL_LOADING_PROGRESS, setProgressState(LOADING_MODEL_TEXT));
		props.viewer.on(VIEWER_EVENTS.MODEL_LOADING_CANCEL, setProgressState(LOADING_MODEL_TEXT));
		props.viewer.on(VIEWER_EVENTS.MODEL_LOADED, setProgressState(''));

		return handleUnmount;
	}, []);

	return (
		<Container shouldHide={!isVisible}>{messageLabel}</Container>
	);
};
