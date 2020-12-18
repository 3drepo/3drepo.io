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

import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Tab from '@material-ui/core/Tab';
import styled from 'styled-components';
import { COLOR } from '../../styles';

export const Head = styled.div`
	font-size: 14px;
	color: ${COLOR.BLACK_60};
	min-height: 50px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	background: ${COLOR.WHITE};
	border-bottom: 1px solid ${COLOR.BLACK_6};
	position: relative;
	z-index: 1;
`;

export const List = styled.div`
	overflow: hidden;
	position: relative;
	width: 100%;
	height: 100%;
`;

export const LoaderContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding-top: 100px;
	box-sizing: border-box;
`;

export const GridContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	grid-gap: 15px;
	padding: 10px 15px;
	background-color: ${COLOR.WHITE};
`;

export const MenuButton = styled(Fab).attrs({
	classes: {
		disabled: 'button--disabled'
	}
})`
	&&.button--disabled {
		background: ${COLOR.LIGHT_GRAY_89};
		color: ${COLOR.GRAY_60};
	}

	&& {
		position: absolute;
		bottom: -22px;
		right: 14px;
	}
`;

export const AddModelButtonOption = styled(Button)`
	&& {
		flex: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		margin: 0;
		border-radius: 0;
	}

	&:not(:last-child) {
		border-right: 1px solid ${COLOR.BLACK_12};
	}
`;

export const AddModelButton = styled.div`
	color: ${COLOR.BLACK_20};
	border: 2px dashed currentColor;
	display: flex;
	position: relative;
	min-height: 74px;

	&:after {
		left: 0;
		top: 0;
		width: 100%;
		content: '+';
		align-self: center;
		text-align: center;
		font-size: 35px;
	}

	${AddModelButtonOption} {
		display: none;
	}

	&:hover {
		&:after {
			display: none;
		}

		${AddModelButtonOption} {
			display: block;
		}
	}
`;

export const Action = styled.div`
	display: flex;
`;

export const Label = styled.span`
	margin-left: 6px;
`;

export const OtherTeamspacesLabel = styled.div`
	padding: 10px 23px;
	font-size: 12px;
	color: ${COLOR.BLACK_30};
	margin-bottom: 0;
	font-weight: 400;
	border-bottom: 1px solid ${COLOR.BLACK_6};
`;

export const StyledTab = styled(Tab)`
	&& {
		padding-left: 24px;
		padding-right: 24px;
	}
`;
