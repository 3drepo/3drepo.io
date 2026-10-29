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
const ZERO_WIDTH_SPACE = '\u200B';


export const createMentionElement = (name: string, id: string, isUnknown = false) => {
	const mentionElement = document.createElement('span');
	mentionElement.dataset.mention = 'true';
	mentionElement.dataset.mentionName =  ZERO_WIDTH_SPACE + name + ZERO_WIDTH_SPACE;
	mentionElement.dataset.mentionId = id;
	mentionElement.dataset.mention = 'true';
	mentionElement.appendChild(document.createTextNode(ZERO_WIDTH_SPACE));

	if (isUnknown) mentionElement.dataset.unknownMention = 'true';
	const mentionName = document.createElement('span');
	mentionName.textContent = name;
	mentionElement.appendChild(mentionName);
	mentionElement.appendChild(document.createTextNode(ZERO_WIDTH_SPACE));
	return mentionElement;
};


export const undoMentionElements = (editor: HTMLElement) => {
	const mentions = Array.from(editor.querySelectorAll('[data-mention-id]')) as HTMLElement[];
	mentions.forEach((mention) => {
		if (mention.innerText !== mention.dataset.mentionName) {
			mention.replaceWith(document.createTextNode(mention.innerText));
		}
	});
};