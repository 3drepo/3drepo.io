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
import { Accordion } from '@controls/accordion/accordion.component';
import Icon from '@assets/icons/outlined/stepper_error-outlined.svg';

export default {
	title: 'Containers/Accordion',
	component: Accordion,
	argTypes: {
		title: {
			type: 'string',
		},
		defaultExpanded: {
			type: 'boolean',
		},
	},
	parameters: { controls: { exclude: ['ref', 'elevation', 'square', 'variant', 'Icon'] } },
} as ComponentMeta<typeof Accordion>;

const Controlled: ComponentStory<typeof Accordion> = (args) => (<Accordion {...args} />);

export const ControlledFormSelect = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormSelect.args = {
	title: 'Accordion container',
	children: <div>This is some content only visible once expanded</div>,
	Icon,
};
