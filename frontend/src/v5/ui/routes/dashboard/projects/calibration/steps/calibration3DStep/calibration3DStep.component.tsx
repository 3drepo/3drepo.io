/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { ContainerRevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { BasicStep } from '../basicStep.component';

export const Calibration3DStep = () => {
	const { containerOrFederation, teamspace, project } = useParams<ViewerParams>();
	const isFed = modelIsFederation(containerOrFederation);

	useEffect(() => {
		if (!containerOrFederation || isFed) return;
		ContainerRevisionsActionsDispatchers.fetch(teamspace, project, containerOrFederation);
	}, [containerOrFederation]);

	return <BasicStep text="3d calibration" />;
};