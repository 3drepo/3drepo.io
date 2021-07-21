/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import PopoverComponent from '@material-ui/core/Popover';
import { Link as RouterLink } from 'react-router-dom';

import { COLOR } from '../../../../../../../../styles';

export const Link = styled(RouterLink)`
	font-size: inherit;
	color: ${COLOR.VIVID_NAVY};
`;

export const Reference = styled.span`
	font-size: inherit;
	color: ${COLOR.VIVID_NAVY};
	text-decoration: underline;
`;

export const Popover = styled(PopoverComponent)`
	pointer-events: none;
`;

export const Icon = styled.div`
	font-size: 14px;
	display: flex;
	color: ${(props) => props.color || COLOR.WHITE};
`;

export const TicketNumber = styled.span`
	color: ${COLOR.BLACK_30};
`;

export const Container = styled.div`
	padding: 10px;
`;

export const Header = styled.header`
	display: flex;
	align-items: center;
	font-size: 12px;
`;

export const Title = styled.span`
	margin-left: 4px;
`;

export const Description = styled.div`
	color: ${COLOR.BLACK_30};
	font-size: 10px;
	margin-top: 4px;
	margin-bottom: 0;
`;
