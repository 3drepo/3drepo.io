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

import Grid from '@material-ui/core/Grid';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { Description, ExpandButton, StyledTypography, TextContainer } from '../suggestedTreatmentsDialog.styles';

interface ITextWrapper {
	noWrap?: boolean;
	inline?: boolean;
	color?: string;
	variant?: string;
}

const TextWrapper: React.FunctionComponent<ITextWrapper> = ({
	children, color = 'textPrimary', variant = 'caption', inline, ...props
}) => (
	<StyledTypography component="span" inline={inline ? 1 : 0} variant={variant} color={color} {...props}>
		{children}
	</StyledTypography>
);

interface ISuggestionDetails {
	mitigation_details: string;
	mitigation_stage: string;
	mitigation_type: string;
}

export const SuggestionDetails: React.FunctionComponent<ISuggestionDetails> = ({
	mitigation_details, mitigation_stage, mitigation_type
}) => {
	const textRef = React.useRef<HTMLSpanElement>(null);
	const [expandable, setExpandable] = React.useState<boolean>(false);
	const [expanded, setExpanded] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (textRef.current) {
			const height = textRef.current.offsetHeight;

			if (height > 16 && !expandable) {
				setExpandable(true);
			} else if (height <= 16 && expandable) {
				setExpandable(false);
			}
		}
	}, [textRef.current]);

	const handleExpand = () => setExpanded(!expanded);

	const additionalProps = React.useCallback(() => {
		if (expandable && !expanded) {
			return {
				style: {
					height: '17px',
				},
			};
		}

		return {};
	}, [expandable, expanded]);

	const renderExpandableText = renderWhenTrue(() => (
		<ExpandButton onClick={handleExpand}>{expanded ? 'Less' : 'More'}</ExpandButton>
	));

	return (
		<Grid container>
			<TextContainer item xs={12}>
				<Description ref={textRef} {...additionalProps()}>
					{mitigation_details}
				</Description>
				{renderExpandableText(expandable)}
			</TextContainer>
			<TextContainer item xs={4} zeroMinWidth>
				<TextWrapper noWrap>
					Stage:&nbsp;
					<TextWrapper inline color="textSecondary">
						{mitigation_stage}
					</TextWrapper>
				</TextWrapper>
			</TextContainer>
			<Grid item xs={4}>
				<TextWrapper noWrap>
					Type:&nbsp;
					<TextWrapper inline color="textSecondary">
						{mitigation_type}
					</TextWrapper>
				</TextWrapper>
			</Grid>
		</Grid>
	);
};
