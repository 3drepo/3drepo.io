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
import { StarIcon as StarIconComponent } from '../../../components/starIcon/starIcon.component';

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
	cursor: ${(props) => props.isPending ? 'inherit' : 'pointer'};

	&, mark {
		font-weight: ${FONT_WEIGHT.BOLD};
	}
`;

export const StarIcon = styled(StarIconComponent)`
	z-index: 1;
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
	height: 36px;
	justify-content: flex-end;
`;

export const Property = styled.span`
	max-width: 162px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;

export const RevisionsNumber = styled(Property)`
	z-index: 1;

	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
`;

export const Timestamp = styled.span`
	align-self: flex-end;
	text-align: right;
`;

export const Status = styled.span`
	justify-content: flex-end;
	display: flex;
	width: 100%;
	font-weight: 400;
	color: ${COLOR.BLACK_40};
	font-size: 12px;
	align-items: flex-end;
`;

export const ModelLink = styled.div`
	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	cursor: pointer;
`;

export const NameWithCode = styled.div`
	display: flex;
	flex-direction: column;
	position: relative;
	cursor: pointer;
`;

export const ModelCode = styled.span`
	position: absolute;
	top: 100%;
`;
