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

import { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from '@controls/breadcrumbs';
import { AppBarDecorator, BrowserRouterDecorator } from '../decorators';

const meta: Meta<typeof Breadcrumbs> = {
	title: 'Dashboard/BreadCrumbs',
	component: Breadcrumbs,
	decorators: [AppBarDecorator, BrowserRouterDecorator],
	parameters: { controls: { exclude: ['breadcrumbs'] } },
};
export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

export const NoBreadCrumbs: Story = {
	args: {
		breadcrumbs: [],
	},
};

export const BreadCrumbsNoOptions: Story = {
	args: {
		breadcrumbs: [{ title: 'My teamspace', to: 'http://3drepo.com' }, { title: 'A project' }],
	},
};

export const BreadCrumbsWithOptions: Story = {
	args: {
		breadcrumbs: [
			{ title: 'My teamspace', to: 'http://3drepo.com' },
			{
				options: [
					{ title: 'Another Project' },
					{ title: 'A project', selected: true },
					{ title: 'Yet another project' },
				],
			},
		],
	},
};

export const BreadCrumbsWithVariousOptions: Story = {
	args: {
		breadcrumbs: [
			{ title: 'My teamspace', to: 'http://3drepo.com' },
			{
				options: [
					{ title: 'Another Project' },
					{ title: 'A project' },
					{ title: 'Yet another project', selected: true },
				],
			},
			{
				options: [
					{ title: 'A federation' },
					{ title: 'Another federation' },
				],
			},
		],
	},
};
