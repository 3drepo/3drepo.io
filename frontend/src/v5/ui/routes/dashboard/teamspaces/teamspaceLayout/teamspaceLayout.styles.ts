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
import { hexToOpacity } from '@/v5/ui/themes/theme';
import { CoverImage } from '@controls/coverImage/coverImage.component';
import { Content as DashboardContent } from '../../projects/projects.styles';

export const Container = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	height: 100%;
	display: flex;
	flex-direction: column;
`;

export const Content = styled(DashboardContent)`
	margin-top: 32px;
	padding: 9px 30px 41px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 10px;
	flex-direction: column;
	display: flex;
	justify-content: flex-start;
	box-sizing: border-box;
`;

export const Section = styled.section`
	min-height: 100%;
	height: auto;
	display: flex;
	flex-direction: column;
`;

export const TopBar = styled.div`
	background: ${({ theme }) => theme.palette.gradient.secondary};
	padding: 30px 75px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	border-top: 1px solid ${({ theme }) => hexToOpacity(theme.palette.primary.main, 10)};
`;

export const TeamspaceImage = styled(CoverImage)`
	border-radius: 10px;
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
