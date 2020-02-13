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
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import { forOwn, uniq } from 'lodash';

import { LabelButton } from '../../../../viewerGui/components/labelButton/labelButton.styles';
import { CellSelect } from '../../../customTable/components/cellSelect/cellSelect.component';
import {
	Container, StyledDialogContent, StyledGrid, StyledList, StyledListItem, StyledTypography,
} from './suggestedTreatmentsDialog.styles';

interface ITextWrapper {
	noWrap?: boolean;
	inline?: boolean;
	color?: string;
	variant?: string;
}

const TextWrapper: React.FunctionComponent<ITextWrapper> = ({
	children, color = 'textPrimary', variant = 'caption', ...props
}) => (
	<StyledTypography component="span" variant={variant} color={color} {...props}>
		{children}
	</StyledTypography>
);

const renderDetails = (suggestion) => (
	<Grid container>
		<Grid item xs={12} wrap="nowrap">
			<TextWrapper noWrap color="textSecondary">
				{suggestion.mitigation_details}
			</TextWrapper>
		</Grid>
		<Grid item xs={4} wrap="nowrap" zeroMinWidth>
			<TextWrapper noWrap>
				Stage:&nbsp;
				<TextWrapper inline color="textSecondary">
					{suggestion.mitigation_stage}
				</TextWrapper>
			</TextWrapper>
		</Grid>
		<Grid item xs={4}>
			<TextWrapper noWrap>
				Type:&nbsp;
				<TextWrapper inline color="textSecondary">
					{suggestion.mitigation_type}
				</TextWrapper>
			</TextWrapper>
		</Grid>
	</Grid>
);

const getStageOptions = (suggestions) => [{ value: '', name: 'All' }, ...uniq(suggestions
		.map(({ mitigation_stage }) => mitigation_stage))
		.map((value) => ({ value, name: value }))];

const getTypeOptions = (suggestions) => [{ value: '', name: 'All' }, ...uniq(suggestions
		.map(({ mitigation_type }) => mitigation_type))
		.map((value) => ({ value, name: value }))];

interface ISuggestion {
	mitigation_desc: string;
	mitigation_details: string;
	mitigation_stage: string;
	mitigation_type: string;
}

interface IProps {
	suggestions?: ISuggestion[];
	handleClose: () => void;
	setFieldValue?: (name: string, value: string) => void;
	handleSelect: () => void;
}

export const SuggestedTreatmentsDialog = ({ suggestions, setFieldValue, handleClose }: IProps) => {
	const [type, setType] = React.useState('');
	const [stage, setStage] = React.useState('');

	const handleClick = (suggestion) => {
		forOwn(suggestion, (value, key) => setFieldValue(key, value));
		handleClose();
	};

	const getSuggestions = React.useMemo(() => suggestions.filter((suggestion) => {
		const hasProperStage = stage ? suggestion.mitigation_stage === stage : true;
		const hasProperType = type ? suggestion.mitigation_type === type : true;

		return hasProperStage && hasProperType;
	}), [stage, type, suggestions]);

	const handleStageChange = (event, value) => {
		setStage(value);
	};

	const handleTypeChange = (event, value) => {
		setType(value);
	};

	return (
		<Container>
			<StyledGrid container>
				<Grid container justify="flex-end" alignItems="center" xs={1}>
					<TextWrapper>
						Stage:&nbsp;
					</TextWrapper>
				</Grid>
				<Grid item xs={4}>
					<CellSelect
						value={stage}
						items={getStageOptions(suggestions)}
						onChange={handleStageChange}
					/>
				</Grid>
				<Grid container justify="flex-end" alignItems="center" xs={1}>
					<TextWrapper>
						Type:&nbsp;
					</TextWrapper>
				</Grid>
				<Grid item xs={4}>
					<CellSelect
						value={type}
						items={getTypeOptions(suggestions)}
						onChange={handleTypeChange}
					/>
				</Grid>
			</StyledGrid>
			<StyledDialogContent>
				<StyledList dense>
					{getSuggestions.map((suggestion, index) => (
						<StyledListItem key={index} disableGutters divider>
							<ListItemText
								primary={suggestion.mitigation_desc}
								secondary={renderDetails(suggestion)}
							/>
							<ListItemSecondaryAction>
								<LabelButton onClick={() => handleClick(suggestion)}>Select</LabelButton>
							</ListItemSecondaryAction>
						</StyledListItem>
					))}
				</StyledList>
			</StyledDialogContent>
		</Container>
	);
};
