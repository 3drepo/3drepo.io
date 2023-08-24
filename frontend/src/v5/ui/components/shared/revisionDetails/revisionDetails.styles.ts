/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { DashboardListEmptyContainer } from '@components/dashboard/dashboardList';
import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dashboardList.styles';
import * as RevisionsListHeaderLabelStyles from './components/revisionsListHeaderLabel/revisionsListHeaderLabel.styles';

const BORDER_RADIUS = '8px';
const ITEM_HEIGHT = '49px';

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	background-color: ${({ theme }) => theme.palette.secondary.mid};
	padding-right: 10px;
	z-index: 1;
	position: relative;
	max-height: 500px;
	overflow: hidden;
`;

export const RevisionsListEmptyWrapper = styled.div`
	background-color: ${({ theme }) => theme.palette.secondary.mid};
	padding: 33px;
`;

export const RevisionsListEmptyContainer = styled(DashboardListEmptyContainer)`
	background-color: transparent;
	border-color: ${({ theme }) => theme.palette.secondary.light};
`;

export const RevisionsListEmptyText = styled(DashboardListEmptyText)`
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const RevisionsListHeaderContainer = styled.header`
	display: flex;
	padding: 13px 46px 10px 86px;
	margin-top: 17px;

	${RevisionsListHeaderLabelStyles.Container} {
		&:last-child {
			margin-right: 70px;
		}
	}
`;

export const RevisionsList = styled.ul`
	display: flex;
	flex-direction: column;
	padding: 0;
	max-height: 260px;
	margin-bottom: 51px;
	overflow-y: auto;
`;

const selectedRevisionListItemStyles = css`
	background-image: ${({ theme }) => `linear-gradient(${theme.palette.secondary.mid}, ${theme.palette.secondary.mid}), linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`};
`;

const singleRevisionListItemStyles = ({ theme, selected }) => css`
	&:after {
		content: '';
		display: block !important;
		width: 12px;
		height: 12px;
		position: absolute;
		border-radius: 50%;
		background-color: ${selected ? theme.palette.primary.main : theme.palette.secondary.light};
		top: calc(50% - 6px);
		left: -26px;
	}
`;

const revisionListItemStylesLineStyles = ({ theme, selected }) => css`
	&:after {
		content: '';
		display: block;
		width: 25px;
		height: ${ITEM_HEIGHT};
		position: absolute;
		top: 50%;
		left: -25px;
		z-index: -1;
		border: solid 1px transparent;
		background-origin: border-box;
		background-clip: content-box, border-box;
		background-image: linear-gradient(${theme.palette.secondary.mid}, ${theme.palette.secondary.mid}), linear-gradient(to bottom, ${theme.palette.secondary.light}, ${theme.palette.secondary.light});
		${selected && selectedRevisionListItemStyles};
	}
`;

export const RevisionsListItemWrapper = styled.li<{ isSingle?: boolean, selected?: boolean }>`
	box-sizing: border-box;
	height: ${ITEM_HEIGHT};
	min-height: ${ITEM_HEIGHT};
	width: calc(100% - 98px);
	list-style: none;
	position: relative;
	margin-left: 66px;
	cursor: pointer;

	background-color: ${({ theme }) => theme.palette.secondary.mid};
	border: solid 1px ${({ theme }) => theme.palette.secondary.light};
	border-width: 1px 1px 0 8px;

	&:first-child {
		border-radius: ${BORDER_RADIUS} ${BORDER_RADIUS} 0 0;
	}
	&:last-child {
		border-radius: 0 0 ${BORDER_RADIUS} ${BORDER_RADIUS};
		border-bottom-width: 1px;
	}
	&:only-child {
		border-radius: ${BORDER_RADIUS};
	}

	&:hover {
		background-color: ${({ theme }) => theme.palette.secondary.main};
	}

	${({ theme, selected }) => selected && css`
		background-color: ${theme.palette.secondary.main};
		border-left-color: ${theme.palette.primary.main};
	`}
	
	// Left side connecting line styles
	${({ isSingle }) => css`${isSingle ? singleRevisionListItemStyles : revisionListItemStylesLineStyles}`}
	&:first-of-type:after {
		border-top-left-radius: 10px;
	}
	&:nth-last-child(2):after {
		border-bottom-left-radius: 10px;
	}
	&:last-of-type:after {
		display: none;
	}

`;
