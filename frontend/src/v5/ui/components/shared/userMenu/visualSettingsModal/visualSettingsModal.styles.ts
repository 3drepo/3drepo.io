/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import styled from 'styled-components';
import { FormModalNoButtons as FormModalNoButtonsBase } from '@controls/formModal/formModalNoButtons/formModalNoButtons.component';
import { FormModalContent } from '@controls/formModal/modalBody/modalBody.styles';

export const FormModalNoButtons = styled(FormModalNoButtonsBase)`
	.MuiDialog-paper {
		width: 400px;

		form {
			min-width: unset;
		}
	}

	${FormModalContent} {
		padding: 0;
	}
`;

export const VisualSettingsModalContent = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	width: 400px;
	overflow: hidden;
`;
