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

import React from 'react';

import { Container, Content, ContentWrapper, Title } from './panel.styles';

interface IProps {
	className?: string;
	title?: string | JSX.Element;
	children?: any;
	paperProps?: any;
	hiddenScrollbars?: boolean;
	disableStretching?: boolean;
}

export const Panel = (props: IProps) => (
	<Container {...props.paperProps} className={props.className}>
		<Title>{props.title}</Title>
		<Content>
			<ContentWrapper disableStretching={props.disableStretching} hiddenScrollbars={props.hiddenScrollbars}>
				{props.children}
			</ContentWrapper>
		</Content>
	</Container>
);
