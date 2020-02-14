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

import { GhostElement } from '../../../../../components/screenshotDialog/components/editableText/editableText.styles';
import { TextField } from '../../../../../components/textField/textField.component';
import { ExpandAction } from '../riskDetails/riskDetails.styles';

interface IProps {
	value: string;
	disableExpandable: boolean;
}

export const ExpandableTextField: React.FunctionComponent<IProps> = ({ value, disableExpandable = true, ...props }) => {
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const ghostElementRef = React.useRef<HTMLPreElement>(null);
	const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
	const [isLongContent, setIsLongContent] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (textareaRef && ghostElementRef) {
			const height = ghostElementRef.current.offsetHeight;

			if (height > 48 && !isLongContent) {
				setIsLongContent(true);
			} else if (height <= 48 && isLongContent) {
				setIsLongContent(false);
			}
		}
	}, [value]);

	const isExpandable = isLongContent && !disableExpandable;

	const handleOnExpand = () => setIsExpanded(!isExpanded);

	const renderHelperText = React.useCallback(() => {
		if (isExpandable) {
			return <ExpandAction onClick={handleOnExpand}>{isExpanded ? 'Less' : 'More'}</ExpandAction>;
		}

		return null;
	}, [isExpandable, isExpanded]);

	const additionalProps = React.useCallback(() => {
		if (isExpandable) {
			return {
				rowsMax: isExpanded ? null : 3,
				helperText: renderHelperText()
			};
		}

		return {};
	}, [isExpandable, isExpanded]);

	return (
		<>
			<TextField
				{...props}
				value={value}
				inputRef={textareaRef}
				{...additionalProps()}
			/>
			<GhostElement ref={ghostElementRef}>
				{value}
			</GhostElement>
		</>
	);
};
