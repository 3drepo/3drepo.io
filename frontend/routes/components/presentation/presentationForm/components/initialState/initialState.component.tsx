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
	Content, CreateSessionSection,
	JoinPresentationSection, MainButton,
	StyledTextfield
} from '../../../../../viewerGui/components/presentation/presentation.styles';

interface IProps {
	startPresenting: () => void;
	joinPresentation: (code: string) => void;
}

export const InitialState: React.FunctionComponent<IProps> = ({ startPresenting, joinPresentation }) => {
	const [code, setCode] = useState<string>('');
	const hasCode = code.trim() !== '';

	const handleInputChange = ({ currentTarget }) => setCode(currentTarget?.value);

	const handleJoinPresentation = () => joinPresentation(code);

	return (
		<Content>
			<JoinPresentationSection>
				<StyledTextfield
					label="Enter your invitation code"
					onChange={handleInputChange}
					value={code}
				/>
				<MainButton
					variant="raised"
					color="secondary"
					disabled={!hasCode}
					onClick={handleJoinPresentation}
				>
					Join Session
				</MainButton>
			</JoinPresentationSection>
			<CreateSessionSection>
				<MainButton
					variant="raised"
					color="secondary"
					onClick={startPresenting}
				>
					Create Session
				</MainButton>
			</CreateSessionSection>
		</Content>
	);
};
