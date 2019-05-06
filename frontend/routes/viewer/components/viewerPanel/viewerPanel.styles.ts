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

import styled, { css } from 'styled-components';
import { COLOR } from '../../../../styles/colors';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

interface IViewerPanelFooter {
	padding?: string;
}

interface IViewerPanelContent {
	isPadding?: boolean;
	scrollDisabled?: boolean;
}

interface IViewerPanelButton {
	active?: number;
}

export const TitleContainer = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 0 -16px;
	width: calc(100% + 32px);
	height: inherit;

	button {
		color: ${COLOR.WHITE};

		&:disabled {
			color: ${COLOR.GRAY};
		}
	}
`;

export const Title = styled.div`
	align-items: center;
	display: flex;
`;

export const Actions = styled.div`
	align-items: center;
	display: flex;
`;

export const Action = styled.span`
	color: ${COLOR.WHITE};
`;

export const TitleIcon = styled.div`
	align-self: center;
	height: 100%;
	width: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const ViewerPanelContent = styled.div<IViewerPanelContent>`
	background-color: ${COLOR.WHITE_87};
	overflow: ${(props) => props.scrollDisabled ? 'hidden' : 'auto'};
	display: ${(props) => props.scrollDisabled ? 'flex' : 'block'};
	flex-direction: ${(props) => props.scrollDisabled ? 'column' : 'unset'};
	position: relative;
`;

export const LoaderContainer = styled(ViewerPanelContent)`
	padding: 24px;
`;

export const ViewerPanelFooter = styled(Grid).attrs({
	direction: 'row',
	container: true,
	wrap: 'nowrap'
})<IViewerPanelFooter>`
	background-color: ${COLOR.WHITE};
	padding: ${(props) => props.padding ? props.padding : '0 16px' };
	border-top: 1px solid ${COLOR.BLACK_20};
	flex: none;
	min-height: 65px;
	font-size: 14px;
`;

export const ViewerPanelButton = styled(Button)<IViewerPanelButton>`
	&& {
		flex: none;
		margin-right: -3px;
		width: 40px;
		height: 40px;
		${({ active }) => active ? css`
			background-color: #ff9800;
			&:hover {
				background-color: ${COLOR.DARK_ORANGE};
			}
		` : ''
		}
	}
`;
