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

import ButtonBase from '@material-ui/core/Button';
import styled from 'styled-components';
import { COLOR } from '../../../styles';

export const Container = styled.div`
	width: 400px;
`;

export const List = styled.div`
	padding: 8px 0 12px;
	max-height: 40vh;
	overflow: auto;
	display: flex;
	flex-direction: column;
`;

export const Footer = styled.div`
	padding: 12px 25px;
	padding-bottom: 18px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

export const Invitation = styled.div`
	width: 100%;
	border-bottom: 1px solid ${COLOR.BLACK_6};
	padding: 10px 25px;
	padding-right: 18px;
	box-sizing: border-box;
	font-size: 14px;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const CancelButton = styled(ButtonBase)`
	&& {
		margin-right: 10px;
	}
`;

export const Actions = styled.div``;
