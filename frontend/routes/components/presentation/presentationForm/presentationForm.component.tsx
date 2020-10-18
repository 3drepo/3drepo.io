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

import {
	AlignRight,
	CancelButton, CodeLabel, Content, CreateSessionSection, JoinPresentationSection, MainButton,
	SessionStartedContent, StyledButton, StyledTextfield
} from '../../../viewerGui/components/presentation/presentation.styles';
import { PresentationMode } from '../presentation.constants';

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

const COMPONENTS_MAP = {
	[PresentationMode.PRESENTER]: Presenting,
	[PresentationMode.PARTICIPANT]: JoinedPresentation,
	[PresentationMode.DEFAULT]: InitialState,
};

interface IProps {
	mode: PresentationMode;
	isPaused: boolean;
	sessionCode: string;
	startPresenting: () => void;
	stopPresenting: () => void;
	joinPresentation: (code: string) => void;
	leavePresentation: () => void;
	togglePause: () => void;
}

export const PresentationForm: React.FunctionComponent<IProps> = ({ mode, ...props }) => {

	const Component = COMPONENTS_MAP[mode] ? COMPONENTS_MAP[mode] : InitialState;

	return <Component {...props} />;
};
