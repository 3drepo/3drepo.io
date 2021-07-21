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

import PauseIcon from '@material-ui/icons/Pause';
import PlayIcon from '@material-ui/icons/PlayArrow';

import { renderWhenTrueOtherwise } from '../../../../../../helpers/rendering';
import { ButtonContainer, Container, SecondaryButton, StopButton, StyledDivider } from '../../presentationForm.styles';
import { SectionBottom } from '../sectionBottom/sectionBottom.component';
import { SessionTop } from '../sessionTop';

interface IProps {
	isPaused: boolean;
	leavePresentation: () => void;
	togglePause: () => void;
}

const renderPlayButtonContent = (isPaused: boolean) => renderWhenTrueOtherwise(
() => <><PlayIcon /> Resume</>,
() => <><PauseIcon /> Pause</>,
)(isPaused);

export const Participant: React.FC<IProps> = ({ leavePresentation, isPaused, togglePause }) => (
	<Container>
		<SessionTop />
		<ButtonContainer>
			<StopButton onClick={leavePresentation}>
				Exit
			</StopButton>
			<SecondaryButton onClick={togglePause}>
				{renderPlayButtonContent(isPaused)}
			</SecondaryButton>
		</ButtonContainer>
		<StyledDivider />
		<SectionBottom>
			You are participating in a live session.<br />
			{isPaused ? 'Resume to continue following the presenter.' :
						'Pause to take control of your view, select objects and add pins'}
		</SectionBottom>
	</Container>
);
