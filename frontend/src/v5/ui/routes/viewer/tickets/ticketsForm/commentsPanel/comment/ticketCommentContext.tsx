/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { getRelativeTime } from '@/v5/helpers/intl.helper';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { extractMetadata, stripMetadata } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { ITicketComment, TicketCommentReplyMetadata } from '@/v5/store/tickets/comments/ticketComments.types';
import { createContext, useEffect, useState } from 'react';

export type TicketCommentContextType = ITicketComment & {
	isFirstOfBlock: boolean,
	isCurrentUser: boolean,
	commentAge: string,
	metadata?: TicketCommentReplyMetadata,
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
	onEdit: (commentId, newMessage, newImages) => void;
};

const defaultValue: TicketCommentContextType = {
	updatedAt: null,
	createdAt: null,
	author: '',
	message: '',
	metadata: null,
	commentAge: '',
	deleted: false,
	_id: '',
	images: [],
	isFirstOfBlock: false,
	isCurrentUser: false,
	onDelete: () => {},
	onReply: () => {},
	onEdit: () => {},
};
export const TicketCommentContext = createContext(defaultValue);
TicketCommentContext.displayName = 'TicketCommentContext';

export type TicketCommentContextProps = ITicketComment & {
	isFirstOfBlock: boolean,
	children?: any,
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
	onEdit: (commentId, newMessage, newImages) => void;
};

export const TicketCommentContextComponent = ({ 
	updatedAt,
	createdAt,
	author,
	message = '',
	deleted,
	images = [],
	children,
	...props
}: TicketCommentContextProps) => {
	const [commentAge, setCommentAge] = useState('');

	const isCurrentUser = CurrentUserHooksSelectors.selectUsername() === author;
	const metadata = extractMetadata(message);
	const noMetadataMessage = !deleted ? stripMetadata(message) : message;

	const updateMessageAge = () => setCommentAge(getRelativeTime(updatedAt || createdAt));

	useEffect(() => {
		updateMessageAge();
		const intervalId = window.setInterval(updateMessageAge, 10_000);
		return () => clearInterval(intervalId);
	}, [updatedAt]);

	return (
		<TicketCommentContext.Provider
			value={{
				updatedAt,
				createdAt,
				author,
				commentAge,
				metadata,
				message: noMetadataMessage,
				deleted,
				images,
				isCurrentUser,
				...props,
			}}
		>
			{children}
		</TicketCommentContext.Provider>
	);
};
