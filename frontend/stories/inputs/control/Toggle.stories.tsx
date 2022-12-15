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
import { Toggle } from '@controls/inputs/toggle/toggle.component';
import { FormContainer } from '../FormInput.styles';

export default {
	title: 'Inputs/Control/Toggle',
	argTypes: {
		defaultChecked: {
			type: 'boolean',
		},
		disabled: {
			type: 'boolean',
		},
		error: {
			type: 'boolean',
		},
		value: {
			type: 'boolean',
		},
	},
	component: Toggle,
	parameters: { controls: { exclude: [
		'action',
		'touchRippleRef',
		'TouchRippleProps',
		'onFocusVisible',
		'LinkComponent',
		'focusVisibleClassName',
		'focusRipple',
		'disableTouchRipple',
		'centerRipple',
		'onBlur',
		'onChange',
		'name',
		'className',
		'inputRef',
		'ref',
	] } },
} as ComponentMeta<typeof Toggle>;

const Controlled: ComponentStory<typeof Toggle> = (args) => (
	<FormContainer>
		<Toggle {...args} />
	</FormContainer>
);

export const ControlledFormToggle = Controlled.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
ControlledFormToggle.args = {
	label: 'Controlled Toggle input',
};
