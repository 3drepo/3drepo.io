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
import { Popper } from '../../ticketGroups/ticketGroups.styles';
import { MENTION_USERS, MentionsListComponent } from './mentionsList/mentionsList.component';
import { VirtualElement } from '@popperjs/core';
import { getCaretCharacterIndex, getSelectionTextOffset, restoreSelection } from './range.helpers';

const getMessageValue = (editor: HTMLElement) => {
	const editorCopy = editor.cloneNode(true) as HTMLElement;
	const mentions = editorCopy.querySelectorAll('[data-mention-id]') as NodeListOf<HTMLElement>;
	mentions.forEach((mention) => {
		mention.replaceWith(document.createTextNode(`@${mention.dataset.mentionId}`));
	});
	return editorCopy.innerText;
};

const renderMessage = (editor: HTMLElement, message: string) => {
	editor.textContent = '';
	const fragment = document.createDocumentFragment();
	const mentionPattern = /@(\S+)/g;
	let lastIndex = 0;
	let match = mentionPattern.exec(message);

	while (match) {
		const mentionId = match[1];
		const mention = MENTION_USERS.find(({ id }) => id === mentionId);
		if (mention) {
			fragment.append(message.slice(lastIndex, match.index));
			const mentionElement = document.createElement('span');
			mentionElement.dataset.mentionName = mention.name;
			mentionElement.dataset.mentionId = mention.id;
			mentionElement.dataset.mention = 'true';
			mentionElement.textContent = mention.name;
			fragment.append(mentionElement);
			lastIndex = match.index + match[0].length;
		}
		match = mentionPattern.exec(message);
	}

	fragment.append(message.slice(lastIndex));
	editor.append(fragment);
};

export const MentionsComponent = ({ editorRef, message, onMessageChange }) => {
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
		const mentionElement = document.createElement('span');
		mentionElement.dataset.mentionName = name;
		mentionElement.dataset.mentionId = id;
		mentionElement.dataset.mention = 'true';
		mentionElement.textContent = name;
		range.insertNode(mentionElement);
		const trailingSpace = document.createTextNode(' ');
		mentionElement.after(trailingSpace);
		range.setStart(trailingSpace, trailingSpace.length);
		range.collapse(true);

		selection.removeAllRanges();
		selection.addRange(range);

		onMessageChange(getMessageValue(editor));
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
    
			mentions.forEach((mention) => {
				if (mention.innerText !== mention.dataset.mentionName) {
					mention.replaceWith(document.createTextNode(mention.innerText));
				}
			});
    
			restoreSelection(editor, startOffset, endOffset);
		}
    
		const messageValue = getMessageValue(editor);
		onMessageChange(messageValue);
		const editorText = editor.innerText;
		const caretPosition = getCaretCharacterIndex(editor);
		const textBeforeCaret = editorText.slice(0, caretPosition);
		const currentToken = textBeforeCaret.split(/\s/).pop() || '';
		const mentionStart = textBeforeCaret.lastIndexOf('@');
		const tokenStart = textBeforeCaret.length - currentToken.length;
		const query = textBeforeCaret.slice(mentionStart + 1);
    
		if (mentionStart < tokenStart) {
			closeMentionPopup();
			return;
		}
    
		if (textBeforeCaret[mentionStart] === '@' && !mentionAnchor) {
			const currentSelection = window.getSelection();
			if (!currentSelection?.rangeCount) return;
			const anchorRange = currentSelection.getRangeAt(0).cloneRange();
			const mentionStartRange = anchorRange.cloneRange();
			if (mentionStartRange.startContainer.nodeType === Node.TEXT_NODE && mentionStartRange.startOffset > 0) {
				mentionStartRange.setStart(mentionStartRange.startContainer, mentionStartRange.startOffset - 1);
				mentionStartRange.collapse(true);
				mentionStartRangeRef.current = mentionStartRange;
			}
			setMentionQuery(query);
			setMentionAnchor({
				contextElement: editor,
				getBoundingClientRect: () => anchorRange.getBoundingClientRect(),
			});
		} else if (textBeforeCaret[mentionStart] === '@') {
			setMentionQuery(query);
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
		if (editorRef.current) renderMessage(editorRef.current, message);
	}, [message]);

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