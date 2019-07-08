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

import * as React from 'react';
import { cond } from 'lodash';

import { Container } from './viewerLoader.styles';
import { VIEWER_EVENTS } from '../../../../constants/viewer';

interface IProps {
	viewer: any;
	className?: string;
}

export class ViewerLoader extends React.PureComponent<IProps, any> {
	public state = {
		isVisible: false,
		message: '',
		progress: 0
	};

	public componentDidMount() {
		this.props.viewer.on(VIEWER_EVENTS.VIEWER_INIT, this.setProgressState('Loading viewer'));
		this.props.viewer.on(VIEWER_EVENTS.VIEWER_INIT_PROGRESS, this.setProgressState('Loading viewer'));
		this.props.viewer.on(VIEWER_EVENTS.MODEL_LOADING_START, this.setProgressState('Loading model'));
		this.props.viewer.on(VIEWER_EVENTS.MODEL_LOADING_PROGRESS, this.setProgressState('Loading model'));
		this.props.viewer.on(VIEWER_EVENTS.MODEL_LOADING_CANCEL, this.setProgressState('Loading model'));
		this.props.viewer.on(VIEWER_EVENTS.MODEL_LOADED, this.setProgressState(''));
	}

	public componentWillUnmount() {
		this.props.viewer.off(VIEWER_EVENTS.VIEWER_INIT);
		this.props.viewer.off(VIEWER_EVENTS.VIEWER_INIT_PROGRESS);
		this.props.viewer.off(VIEWER_EVENTS.VIEWER_INIT_SUCCESS);
		this.props.viewer.off(VIEWER_EVENTS.MODEL_LOADED);
	}

	public render() {
		return (
			<Container shouldHide={!this.state.isVisible}>{this.message}</Container>
		);
	}

	private get message() {
		const { message, progress } = this.state;
		return `${message} (${progress}%)`;
	}

	private setProgressState = (message) => (progress = 0) => {
		const isVisible = progress !== 1;
		const percentageProgress = (progress * 100).toFixed(0);
		this.setState(() => ({
			isVisible,
			message,
			progress: percentageProgress
		}), () => {
			if (!isVisible) {
				setTimeout(() => {
					this.setState({
						message: '',
						progress: 0
					});
				}, 250);
			}
		});
	}
}
