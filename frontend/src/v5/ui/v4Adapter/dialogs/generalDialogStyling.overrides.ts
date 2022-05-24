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
import { css } from 'styled-components';
import { DialogTitle } from '@/v4/routes/components/dialogContainer/components/dialog/dialog.styles';

export default css`
	${DialogTitle} {
		background: ${({ theme }) => theme.palette.gradient.secondary};
		color: ${({ theme }) => theme.palette.primary.contrast};
		height: 74px;
		width: 100%;
		box-sizing: border-box;
		align-items: center;
		display: flex;
		padding: 0 35px;

		button {
			position: absolute;
			top: 10px;
			right: 10px;
			width: 40px;
			height: 40px;
		}

		.MuiDialogContent-root {
			padding: 0;
		}
	}

	.MuiDialogContent-root {
		padding: 0px;
		overflow-x: hidden;
	}
`;
