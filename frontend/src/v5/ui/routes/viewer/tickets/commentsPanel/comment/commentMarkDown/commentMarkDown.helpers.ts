/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { IComment } from '@/v5/store/tickets/tickets.types';

export type Metadata = {
	author: string,
	referenceId: string,
	reply: string,
};

const extractMetadataValue = (comment: string, metadataName: keyof Metadata) => {
	// @ts-ignore
	const regex = new RegExp(`\\[${metadataName}\\]:- "([^\"]*)"\\n`);
	return regex.exec(comment)?.[1] || '';
};

export const extractMetadata = (comment: string): Metadata => ({
	author: extractMetadataValue(comment, "author"),
	referenceId: extractMetadataValue(comment, "referenceId"),
	reply: extractMetadataValue(comment, "reply"),
});

export const extractComment = (comment: string) => comment.replaceAll(/\[[a-zA-Z]*\]:- ".*"\n[\n]?/g, "");

export const parseComment = (comment: string) => comment.replaceAll('"', '&#34;').replaceAll("\n", "<br />");
export const stringifyComment = (comment: string) => comment.replaceAll('&#34;', '"').replaceAll("<br />", "\n");

const createMetadataValue = (metadataName: keyof Metadata, metadataValue: string) => (
	`[${metadataName}]:- "${metadataValue}"\n`
);

const createMetadata = ({ author, _id, comment }: Partial<IComment>) => {
	const reply = extractComment(comment);
	const metadata = [
		createMetadataValue("author", author),
		createMetadataValue("referenceId", _id),
		createMetadataValue("reply", reply),
	];
	return metadata.join("");
};

export const addReply = (comment: Partial<IComment>, newComment: string) => `${createMetadata(comment)}\n${newComment}`;

export const updateComment = (metadata: Metadata, newComment: string) => {
	const comment: Partial<IComment> = {
		author: metadata.author,
		_id: metadata.referenceId,
		comment: metadata.reply,
	};
	return addReply(comment, newComment);
};
