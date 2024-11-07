/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { Gap } from '@controls/gap';
import { InputContainer } from '@controls/inputs/inputContainer/inputContainer.styles';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { InputController } from '@controls/inputs/inputController.component';
import { JobsAndUsersProperty } from '../../properties/jobsAndUsersProperty.component';
import { IssueProperties } from '../../../tickets.constants';

export const AssigneesProperty = ({ onBlur, readOnly }) => (
	<>
		<Gap $height="10px" />
		<InputContainer>
			<Typography variant="h5">
				<FormattedMessage
					id="customTicket.topPanel.assignees.label"
					defaultMessage="Assignees"
				/>
			</Typography>
			<InputController
				Input={JobsAndUsersProperty}
				name={`properties[${IssueProperties.ASSIGNEES}]`}
				onBlur={onBlur}
				key={IssueProperties.ASSIGNEES}
				disabled={readOnly}
				showAddButton
				multiple
				filterViewers
				maxItems={17}
			/>
		</InputContainer>
	</>
);