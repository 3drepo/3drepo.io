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

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	background-color: ${({ theme }) => theme.palette.secondary.mid};
	padding-left: 66px;
	padding-right: 36px;
	z-index: 1;
	position: relative;
	max-height: 500px;
	overflow: hidden;
	overflow-y: scroll;
`;

export const RevisionsListEmptyWrapper = styled.div`
	background-color: ${({ theme }) => theme.palette.secondary.mid};
	padding: 33px;
`;

export const RevisionsListEmptyContainer = styled(DashboardListEmptyContainer)`
	background-color: transparent;
`;

export const RevisionsListHeaderContainer = styled.header`
	display: flex;
	padding: 13px 20px 10px 23px;
	margin-top: 17px;
`;

export const RevisionsList = styled.ul`
	display: flex;
	flex-direction: column;
	width: 100%;
	margin: 0 0 40px;
	padding: 0;
`;

const selectedRevisionListItemStyles = css`
	background-image: ${({ theme }) => `linear-gradient(${theme.palette.secondary.mid}, ${theme.palette.secondary.mid}), linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`};
`;

const beforeSelectedRevisionListItemStyles = css`
	background-image: ${({ theme }) => `linear-gradient(${theme.palette.secondary.mid}, ${theme.palette.secondary.mid}), linear-gradient(to bottom, ${theme.palette.secondary.light}, ${theme.palette.primary.main})`};
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

const revisionListItemStylesLineStyles = ({ theme, selected, isBeforeSelected }) => css`
	&:after {
		content: '';
		display: block;
		width: 10px;
		height: 52px;
		position: absolute;
		top: 50%;
		left: -10px;
		z-index: -1;
		border: solid 2px transparent;
		background-origin: border-box;
		background-clip: content-box, border-box;
		background-image: linear-gradient(${theme.palette.secondary.mid}, ${theme.palette.secondary.mid}), linear-gradient(to bottom, ${theme.palette.secondary.light}, ${theme.palette.secondary.light});
		${selected && selectedRevisionListItemStyles};
		${isBeforeSelected && beforeSelectedRevisionListItemStyles};
	}
`;

export const RevisionsListItemWrapper = styled.li`
	box-sizing: border-box;
	background-color: ${({ theme }) => theme.palette.secondary.light};
	height: 52px;
	width: 100%;
	list-style: none;
	border: 1px solid ${({ theme }) => theme.palette.secondary.mid};
	border-bottom-style: none;
	border-left-style: none;
	position: relative;
	cursor: pointer;
	
	&:hover {
		background-color: ${({ theme }) => theme.palette.secondary.main};
	}
	
	${({ isSingle }) => css`
		${!isSingle && revisionListItemStylesLineStyles}
		${isSingle && singleRevisionListItemStyles}

		&:first-of-type:after {
			border-top-left-radius: 5px;
		}

		&:nth-last-child(2):after {
			border-bottom-left-radius: 5px;
		}

		&:last-of-type:after {
			display: none;
		}
	`}

	&:last-child {
		border-radius: 0 0 5px 5px;
		border-bottom-style: solid;
	}

	&:first-child {
		border-radius: 5px 5px 0 0;
		border-top-style: solid;
	}

	&:only-child {
		border-radius: 5px;
	}

	${({ theme, selected }) => selected && css`
		background-color: ${theme.palette.primary.main};
	`}
`;
