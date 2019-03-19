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

import * as React from 'react';

import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import { MuiTheme, theme } from '../../../styles';
import { Container, Title, Content, ContentWrapper } from './panel.styles';

interface IProps {
	title?: string | JSX.Element;
	children: any;
	paperProps?: any;
	hiddenScrollbars?: boolean;
}

export const Panel = (props: IProps) => (
	<ThemeProvider theme={theme}>
		<MuiThemeProvider theme={MuiTheme}>
			<Container {...props.paperProps}>
				<Title>{props.title}</Title>
				<Content>
					<ContentWrapper hiddenScrollbars={props.hiddenScrollbars}>
						{props.children}
					</ContentWrapper>
				</Content>
			</Container>
		</MuiThemeProvider>
	</ThemeProvider>
);
