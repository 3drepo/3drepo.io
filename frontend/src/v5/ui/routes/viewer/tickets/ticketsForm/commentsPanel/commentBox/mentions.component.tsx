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

import { useEffect, useRef, useState } from 'react';
import { Popper } from '@mui/material';
import { MentionsListComponent } from './mentionsList/mentionsList.component';
import { VirtualElement } from '@popperjs/core';
import { getCaretCharacterIndex, getSelectionTextOffset, lastRangeForString, restoreSelection } from './range.helpers';
import { UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { getFullnameFromUser } from '@/v5/store/users/users.helpers';
import { UNKNOWN_USER } from '@/v4/helpers/user.helpers';
import { createMentionElement, undoMentionElements } from './mentionsHelper';

export const getMessageValue = (editor: HTMLElement) => {
	const editorCopy = editor.cloneNode(true) as HTMLElement;
	const mentions = editorCopy.querySelectorAll('[data-mention-id]') as NodeListOf<HTMLElement>;
	mentions.forEach((mention) => {
		mention.replaceWith(document.createTextNode(`@${mention.dataset.mentionId}`));
	});
	return editorCopy.innerText;
};

const renderMessage = (editor: HTMLElement, message: string, users) => {
	editor.textContent = '';
	const fragment = document.createDocumentFragment();
	const mentionPattern = /(^|[^\w@])@([^\s@]+)/g;
	let lastIndex = 0;
	let match = mentionPattern.exec(message);

	while (match) {
		const mentionId = match[2];
		const mention = users.find(({ user }) => user === mentionId);
		const mentionName = mention ? getFullnameFromUser(mention) : UNKNOWN_USER;
		fragment.append(message.slice(lastIndex, match.index));
		fragment.append(match[1]);
		fragment.append(createMentionElement(mentionName, mentionId, !mention));
		lastIndex = match.index + match[0].length;
		match = mentionPattern.exec(message);
	}

	fragment.append(message.slice(lastIndex));
	editor.append(fragment);
};

export const MentionsComponent = ({ editorRef, message, onMessageChange }) => {
	const { teamspace } = useParams<ViewerParams>();
	const users = UsersHooksSelectors.selectUsersByTeamspace(teamspace);
	// Keep the range immediately before the query so selecting a mention can replace it without traversing editor nodes.
	const mentionStartRangeRef = useRef<Range | null>(null);
	const [mentionAnchor, setMentionAnchor] = useState<VirtualElement | null>(null);
	const [mentionQuery, setMentionQuery] = useState('');

	const closeMentionPopup = () => {
		setMentionAnchor(null);
		setMentionQuery('');
		mentionStartRangeRef.current = null;
	};

	const handleMessageKeyDown = (event) => {
		if (!mentionAnchor) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			closeMentionPopup();
			return;
		}
	};

	const handleMention = ({ name, id }: { name: string; id: string }) => {
		const editor = editorRef.current;
		if (!editor) return;
		const selection = window.getSelection();
		const mentionStartRange = mentionStartRangeRef.current;
		if (!selection?.rangeCount || !mentionStartRange) return;
		const range = mentionStartRange.cloneRange();
		const caretRange = selection.getRangeAt(0);
		range.setEnd(caretRange.startContainer, caretRange.startOffset);
		range.deleteContents();
		const mentionElement = createMentionElement(name, id);
		range.insertNode(mentionElement);
		const trailingSpace = document.createTextNode('\u0020');
		mentionElement.after(trailingSpace);
		range.setStart(trailingSpace, trailingSpace.length);
		range.collapse(true);
		selection.removeAllRanges();
		selection.addRange(range);
		closeMentionPopup();
		editor.focus();
	};

	const handleMessageInput = (ev?) => {
		const editor = editorRef.current;
		if (!editor) return;
    
		const mentions = Array.from(editor.querySelectorAll('[data-mention-id]')) as HTMLElement[];
    
		if (ev?.inputType.includes('delete')) {
			mentions.forEach((mention) => {
				if (mention.innerText !== mention.dataset.mentionName) {
					mention.remove();
				}
			});
		} else {
			const selection = window.getSelection();
			const currentRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
			const startOffset = currentRange
				? getSelectionTextOffset(editor, currentRange.startContainer, currentRange.startOffset)
				: editor.innerText.length;
			const endOffset = currentRange
				? getSelectionTextOffset(editor, currentRange.endContainer, currentRange.endOffset)
				: startOffset;

			undoMentionElements(editor);
			restoreSelection(editor, startOffset, endOffset);
		}
    
		const messageValue = getMessageValue(editor);
		onMessageChange(messageValue);

		const editorText = editor.innerText;
		const caretPosition = getCaretCharacterIndex(editor);
		const textBeforeCaret = editorText.slice(0, caretPosition);
		const mentionStart = textBeforeCaret.lastIndexOf('@');
		const query = textBeforeCaret.slice(mentionStart + 1);
		const mentionPrefix = textBeforeCaret[mentionStart - 1];
		const isMention = textBeforeCaret[mentionStart] === '@'
			&& (mentionStart === 0 || !/[\w@]/.test(mentionPrefix || ''));
    
		if (!isMention ) {
			closeMentionPopup();
			return;
		}

		setMentionQuery(query);

		if (!mentionAnchor) {
			const anchorRange = lastRangeForString(editor, '@');
			setMentionAnchor({
				contextElement: editor,
				getBoundingClientRect: () => anchorRange.getBoundingClientRect(),
			});

			mentionStartRangeRef.current = anchorRange;
		}
	};

	useEffect(() => {
		if (!editorRef.current) return;

		const editor = editorRef.current;
		editor.addEventListener('keydown', handleMessageKeyDown);
		editor.addEventListener('click', closeMentionPopup);
		editor.addEventListener('blur', closeMentionPopup);
		editor.addEventListener('input', handleMessageInput); 

		return () => {
			editor.removeEventListener('keydown', handleMessageKeyDown);
			editor.removeEventListener('click', closeMentionPopup);
			editor.removeEventListener('blur', closeMentionPopup);
			editor.removeEventListener('input', handleMessageInput);
		};
	}, [editorRef.current, handleMessageKeyDown]);

	useEffect(() => {
		if (editorRef.current) renderMessage(editorRef.current, message, users);
	}, [message, users, editorRef.current]);

	return (
		<Popper
			open={!!mentionAnchor}
			anchorEl={mentionAnchor}
			placement="bottom-start"
			sx={{ zIndex: 1500 }}
			modifiers={[
				{ name: 'offset', options: { offset: [0, 6] } },
				{ name: 'flip', options: { padding: 8 } },
				{ name: 'preventOverflow', options: { padding: 8 } },
			]}
		>
			<MentionsListComponent query={mentionQuery} onMention={handleMention} />
		</Popper>
	);
};