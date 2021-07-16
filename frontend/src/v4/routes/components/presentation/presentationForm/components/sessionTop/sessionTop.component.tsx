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

import CopyIcon from '@material-ui/icons/FileCopy';
import ShareIcon from '@material-ui/icons/Share';

import copy from 'copy-to-clipboard';

import { CopyButton, FieldContainer, Paragraph, StyledDivider, StyledTextfield } from '../../presentationForm.styles';

interface IProps {
	sessionCode: string;
	presentationUrl: string;
	stopPresenting: () => void;
	showSnackbar: (text: string) => void;
}

export const SessionTop: React.FC<IProps> = ({ sessionCode, showSnackbar, presentationUrl }) => {
	const handleCopyButtonClick = React.useCallback(() => {
		copy(sessionCode);
		showSnackbar('Invitation code copied to the clipboard');
	}, [sessionCode, showSnackbar]);

	const handleShareButtonClick = React.useCallback(() => {
		copy(presentationUrl);
		showSnackbar('Invitation link copied to clipboard');
	}, [sessionCode, showSnackbar]);

	return (
		<>
			<FieldContainer>
				<StyledTextfield
					label="Invitation code"
					value={sessionCode}
					disabled
				/>
				<CopyButton icon={CopyIcon} onClick={handleCopyButtonClick}>
					Copy
				</CopyButton>
				<CopyButton icon={ShareIcon} onClick={handleShareButtonClick}>
					Share
				</CopyButton>
			</FieldContainer>
			<Paragraph>
				Share your 3D Repo view live with colleagues
			</Paragraph>
			<StyledDivider />
		</>
	);
};
