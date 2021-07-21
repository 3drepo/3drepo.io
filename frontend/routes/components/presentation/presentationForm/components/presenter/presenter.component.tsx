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

import { SessionTop } from '../sessionTop';

import { Container, StopButton, StyledDivider } from '../../presentationForm.styles';
import { SectionBottom } from '../sectionBottom/sectionBottom.component';

interface IProps {
	stopPresenting: () => void;
	showConfirmDialog: (config) => void;
}

export const Presenter: React.FC<IProps> = ({ stopPresenting, showConfirmDialog }) => {
	const handleStopButtonClick = React.useCallback(() => {
		showConfirmDialog({
			title: `End Session?`,
			content: `This will end the session for all users. Continue?`,
			onConfirm: () => {
				// If stopPresenting is directly pass as onConfirm, stopPresenting might be called twice  ¯\_(ツ)_/¯
				stopPresenting();
			},
		});
	}, [showConfirmDialog, stopPresenting]);

	return (
		<Container>
			<SessionTop />
			<StopButton onClick={handleStopButtonClick}>
				End Session
			</StopButton>
			<StyledDivider />
			<SectionBottom>
				You are hosting a session, send other users the invitation code.
			</SectionBottom>
		</Container>
	);
};
