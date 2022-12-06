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
import { JobPopover } from '@components/shared/jobPopover/jobPopover.component';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { JobAvatar } from '@controls/jobAvatar/jobAvatar.component';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ComponentProps } from 'react';

export default {
	title: 'Buttons/JobAvatar',
	component: JobAvatar,
	argTypes: {
		job: {
			description: 'Variant of the button',
			control: { type: 'text' },
		},
	},
} as ComponentMeta<typeof JobAvatar>;

 type Props = ComponentProps<typeof JobAvatar>;

const Template: ComponentStory<typeof JobAvatar> = ({ job, ...args }) => (
	<HoverPopover anchor={(props) => <JobAvatar job={job} {...props} {...args} />}>
		<JobPopover job={job} />
	</HoverPopover>
);

export const AvatarWithInitials = Template.bind({});
AvatarWithInitials.args = {
	job: 'Front-end Developer',
} as Props;
