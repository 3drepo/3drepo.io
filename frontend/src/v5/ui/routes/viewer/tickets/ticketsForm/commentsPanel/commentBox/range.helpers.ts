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

export const getSelectionTextOffset = (editor: HTMLElement, node: Node, offset: number) => {
	const range = document.createRange();
	range.selectNodeContents(editor);
	range.setEnd(node, offset);
	return range.toString().length;
};

const getTextNodeAtOffset = (editor: HTMLElement, offset: number): [Node, number] => {
	const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();
	let remaining = offset;

	while (node) {
		const length = node.textContent?.length || 0;
		if (remaining <= length) return [node, remaining];
		remaining -= length;
		node = walker.nextNode();
	}

	return [editor, editor.childNodes.length];
};

export const restoreSelection = (editor: HTMLElement, startOffset: number, endOffset: number) => {
	const selection = window.getSelection();
	if (!selection) return;

	const [startNode, startNodeOffset] = getTextNodeAtOffset(editor, startOffset);
	const [endNode, endNodeOffset] = getTextNodeAtOffset(editor, endOffset);
	const range = document.createRange();
	range.setStart(startNode, startNodeOffset);
	range.setEnd(endNode, endNodeOffset);
	selection.removeAllRanges();
	selection.addRange(range);
};

export const restoreMessageSelection = (editor: HTMLElement, offset: number) => {
	const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();
	let remaining = offset;

	while (node) {
		const textLength = node.textContent?.length || 0;
		const mention = (node.parentElement?.closest('[data-mention-id]') as HTMLElement | null);
		const messageLength = mention ? `@${mention.dataset.mentionId}`.length : textLength;

		if (remaining <= messageLength) {
			const displayOffset = mention && remaining === messageLength
				? textLength
				: Math.min(remaining, textLength);
			restoreSelection(editor, 0, 0);
			const selection = window.getSelection();
			if (!selection) return;
			const range = document.createRange();
			range.setStart(node, displayOffset);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);
			return;
		}

		remaining -= messageLength;
		node = walker.nextNode();
	}

	restoreSelection(editor, editor.innerText.length, editor.innerText.length);
};

export const getCaretCharacterIndex = (element: HTMLElement): number => {
	const selection = window.getSelection();
	if (!selection?.rangeCount || !selection.anchorNode || !element.contains(selection.anchorNode)) {
		return element.innerText.length;
	}

	const range = selection.getRangeAt(0).cloneRange();
	range.selectNodeContents(element);
	range.setEnd(selection.anchorNode, selection.anchorOffset);
	return range.toString().length;
};
