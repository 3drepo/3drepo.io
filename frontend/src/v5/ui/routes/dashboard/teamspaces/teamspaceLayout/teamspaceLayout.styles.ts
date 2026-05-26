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

import styled from 'styled-components';
import { hexToOpacity } from '@/v5/helpers/colors.helper';
import { CoverImage } from '@controls/coverImage/coverImage.component';
import { GRADIENT } from '@/v5/ui/themes/theme';
import { InnerContainer } from '@components/dashboard/dashboardProjectLayout/dashboardProjectLayout.styles';

export const Container = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	height: 100%;
	display: flex;
	flex-direction: column;
`;

export const Content = styled(InnerContainer)`
	margin-top: 32px;
	flex-direction: column;
	display: flex;
	justify-content: flex-start;
	min-height: unset;
	height: fit-content;
`;

export const TopBar = styled.div`
	background: ${GRADIENT.SECONDARY};
	padding: 30px 75px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	border-top: 1px solid ${({ theme }) => hexToOpacity(theme.palette.primary.main, 10)};
`;

export const TeamspaceImage = styled(CoverImage)`
	border-radius: 25px;
	height: 142px;
	width: 142px;
`;

export const TeamspaceInfo = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	color: ${({ theme }) => theme.palette.primary.contrast};
	margin-left: 29px;
	row-gap: 12px;
`;
