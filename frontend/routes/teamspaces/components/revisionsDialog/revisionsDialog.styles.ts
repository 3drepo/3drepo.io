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
import ListItem from '@material-ui/core/ListItem';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';

import { COLOR } from '../../../../styles/colors';

export const Property = styled.div`
	color: ${COLOR.BLACK};
	width: ${(props: any) => props.width ? `${props.width}px` : 'auto'};
` as any;

export const PropertyWrapper = styled.div`
	display: flex;

	${Property} {
		margin-right: 30px;
	}
`;

export const Item = styled(ListItem)`
	display: flex;
	flex-direction: column;
	border-bottom: 1px solid ${COLOR.BLACK_20};

	&& {
		justify-content: space-between;
		padding: 22px 30px;
		background-color: ${(props: any) => props.last ? 'white' : COLOR.BLACK_6};
		border-bottom: 1px solid ${COLOR.BLACK_20};
	}

	${Property} {
		font-weight: ${(props: any) => props.last ? '500' : '200'};
	}
` as any;

export const Row = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	justify-content: space-between;
`;

export const Description = styled.div`
	color: ${COLOR.BLACK_40};
	align-self: flex-start;
	margin-top: 10px;
`;

export const Message = styled.p`
	width: 100%;
	text-align: center;
	margin: 22px 0 0;
`;

export const StyledDialogActions = styled(DialogActions)`
	&& {
		margin: 0;
		padding: 22px;
	}
`;

export const StyledDialogContent = styled(DialogContent)`
	&& {
		min-width: 480px;
		padding: 0;
	}
`;

export const StyledList = styled(List)`
	&& {
		padding-bottom: 0;
		padding-top: 0;
	}
`;
