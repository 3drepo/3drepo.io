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

import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

import { COLOR } from '../../../../../styles';

export const StyledTypography = styled(Typography)`
	&& {
		display: ${(props: { inline: boolean }) => props.inline ? 'inline' : 'inherit'};
	}
`;

export const StyledList = styled(List)`
`;

export const StyledListItem = styled(ListItem)`
	&& {
		padding-right: 80px;
	}
`;

export const StyledGrid = styled(Grid)`
	&& {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0;
		right: 0;
		padding: 12px 24px;
		background-color: ${COLOR.LIGHT_GRAY};
		border-bottom: 1px solid rgba(0, 0, 0, 0.12);
	}
`;

export const Label = styled(Grid)`
	&& {
		flex-grow: 0;
		max-width: 8.333333%;
		flex-basis: 8.333333%;
	}
`;

export const TextContainer = styled(Grid)`
	&& {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
`;

export const Container = styled.div`
	position: relative;
	width: 600px;
	min-height: 40vh;
`;

export const StyledDialogContent = styled(DialogContent)`
	&& {
		margin-top: 54px;
		padding-top: 0;
	}
`;

export const Description = styled.span`
	color: ${COLOR.BLACK_54};
	font-size: 0.75rem;
	font-weight: 400;
	line-height: 1.375em;
	white-space: normal;
	display: block;
	overflow: hidden;
`;

export const ExpandButton = styled.span`
	font-size: 0.75rem;
	cursor: pointer;
	display: block;
	text-align: right;
`;
