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

import styled from 'styled-components';
import { Icon } from '@material-ui/core';
import { COLOR } from '../../../../styles';

export const Container = styled.div`
	border-top: 1px solid ${COLOR.BLACK_6};
	margin-top: -1px;
	overflow: auto;
`;

export const MetaRecord = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 4px 0;

	&:nth-child(2n) {
		background-color: ${COLOR.BLACK_6};
	}
`;

export const MetaKey = styled.div`
	width: 50%;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
`;

export const MetaKeyText = styled.div`
	color: ${COLOR.BLACK_60};
	font-size: 14px;
	padding-right: 10px;
	word-break: break-all;
`;

export const MetaValue = styled.div`
	width: 50%;
	color: ${COLOR.BLACK_87};
	font-size: 14px;
	padding-right: 10px;
	word-break: break-all;
`;

export const EmptyStateInfo = styled.p`
  padding: 14px;
  font-size: 13px;
  color: ${COLOR.BLACK_60};
  background-color: ${COLOR.BLACK_6};
  margin: 25px;
  border-radius: 6px;
  text-align: center;
`;

export const StarIconWrapper = styled(Icon)`
	color: ${(props: any) => props.active ? COLOR.DARK_ORANGE : COLOR.BLACK_20};
	width: 20px;
	margin-left: 5px;
	margin-right: 2px;
	margin-top: -2px;
	cursor: pointer;
` as any;
