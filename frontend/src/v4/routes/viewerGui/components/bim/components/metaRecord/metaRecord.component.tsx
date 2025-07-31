/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { useState, useEffect } from 'react';

import { isNil, isNumber } from 'lodash';
import MoreIcon from '@mui/icons-material/ChevronRight';
import LessIcon from '@mui/icons-material/ExpandMore';

import { sortMetadata } from '@/v4/helpers/bim';
import { StarIcon } from '@/v4/routes/components/starIcon/starIcon.component';
import { BimTooltip, StarIconWrapper, StyledCopyIcon, StyledSelectSimilarIcon } from '../metaRecord/metaRecord.styles';
import { List, Title, Data, Header, Value, Actions, StyledIconButton } from './metaRecord.styles';

export interface IMetaData {
	key?: string;
	value?: string;
	categories?: string[];
}

interface IProps {
	name: string;
	data: IMetaData;
	nested?: boolean;
	starredMetaMap?: any;
	toggleStarredRecord?: (key, isStarred) => void;
	selectAllSimilar?: (rules) => void;
	copyRules?: (rules) => void;
	showStarred: boolean;
	isSearch: boolean;
}

const CollapseButton = ({ collapsed, onClick }) => (
	<StyledIconButton onClick={onClick}>
		{collapsed ? <MoreIcon /> : <LessIcon />}
	</StyledIconButton>
);

const renderNestedMetadata = (metadata, render) => Object.entries(metadata).sort(sortMetadata).map(render);

const Starred = ({ data, starredMetaMap, toggleStarredRecord }) => {
	const { key } = data;
	const isStarred = Boolean(starredMetaMap[key]);

	return (
		<StarIconWrapper>
			<StarIcon
				active={isStarred}
				onClick={toggleStarredRecord(key, isStarred)}
			/>
		</StarIconWrapper>
	);
};

const MetaRecordData = ({ value, field, copyRules, selectAllSimilar }) => {
	const rules = [{
		name: `Field: IS ${field} Operator: ${isNumber(value) ? 'EQUALS' : 'IS'} ${value}`,
		field: {
			operator: 'IS',
			values: [field],
		},
		operator: isNumber(value) ? 'EQUALS' : 'IS',
		values: [value],
	}];

	return (
		<Data>
			<Value>{`${value}`}</Value>
			<Actions>
				<BimTooltip title="Copy group filter to clipboard">
					<StyledIconButton onClick={() => copyRules(rules)}>
						<StyledCopyIcon />
					</StyledIconButton>
				</BimTooltip>
				<BimTooltip title="Select elements with same parameter value">
					<StyledIconButton onClick={() => selectAllSimilar(rules)}>
						<StyledSelectSimilarIcon />
					</StyledIconButton>
				</BimTooltip>
			</Actions>
		</Data>
	);
};

export const MetaRecord = (props: IProps) => {
	const { name, data, copyRules, selectAllSimilar, starredMetaMap, toggleStarredRecord, showStarred, isSearch } = props;
	const [collapsed, setCollapsed] = useState<boolean>(true);
	const hasSubData = isNil(data.value);

	useEffect(() => {
		const forceCollapsed = showStarred || isSearch;
		setCollapsed(!forceCollapsed);
	}, [showStarred, isSearch]);

	const toggleCollapse = () => setCollapsed(!collapsed);

	const renderSubList = () => (
		<List>
			{!collapsed && renderNestedMetadata(data, ([index, item]) => (
				<MetaRecord
					key={index}
					name={index}
					data={item}
					copyRules={copyRules}
					selectAllSimilar={selectAllSimilar}
					starredMetaMap={starredMetaMap}
					toggleStarredRecord={toggleStarredRecord}
					showStarred={showStarred}
					isSearch={isSearch}
				/>
			)) as any}
		</List>
	);


	return (
		<>
			<Header section={hasSubData}>
				{hasSubData && <CollapseButton collapsed={collapsed} onClick={toggleCollapse} />}
				{!hasSubData && <Starred
					data={data}
					starredMetaMap={starredMetaMap}
					toggleStarredRecord={toggleStarredRecord}
				/>}
				<Title>{name || 'Unnamed'}</Title>
				{!hasSubData && <MetaRecordData
					field={data.key}
					value={data.value}
					copyRules={copyRules}
					selectAllSimilar={selectAllSimilar}
				/>}
			</Header>
			{hasSubData && renderSubList()}
		</>
	);
};
