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

import React, { useState } from 'react';

import { VIEWER_PANELS, VIEWER_PANELS_ICONS } from '../../../../constants/viewerGui';
import {  AlignRight, CancelButton, CodeLabel,
Content, CreateSessionSection, JoinPresentationSection,
MainButton, PresentationContainer, SessionStartedContent, StyledButton, StyledTextfield } from './presentation.styles';

const PresentationIcon = VIEWER_PANELS_ICONS[VIEWER_PANELS.PRESENTATION];

const TogglePauseButton = ({isPaused, onClick}) => {
	return (
	<>
		{isPaused && (<StyledButton variant="raised"  color="secondary"  onClick={onClick}> Resume </StyledButton>)}
		{!isPaused && (<MainButton variant="raised"  color="secondary"  onClick={onClick}> Pause </MainButton>)}
	</>
	);
};

const JoinedPresentation = ({sessionCode, leavePresentation, isPaused, togglePause}) => {
	return (
		<SessionStartedContent>
			You have entered a presentation session. Your
			camera will now be controller by the presenter.
			<AlignRight marginTop={45}>
				<TogglePauseButton onClick={togglePause} isPaused={isPaused} />
				<CancelButton
						variant="raised"
						color="secondary"
						onClick={leavePresentation}>Exit Session</CancelButton>
			</AlignRight>
		</SessionStartedContent>

	);
};

const Presenting = ({sessionCode, stopPresenting}) => {
	return (
		<SessionStartedContent>
			Session Started. Please share the following
					invitation code to your attendees:
			<CodeLabel>{sessionCode}</CodeLabel>

			<AlignRight>
				<CancelButton
						variant="raised"
						color="secondary"
						onClick={stopPresenting}>End Session</CancelButton>
			</AlignRight>
		</SessionStartedContent>
	);
};

const InitialState = ({startPresenting, joinPresentation}) => {
	const [code, setCode] = useState('');
	const hasCode = code.trim() !== '';

	return (
		<Content>
			<JoinPresentationSection>
				<StyledTextfield
					label="Enter your invitation code"
					onChange={(e) => setCode(e.currentTarget.value)} value={code} />
				<MainButton
					variant="raised"
					color="secondary"
					disabled={!hasCode}
					onClick={() => joinPresentation(code)}>Join</MainButton>
			</JoinPresentationSection>
			<CreateSessionSection>
				<MainButton
						variant="raised"
						color="secondary"
						onClick={startPresenting}>Create Session</MainButton>
			</CreateSessionSection>
		</Content>
	);
};

interface IProps {
	isPresenting: boolean;
	isPaused: boolean;
	joinedPresentation: boolean;
	sessionCode: string;
	startPresenting: () => void;
	stopPresenting: () => void;
	joinPresentation: (code: string) => void;
	leavePresentation: () => void;
	togglePause: () => void;
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
