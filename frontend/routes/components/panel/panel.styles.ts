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

import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';

import { COLOR, FONT_WEIGHT } from '../../../styles';

export const Container = styled(Paper)`
	&& {
		background: #fafafa;
		height: ${(props: any) => props.height || 'auto'};
		width: ${(props: any) => props.width || 'auto'};
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
		border-radius: 4px;
	}
`;

export const Title = styled.div`
	font-size: 20px;
	font-weight: ${FONT_WEIGHT.NORMAL};
	height: 40px;
	overflow: hidden;
	min-height: 40px;
	border-radius: 4px 4px 0 0;
	background-color: ${COLOR.PRIMARY_MAIN};
	color: rgba(255,255,255,0.87);
	display: flex;
	justify-content: flex-start;
	align-items: center;
	padding: 0 16px;
	position: relative;
`;

export const Content = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

export const ContentWrapper = styled.div`
	height: 100%;
	white-space: pre-line;
	overflow: ${(props: any) => props.hiddenScrollbars ? 'hidden' : 'auto'};
	display: flex;
	flex-direction: column;
	justify-content: ${(props: any) => props.disableStretching ? 'flex-start' : 'space-between'};
`as any;

export const LoaderContainer = styled.div`
	position: relative;
	padding-top: 100px;
	display: flex;
	justify-content: center;
`;
