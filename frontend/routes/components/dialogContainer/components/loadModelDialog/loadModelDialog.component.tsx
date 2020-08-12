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

import { Container } from './loadModelDialog.styles';
import ViewsList from './viewsList/viewsList.container';

interface IProps {
	className?: string;
	fetchModelSettings: (teamspace: string, modelId: string) => void;
	searchEnabled: boolean;
	searchQuery: string;
	teamspace: string;
	modelId: string;
	handleClose: () => void;
}

export const LoadModelDialog = ({ teamspace, modelId, handleClose, ...props }: IProps) => {
	React.useEffect(() => {
		props.fetchModelSettings(teamspace, modelId);
	}, [teamspace, modelId]);

	return (
		<Container>
			<ViewsList teamspace={teamspace} modelId={modelId} />
		</Container>
	);
};
