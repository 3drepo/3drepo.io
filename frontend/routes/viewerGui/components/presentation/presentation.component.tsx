/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import { VIEWER_PANELS, VIEWER_PANELS_ICONS } from '../../../../constants/viewerGui';
import {  PresentationContainer } from './presentation.styles';

const PresentationIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.PRESENTATION];

const JoinedPresentation = ({sessionCode}) => {
	return (
		<div> you have joined a presentation {sessionCode}
			<button>Pause</button>
			<button>End Session</button>
		</div>
	);
};

const Presenting = ({sessionCode, stopPresenting}) => {
	return (
		<div> you are presenting  {sessionCode}
			<button onClick={stopPresenting}>End Session</button>
		</div>
	);
};

const InitialState = ({startPresenting}) => {
	return (
		<div>
			<input />
			<button >Join</button>
			<hr />
			<button onClick={startPresenting}>Create Session</button>
		</div>
	);
};

interface IProps {
	isPresenting: boolean;
	joinedPresentation: boolean;
	sessionCode: string;
	startPresenting: () => void;
	stopPresenting: () => void;
}

export class Presentation extends React.PureComponent<IProps, any> {
	public renderTitleIcon() {
		return <PresentationIcon />;
	}

	public render() {
		const {isPresenting, joinedPresentation} = this.props;
		const isInitialState  = !isPresenting && !joinedPresentation;

		return (
			<PresentationContainer
				Icon={this.renderTitleIcon()}
			>
				{isPresenting && <Presenting {...this.props} />}
				{joinedPresentation && <JoinedPresentation {...this.props} />}
				{isInitialState && <InitialState {...this.props} />}
			</PresentationContainer>
		);
	}
}
