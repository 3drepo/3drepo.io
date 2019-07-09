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
import { COLOR } from '../../../styles';

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

export const ExternalLinksList = styled.div`
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
