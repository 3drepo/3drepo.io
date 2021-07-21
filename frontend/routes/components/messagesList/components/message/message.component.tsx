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

import { SystemMessage } from './components/systemMessage/systemMessage.component';
import { UserMessage } from './components/userMessage/userMessage.component';
import { Container } from './message.styles';

interface IProps {
	comment: string;
	commentWithMarkdown: string;
	viewpoint: any;
	created: number;
	owner: string;
	action: any;
	companyName: string;
	userName: string;
	teamspace: string;
	guid: string;
	sealed: boolean;
	index: number;
	currentUser: string;
	property: string;
	formRef?: any;
	commentRef?: any;
	removeMessage: (index, guid) => void;
	setCameraOnViewpoint: (viewpoint) => void;
}

export const Message = ({
	viewpoint, setCameraOnViewpoint, action, owner, comment, commentWithMarkdown,
	removeMessage, created, teamspace, ...props
}: IProps) => {

	const isSystemMessage = Boolean(action);

	const isMessageOwner = props.currentUser === owner;

	const isRemovable = !props.sealed && !isSystemMessage && isMessageOwner;

	const handleClick = () => {
		if (viewpoint && viewpoint.up) {
			setCameraOnViewpoint({ viewpoint });
		}
	};

	return (
		<>
			{isSystemMessage
				? <SystemMessage
					created={created}
					comment={commentWithMarkdown}
					propertyName={action.property}
					teamspace={teamspace} />
				: <Container onClick={handleClick} clickable={Boolean(viewpoint)}>
						<UserMessage
							name={owner}
							self={isMessageOwner}
							index={props.index}
							guid={props.guid}
							created={created}
							teamspace={teamspace}
							formRef={props.formRef}
							commentRef={props.commentRef}
							comment={comment}
							commentWithMarkdown={commentWithMarkdown}
							viewpoint={viewpoint}
							removeMessage={removeMessage}
							isRemovable={isRemovable}
						/>
					</Container>
			}
		</>
	);
};
