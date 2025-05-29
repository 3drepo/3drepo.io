/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import MenuItem from '@mui/material/MenuItem';
import styled, { css } from 'styled-components';
import { COLOR, FONT_WEIGHT } from '../../../../../styles';
import { SelectField } from '../../../selectField/selectField.component';

export const StyledSelect = styled(SelectField)`
	&& {
		width: 100%;
		display: ${({ hidden }) => hidden ? 'none' : 'block'};

		.select {
			padding-right: 32px;
		}
	}

	.select--disabled ~ .select__icon {
		opacity: 0.6;
	}

	.select__icon {
		visibility: ${(props) => props.readOnly ? 'hidden' : 'inherit'};
	}
`;

export const Item = styled(MenuItem)<{ group: number }>`
	&& {
		font-size: 14px;
		color: ${COLOR.BLACK_60};
		padding-top: 12px;
		padding-bottom: 12px;

		${({ theme, group }) => group ? css`
			height: 12px;
			font-weight: ${FONT_WEIGHT.BOLD};
			border-top: 1px solid ${COLOR.BLACK_20};
			&& {
				${theme.typography.h3}
				opacity: 1;
				padding: 17px 14px 8px;
				height: fit-content;
				border-color: ${theme.palette.secondary.lightest};
			}
		` : ''}
		${({ disabled, group }) => disabled && !group && css`
			padding-top: 2px;
		`}
	}
`;

export const EmptyValue = styled(Item)``;
