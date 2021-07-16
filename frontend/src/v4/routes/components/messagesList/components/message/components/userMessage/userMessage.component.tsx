/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import { Footer } from '../footer/footer.component';
import { RemoveButton } from '../removeButton/removeButton.component';
import { Screenshot } from '../screenshot/screenshot.component';
import { UserMarker } from '../userMarker';
import { Comment, CommentContainer, Container } from './userMessage.styles';

interface IProps {
	index: number;
	guid: string;
	name: string;
	created: number;
	formRef?: any;
	commentRef?: any;
	teamspace: string;
	comment: string;
	commentWithMarkdown: string;
	viewpoint: any;
	removeMessage: (index, guid) => void;
	isRemovable: boolean;
	self: boolean;
}

export const UserMessage = ({
	name, commentWithMarkdown, index, guid, removeMessage, created, viewpoint, ...props
}: IProps) => {

	const isScreenshot = viewpoint && viewpoint.screenshotPath;

	const handleRemoveMessage = () => removeMessage(index, guid);

	return (
		<Container>
			<UserMarker name={name} />
			<CommentContainer self={props.self}>
				{isScreenshot && <Screenshot comment={commentWithMarkdown} viewpoint={viewpoint} />}
				<Comment teamspace={props.teamspace}>{commentWithMarkdown}</Comment>
				<Footer
					name={name}
					formRef={props.formRef}
					commentRef={props.commentRef}
					created={created}
					comment={props.comment}
					viewpoint={viewpoint}
				/>
			</CommentContainer>
			{props.isRemovable && <RemoveButton index={index} guid={guid} removeMessage={handleRemoveMessage} />}
		</Container>
	);
};
