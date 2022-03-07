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
import { CircleButton as Button } from '@controls/circleButton';
import IntercomIcon from '@assets/icons/intercom.svg';
import NotificationsIcon from '@assets/icons/notifications.svg';

export default {
	title: 'Buttons/CircleButton',
	component: Button,
	argTypes: {
		variant: {
			description: 'Variant of the button',
			options: ['main', 'contrast'],
			control: { type: 'select' },
		},
	},
	parameters: {
		docs: {
			transformSource: (source) => source.replace(/__WEBPACK_DEFAULT_EXPORT__/g, 'Icon'),
		},
	},
} as ComponentMeta<typeof Button>;

const TemplateIntercom: ComponentStory<typeof Button> = (args) => <Button {...args}><IntercomIcon /></Button>;
const TemplateNotifications: ComponentStory<typeof Button> = (args) => (
	<Button {...args}><NotificationsIcon /></Button>);

export const IntercomMain = TemplateIntercom.bind({});
IntercomMain.args = {
	variant: 'main',
};

export const IntercomContrast = TemplateIntercom.bind({});
IntercomContrast.args = {
	variant: 'contrast',
};

export const NotificationsMain = TemplateNotifications.bind({});
NotificationsMain.args = {
	variant: 'main',
};

export const NotificationsContrast = TemplateNotifications.bind({});
NotificationsContrast.args = {
	variant: 'contrast',
};
