import styled from 'styled-components';
import { COLOR } from '../../styles';

export const AppContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
`;

export const ExternalLink = styled.a.attrs({
	target: '_blank',
	rel: 'noopener'
})`
	font-size: 14px;
	color: white;
	margin: 10px 10px 5px;
	opacity: 1;
	text-shadow: 1px 1px rgba(0, 0, 0, 0.3);
`;

export const ExternalLinks = styled.div`
	position: fixed;
	bottom: 0;
	right: 0;
	user-select: none;
	z-index: 4;
	color: ${COLOR.WHITE};
	background: rgba(222, 222, 222, 0);
	border-top-left-radius: 4px;
	padding-bottom: 2px;
	margin-right: 18px;

	@media (max-width: 767px) {
		width: 100%;
		margin-right: 0;
		text-align: center;
		background: #0c2f54;
	}
`;
