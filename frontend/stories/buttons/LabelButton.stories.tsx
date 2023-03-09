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
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { LabelButton as Button } from '@controls/button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'Buttons/Button',
	component: Button,
	parameters: { controls: { exclude: [
		'classes',
		'tabIndex',
		'children',
		'action',
		'centerRipple',
		'disableRipple',
		'disableTouchRipple',
		'focusRipple',
		'focusVisibleClassName',
		'LinkComponent',
		'onFocusVisible',
		'sx',
		'TouchRippleProps',
		'touchRippleRef',
		'disableElevation',
		'disableFocusRipple',
		'endIcon',
		'href',
		'size',
		'startIcon',
		'ref',
	] } },
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args}>Label Button</Button>;

// More on args: https://storybook.js.org/docs/react/writing-stories/args
export const Label = Template.bind({});
