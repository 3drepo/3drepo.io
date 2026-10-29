/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { type ClipboardEvent, RefObject, useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { MessageInput, ShowMoreButton } from './commentBox.styles';

const COMMENT_BOX_HEIGHT = 80;

interface ExpandableMessageInputProps {
	editorRef: RefObject<HTMLDivElement | null>,
	onPaste: (event: ClipboardEvent<HTMLDivElement>) => void,
	message: string,
}

export const ExpandableMessageInput = ({
	editorRef,
	onPaste,
	message,
}: ExpandableMessageInputProps) => {
	const [autoHeight, setAutoHeight] = useState(false);
	const [canCollapse, setCanCollapse] = useState(false);
	const calculateCanCollapse = useCallback(() => {
		if (!editorRef.current) return;
		const newCanCollapse = editorRef.current.scrollHeight > COMMENT_BOX_HEIGHT;
		if (!newCanCollapse) setAutoHeight(false);
		setCanCollapse(newCanCollapse);
	}, [editorRef]);

	useEffect(() => {
		const frame = requestAnimationFrame(calculateCanCollapse);
		return () => cancelAnimationFrame(frame);
	}, [calculateCanCollapse, message]);

	return (
		<>
			<MessageInput
				contentEditable
				$autoHeight={autoHeight}
				$canCollapse={canCollapse}
				role="textbox"
				aria-multiline="true"
				data-placeholder={formatMessage({
					id: 'customTicket.comments.leaveAComment',
					defaultMessage: 'Leave a comment',
				})}
				suppressContentEditableWarning
				ref={editorRef}
				onPaste={(event) => {
					onPaste(event);
					calculateCanCollapse();
				}}
				onInput={calculateCanCollapse}
			>
				{message}
			</MessageInput>

			{canCollapse && (
				<ShowMoreButton
					type="button"
					onClick={() => setAutoHeight(!autoHeight)}
					onBlur={(event) => event.stopPropagation()}
				>
					{!autoHeight
						? <FormattedMessage id="textarea.showMore" defaultMessage="Show more" />
						: <FormattedMessage id="textarea.showLess" defaultMessage="Show less" />
					}
				</ShowMoreButton>
			)}
		</>
	);
};
