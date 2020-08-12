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

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import { renderWhenTrue } from '../../../../../helpers/rendering';
import { LOAD_MODEL_TABS, MODEL_CONFIGURATIONS_TAB, SAVED_VIEWS_TAB } from './loadModelDialog.constants';
import { Container, TabContent } from './loadModelDialog.styles';
import ModelConfiguration from './modelConfiguration/modelConfiguration.container';
import ViewsList from './viewsList/viewsList.container';

interface IProps {
	className?: string;
	fetchModelSettings: (teamspace: string, modelId: string) => void;
	teamspace: string;
	modelId: string;
	handleClose: () => void;
	isFederation: boolean;
}

const getRenderSavedViewsTab = ({ ...props }) => renderWhenTrue(<ViewsList {...props} />);

const getRenderModelConfigurationsTab = ({ ...props }) => renderWhenTrue(<ModelConfiguration {...props} />);

export const LoadModelDialog = ({ teamspace, modelId, handleClose, ...props }: IProps) => {
	const [activeTab, setActiveTab] = React.useState(SAVED_VIEWS_TAB);

	React.useEffect(() => {
		props.fetchModelSettings(teamspace, modelId);
	}, [teamspace, modelId]);

	const renderSavedViewsTab = React.useMemo(() => {
		return getRenderSavedViewsTab({ teamspace, modelId });
	}, [teamspace, modelId]);

	const renderModelConfigurationsTab = React.useMemo(() => {
		return getRenderModelConfigurationsTab({ teamspace, modelId, handleClose });
	}, [teamspace, modelId, handleClose]);

	const handleTabChange = (event, tab) => setActiveTab(tab);

	return (
		<Container>
			<Tabs
				value={activeTab}
				indicatorColor="primary"
				textColor="primary"
				fullWidth
				onChange={handleTabChange}
			>
				<Tab label={LOAD_MODEL_TABS.SAVED_VIEWS} value={SAVED_VIEWS_TAB} />
				{props.isFederation && <Tab label={LOAD_MODEL_TABS.MODEL_CONFIGURATIONS} value={MODEL_CONFIGURATIONS_TAB} />}
			</Tabs>
			<TabContent>
				{renderSavedViewsTab(activeTab === SAVED_VIEWS_TAB)}
				{renderModelConfigurationsTab(activeTab === MODEL_CONFIGURATIONS_TAB && props.isFederation )}
			</TabContent>
		</Container>
	);
};
