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
import { isEmpty } from 'lodash';
import { forOwn, pick, uniq } from 'lodash';

import { LabelButton } from '../../../../viewerGui/components/labelButton/labelButton.styles';
import { EmptyStateInfo } from '../../../components.styles';
import { CellSelect } from '../../../customTable/components/cellSelect/cellSelect.component';
import {
	Container, Label, StyledDialogContent, StyledGrid, StyledList, StyledListItem, StyledTypography,
} from './suggestedTreatmentsDialog.styles';
import { SuggestionDetails } from './suggestionDetails/suggestionDetails.component';

const MITIGATION_PROPERTIES = ['mitigation_desc', 'mitigation_detail', 'mitigation_stage', 'mitigation_type'];

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

const SuggestionsList = ({ suggestions, onClick }) => (
	<StyledList dense>
		{suggestions.map((suggestion, index) => (
			<StyledListItem key={index} disableGutters divider>
				<ListItemText
					primary={suggestion.mitigation_desc}
					secondary={<SuggestionDetails {...suggestion} />}
					secondaryTypographyProps={{
						component: 'div',
					}}
				/>
				<ListItemSecondaryAction>
					<LabelButton onClick={() => onClick(suggestion)}>Select</LabelButton>
				</ListItemSecondaryAction>
			</StyledListItem>
		))}
	</StyledList>
);

const getStageOptions = (suggestions) => [{ value: '', name: 'All' }, ...uniq(suggestions
		.map(({ mitigation_stage }) => mitigation_stage).filter(Boolean))
		.map((value) => ({ value, name: value }))];

const getTypeOptions = (suggestions) => [{ value: '', name: 'All' }, ...uniq(suggestions
		.map(({ mitigation_type }) => mitigation_type).filter(Boolean))
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
		const mitigationProperties = pick(suggestion, MITIGATION_PROPERTIES);
		forOwn(mitigationProperties, (value, key) => setFieldValue(key, value));
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
				<Label container justify="flex-end" alignItems="center">
					<TextWrapper>
						Stage:&nbsp;
					</TextWrapper>
				</Label>
				<Grid item xs={4}>
					<CellSelect
						value={stage}
						items={getStageOptions(suggestions)}
						onChange={handleStageChange}
					/>
				</Grid>
				<Label container justify="flex-end" alignItems="center">
					<TextWrapper>
						Type:&nbsp;
					</TextWrapper>
				</Label>
				<Grid item xs={4}>
					<CellSelect
						value={type}
						items={getTypeOptions(suggestions)}
						onChange={handleTypeChange}
					/>
				</Grid>
			</StyledGrid>
			<StyledDialogContent>
				{!isEmpty(suggestions) && <SuggestionsList suggestions={getSuggestions} onClick={handleClick} />}
				{isEmpty(suggestions) && <EmptyStateInfo>No suggestion found</EmptyStateInfo>}
			</StyledDialogContent>
		</Container>
	);
};
