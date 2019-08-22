import styled from 'styled-components';
import { ellipsis } from '../../../../styles';

export const Container = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	position: relative;
`;

export const Actions = styled.div`
	display: flex;
	flex: 1;
	justify-content: flex-end;
	position: absolute;
	right: 0;
`;

export const Title = styled.div`
	font-size: 14px;
	${ellipsis('100%')};
	text-align: center;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	padding-right: 50px;

	& > span {
		overflow: hidden;
	}
`;

export const Empty = styled.div`
	margin-left: 5px;
`;
