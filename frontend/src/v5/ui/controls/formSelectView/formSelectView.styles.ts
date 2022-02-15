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

import styled, { css } from 'styled-components';
import { MenuItem } from '@material-ui/core';
import { FormSelect as FormSelectBase } from '@controls/formSelect/formSelect.component';

const ThumbnailStyles = css`
	width: 43px;
	height: 35px;
	border-radius: 3px;
	margin-right: 11px;
	display: inline-block;
`;

export const Thumbnail = styled.img`
	${ThumbnailStyles};
`;

export const ThumbnailPlaceholder = styled.div`
	${ThumbnailStyles};
	background-color: ${({ theme }) => theme.palette.base.light};
`;

export const ViewLabel = styled.div`
	display: flex;
	flex-direction: column;
`;

export const FormSelect = styled(FormSelectBase)`
	.MuiSelect-selectMenu {
		display: flex;
		padding-left: 0;
	}

	img {
		margin-right: 0;
	}

	${ViewLabel} {
		padding-left: 14px;
	}

	${ThumbnailPlaceholder} {
		display: none;
	}
`;

export const MenuItemView = styled(MenuItem)`
	&.Mui-selected ${/* sc-selector */ ViewLabel}::after {
		content: "Selected";
		color: ${({ theme }) => theme.palette.primary.main};
		${({ theme }) => theme.typography.caption};
	}
`;
