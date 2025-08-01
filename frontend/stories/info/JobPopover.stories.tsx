/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { JobPopoverCircle } from '@components/shared/popoverCircles/jobPopoverCircle/jobPopoverCircle.component';

const meta: Meta<typeof JobPopoverCircle> = {
	title: 'Info/JobPopoverCircle',
	component: JobPopoverCircle,
	parameters: { controls: { exclude: [
		'alt',
		'children',
		'classes',
		'imgProps',
		'sizes',
		'src',
		'srcSet',
		'sx',
		'variant',
		'ref',
		'backgroundColor',
	] } },
};
export default meta;

type Story = StoryObj<typeof JobPopoverCircle>;

export const JobPopoverPink: Story = {
	args: {
		size: 'small',
		job: {
			_id: 'Front-end Developer',
			color: '#DC1995',
		},
	},
};
