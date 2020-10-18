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

import {
	AlignRight,
	CancelButton, MainButton,
	SessionStartedContent, StyledButton
} from '../../../../../viewerGui/components/presentation/presentation.styles';

const TogglePauseButton = ({isPaused, onClick}) => {
	return (
			<>
				{isPaused && (<StyledButton variant="raised"  color="secondary"  onClick={onClick}> Resume </StyledButton>)}
				{!isPaused && (<MainButton variant="raised"  color="secondary"  onClick={onClick}> Pause </MainButton>)}
			</>
	);
};

interface IProps {
	isPaused: boolean;
	leavePresentation: () => void;
	togglePause: () => void;
}

export const JoinedPresentation: React.FunctionComponent<IProps> = ({ leavePresentation, isPaused, togglePause }) => (
	<SessionStartedContent>
		You have entered a presentation session. Your
		camera will now be controller by the presenter.
		<AlignRight marginTop={45}>
			<TogglePauseButton onClick={togglePause} isPaused={isPaused} />
			<CancelButton
				variant="raised"
				color="secondary"
				onClick={leavePresentation}
			>
				Exit Session
			</CancelButton>
		</AlignRight>
	</SessionStartedContent>
);
