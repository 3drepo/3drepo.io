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
import { EllipsisButton } from '@controls/ellipsisMenu/ellipsisMenu.styles';
import { InputContainer as InputContainerBase } from '@controls/inputs/inputContainer/inputContainer.styles';
import TooltipBase from '@mui/material/Tooltip';
import { InputLabel } from '@mui/material';
import styled from 'styled-components';

export const InputContainer = styled(InputContainerBase)`
	padding: 0 13px 13px;
`;

export const Label = styled(InputLabel)`
	${({ theme }) => theme.typography.h5}
	color: inherit;
	max-width: 100%;
	word-wrap: break-word;
	text-overflow: ellipsis;
`;

export const Header = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`;

export const HeaderSection = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;

	${/* sc-selector */ EllipsisButton}:hover {
		background-color: transparent;
	}
`;

export const Tooltip = styled(TooltipBase).attrs({
	placement: 'right',
	componentsProps: {
		popper: {
			sx: {
				left: -10,
			},
		},
	},
})``;
