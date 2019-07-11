import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';

import { COLOR } from '../../../../../styles';

export const Item = styled(ListItem)`
	&& {
		padding: 6px;
	}
`;

export const Container = styled(Paper)`
	background-color: ${(props: any) => props.read ? 'transparent' : COLOR.WHITE};
	margin: 3px;
`;

export const ItemText = styled(ListItemText)`
	&& {
		padding: 0;
		margin-left: 9px;
	}

	${/* sc-selector */ Item}:hover & {
		width: 0;
	}
`;

export const ItemSecondaryAction = styled.div`
	visibility: hidden;
	width: 0;
	height: 40px;
	overflow:hidden;
	display: flex;
	align-items: center;

	${/* sc-selector */ Item}:hover & {
		visibility: inherit;
		width:75px;
	}
`;
