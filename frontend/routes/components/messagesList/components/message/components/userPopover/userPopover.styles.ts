import styled from 'styled-components';

import { COLOR } from '../../../../../../../styles';

export const AvatarWrapper = styled.div`
	display: flex;
	align-items: center;
`;

export const Container = styled.div`
	padding: 10px;
	display: flex;
`;

export const UserData = styled.div`
	margin-left: 10px;
	margin-right: 10px;
	overflow: hidden;
`;

export const Name = styled.span`
	font-size: 12px;
`;

export const Details = styled.p`
	color: ${COLOR.BLACK_40};
	font-size: 10px;
	margin-top: 0;
	margin-bottom: 2px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
`;
