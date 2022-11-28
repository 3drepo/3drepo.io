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

import { AddButton, Container as Modal, Content } from '@/v4/routes/components/invitationDialog/invitationDialog.styles';
import { css } from 'styled-components';

export default css`
	${Modal} {
		min-width: 520px;
		${Content} {
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};
			.MuiFormControl-root {
				.MuiInputLabel-root {
					font-size: 12px;
				}
				.MuiInputBase-input {
					height: 36px;
					line-height: 36px;
				}
				svg {
					margin-top: 0%;
				}
			}
			.MuiFormControlLabel-root {
				height: 30px;
				margin: 16px 0 8px;
				.MuiCheckbox-root {
					color: ${({ theme }) => theme.palette.primary.main};
					margin: 0 8px 0 0;
					padding: 0;
				}
			}
		}
		${AddButton} {
			padding: 8px 0;
			margin: 0;
			color: ${({ theme }) => theme.palette.primary.main};
			svg {
				color: ${({ theme }) => theme.palette.primary.main};
				height: 15px;
				width: 15px;
				margin: 0 8px 0 0;
			}
		}
	}
`;
