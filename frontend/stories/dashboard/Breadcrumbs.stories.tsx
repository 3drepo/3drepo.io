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

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Breadcrumbs } from '@controls/breadcrumbs';
import { AppBar as MuiAppBar } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

export default {
	title: 'Dashboard/BreadCrumbs',
	component: Breadcrumbs,
	argTypes: {
		borderRadius: {
			type: 'number',
		},
	},
} as ComponentMeta<typeof Breadcrumbs>;

const Template: ComponentStory<typeof Breadcrumbs> = (args) => (
	<BrowserRouter>
		<MuiAppBar>
			<Breadcrumbs {...args} />
		</MuiAppBar>
	</BrowserRouter>
);

export const NoBreadCrumbs = Template.bind({});
NoBreadCrumbs.args = {
	options: [],
	breadcrumbs: [],
};

export const BreadCrumbsNoOptions = Template.bind({});
BreadCrumbsNoOptions.args = {
	breadcrumbs: [{ title: 'My teamspace', to: 'http://3drepo.com' }, { title: 'A project' }],
	options: [],
};

export const BreadCrumbsWithOptions = Template.bind({});
BreadCrumbsWithOptions.args = {
	breadcrumbs: [{ title: 'My teamspace', to: 'http://3drepo.com' }, { title: 'A project' }],
	options: [{ title: 'another Project' }, { title: 'A project' }, { title: 'Yet anothed project' }],
};

export const BreadCrumbsWithOptionsIdMatch = Template.bind({});
BreadCrumbsWithOptionsIdMatch.args = {
	breadcrumbs: [{ title: 'My teamspace', to: 'http://3drepo.com' }, { title: 'A project', id: 123 }],
	options: [{ title: 'another Project' }, { title: 'A project' }, { title: 'A project with sameId', id: 123 }],
};
