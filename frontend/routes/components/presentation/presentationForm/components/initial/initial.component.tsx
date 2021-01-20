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
	Container, PrimaryButton, StyledDivider, StyledDividerWithText, StyledTextfield,
} from '../../presentationForm.styles';
import { SectionBottom } from '../sectionBottom/sectionBottom.component';

interface IProps {
	startPresenting: () => void;
	joinPresentation: (code: string) => void;
}

export const Initial: React.FC<IProps> = ({ startPresenting, joinPresentation }) => {
	const [code, setCode] = React.useState<string>('');
	const hasCode = code.trim() !== '';

	const handleInputChange = ({ currentTarget }) => setCode(currentTarget?.value);

	const handleJoinPresentation = React.useCallback(() => joinPresentation(code), [joinPresentation, code]);

	return (
		<Container>
			<StyledTextfield
				label="Invitation code"
				onChange={handleInputChange}
				value={code}
			/>
			<PrimaryButton disabled={!hasCode} onClick={handleJoinPresentation}>
				Join Session
			</PrimaryButton>
			<StyledDividerWithText>
				OR
			</StyledDividerWithText>
			<PrimaryButton onClick={startPresenting}>
				Create Session
			</PrimaryButton>
			<StyledDivider />
			<SectionBottom>
				Share your 3D Repo view live with colleagues, or join an existing session.
			</SectionBottom>
		</Container>
	);
};
