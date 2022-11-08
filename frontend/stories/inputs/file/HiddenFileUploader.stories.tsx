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
import { DashedContainer } from '@controls/dashedContainer/dashedContainer.component';
import { HiddenFileUploader } from '@controls/formImage/hiddenFileUploader/hiddenFileUploader.component';
import { Button } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
	title: 'Inputs/File/HiddenFileUploader',
	component: HiddenFileUploader,
	argTypes: {
		accept: {
			type: 'string',
		},
	},
	parameters: { controls: { exclude: ['className', 'onChange', 'id', 'disabled'] } },
} as ComponentMeta<typeof HiddenFileUploader>;

const ValidUploaderTemplate: ComponentStory<typeof HiddenFileUploader> = (args) => (
	<HiddenFileUploader onChange={() => alert("file uploaded")} {...args}>
		<DashedContainer>I can be the trigger</DashedContainer>
	</HiddenFileUploader>
);
export const ValidUploader = ValidUploaderTemplate.bind({});

const InvalidUploaderTemplate: ComponentStory<typeof HiddenFileUploader> = (args) => (
	<HiddenFileUploader onChange={() => {}} {...args}>
		<Button variant="contained" style={{ margin: '0' }}>
			I&nbsp;<i>CANNOT</i>&nbsp;be the trigger
		</Button>
		<br />
		<a
			href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#accessibility_concerns"
			target="_blank"
		>
			<u>Same goes for me, I am an achor</u>
		</a>
	</HiddenFileUploader>
);
export const InvalidUploader = InvalidUploaderTemplate.bind({});
