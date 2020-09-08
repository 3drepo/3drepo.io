import styled from 'styled-components';

import { COLOR } from '../../../../../styles';

const getDirection = ({ left }) => left ? 'right: 100%' : 'right: 100%';

export const Wrapper = styled.div`
	background-color: ${COLOR.WHITE};
	position: absolute;
	top: 0;
	z-index: 1;
	min-width: 160px;
	max-width: 400px;
	width: 100%;
	box-shadow: 1px 1px 3px 0 ${COLOR.BLACK_20};
	border-radius: 0 2px 2px 0;
	${getDirection};
	max-height: ${(props: any) => `calc(100vh - ${props.top}px - 25px)`};
	overflow: auto;
`;
