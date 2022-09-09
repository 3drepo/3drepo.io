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
import { ShareTextField } from '@controls/shareTextField';
import { ComponentStory, ComponentMeta } from '@storybook/react';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Inputs/ShareTextField',
	argTypes: {
		hideValue: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
	},
	component: ShareTextField,
	parameters: { controls: { exclude: ['className'] } },
} as ComponentMeta<typeof ShareTextField>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ShareTextField> = (args) => <ShareTextField {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
	label: 'Textfield label',
	value: 'https://3drepo.com/',
};

export const HiddenValue = Template.bind({});
HiddenValue.args = {
	label: 'Textfield label',
	value: 'https://3drepo.com/',
	hideValue: true,
};

export const DisabledValue = Template.bind({});
DisabledValue.args = {
	label: 'Textfield label',
	value: 'https://3drepo.com/',
	disabled: true,
};
