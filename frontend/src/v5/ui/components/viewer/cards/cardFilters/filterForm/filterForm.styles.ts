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

import { ActionMenu } from '@controls/actionMenu';
import { Button as ButtonBase } from '@controls/button';
import { TextOverflow } from '@controls/textOverflow';
import styled, { css } from 'styled-components';


export const FilterPaperStyleInCards = css`
	left: 88px !important;
	max-height: calc(100% - 170px);
`; 

export const FilterPaperStyleother = css`
	max-height: calc(100% - 200px);
`; 

export const CardFilterActionMenu = styled(ActionMenu)<{ $displayMode?: string }>`
	.MuiPaper-root {
		width: 365px;
		margin-top: 13px;
		${({ $displayMode: mode }) => ( mode === 'card') ? FilterPaperStyleInCards : FilterPaperStyleother}
	}
`;

export const Container = styled.div`
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	max-width: 365px;
`;

export const TitleContainer = styled(TextOverflow)`
	height: 15px;
	line-height: 15px;
`;

export const Button = styled(ButtonBase)`
	margin: 0;
`;

export const ButtonsContainer = styled.div`
	margin-left: auto;
	width: fit-content;
	display: flex;
	gap: 10px;
`;
