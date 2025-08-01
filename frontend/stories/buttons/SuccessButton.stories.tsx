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
import { SuccessButton } from '@controls/button/successButton/successButton.styles';
import { Meta } from '@storybook/react';

const meta: Meta<typeof SuccessButton> = {
	title: 'Buttons/SuccessButton',
	component: SuccessButton,
	argTypes: {
		variant: {
			description: 'Variant of the button',
			options: ['contained', 'outlined', 'text'],
			control: { type: 'select' },
		},
	},
};
export default meta;

const Template = (args) => (
	<div style={{ background: '#F2F6FC' }}>
		<SuccessButton {...args}>Success Button</SuccessButton>
	</div>
);

export const Outlined = Template.bind({});
Outlined.args = { variant: 'outlined' };

export const Contained = Template.bind({});
Contained.args = { variant: 'contained' };
