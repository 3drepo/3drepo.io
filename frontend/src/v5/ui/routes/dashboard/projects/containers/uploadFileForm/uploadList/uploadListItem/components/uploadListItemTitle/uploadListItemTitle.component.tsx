/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { ErrorTooltip } from '@controls/errorTooltip';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Tooltip } from '@mui/material';
import { Container, Filename, Filesize, FlexContainer } from './uploadListItemTitle.styles';

type IUploadListItemTitle = {
	name: string;
	filesize: string;
	selectedrow: boolean;
	errorMessage: string;
};

export const UploadListItemTitle = ({
	name,
	filesize,
	selectedrow,
	errorMessage,
}: IUploadListItemTitle): JSX.Element => (
	<FixedOrGrowContainer>
		<Container>
			<FlexContainer $selectedrow={selectedrow} error={errorMessage}>
				<Tooltip title={name} placement="bottom-start">
					<Filename>
						{name}
					</Filename>
				</Tooltip>
				{errorMessage && (
					<ErrorTooltip>
						{errorMessage}
					</ErrorTooltip>
				)}
			</FlexContainer>
			<Filesize>
				{filesize}
			</Filesize>
		</Container>
	</FixedOrGrowContainer>
);
