/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { COLOR, FONT_WEIGHT } from '../../../../styles';
import { Highlight } from '../../../components/highlight/highlight.component';

export const Container = styled.div`
	box-shadow: 0 2px 4px 0 ${COLOR.BLACK_20};
	background-color: ${(props) => props.federate ? COLOR.ALICE_BLUE : COLOR.WHITE};
	color: ${COLOR.TUNDORA};
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	font-size: 12px;
	padding: 5px;
	position: relative;
`;

export const Header = styled.div`
	align-items: center;
	display: flex;
	justify-content: space-between;
	margin: 0 0 5px;
`;

export const Name = styled(Highlight)`
	margin: 1px 0 0 2px;
	word-break: break-all;
	cursor: ${(props) => props.isPending ? 'default' : 'pointer'};

	&, mark {
		font-weight: ${FONT_WEIGHT.BOLD};
	}

	&:hover {
		text-decoration: underline;
	}
`;

export const NameWrapper = styled.div`
	align-items: center;
	display: flex;
`;

export const Content = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 0 4px;
`;

export const PropertiesColumn = styled.div`
	display: flex;
	flex-direction: column;
	height: 25px;
	justify-content: flex-end;
`;

export const Property = styled.span`
	max-width: 162px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

export const Timestamp = styled.span`
	align-self: flex-end;
	text-align: right;
`;

export const Status = styled.span`
	align-items: center;
	justify-content: flex-end;
	display: flex;
	width: 100%;
	font-weight: 400;
	color: ${COLOR.BLACK_40};
	font-size: 12px;
`;

export const ModelLink = styled.div`
	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
`;
