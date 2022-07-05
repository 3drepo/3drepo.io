/**
 *  Copyright (C) 2022 3D Repo Ltd
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
/* eslint-disable jsx-a11y/anchor-is-valid */

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Body1, Body2, Caption, Kicker, KickerTitle, Link } from './typography.styles';

const TypographySampleComponent = () => (
	<div>
		<h1>Header 1</h1>
		<h2>Header 2</h2>
		<h3>Header 3</h3>
		<h4>Header 4</h4>
		<h5>Header 5</h5>
		<h6>Header 5</h6>
		<Body1>Body 1</Body1>
		<Body2>Body 2</Body2>
		<Link>Link</Link>
		<Caption>Caption</Caption>
		<KickerTitle>KickerTitle</KickerTitle>
		<Kicker>Kicker</Kicker>
	</div>
);

export default {
	title: 'Theme/Typography',
	component: TypographySampleComponent,
	parameters: {
		// More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
		layout: 'fullscreen',
	},
} as ComponentMeta<typeof TypographySampleComponent>;

const Template: ComponentStory<typeof TypographySampleComponent> = () => <TypographySampleComponent />;

export const TypographySample = Template.bind({});
