/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { useParams } from 'react-router-dom';
import { IProject } from '@/v5/store/projects/projects.types';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { projectRoute } from '@/v5/services/routing/routing';
import { formatMessage } from '@/v5/services/intl';
import { ShareModal } from '../shareModal.component';

type IShareModalProject = {
	openState: boolean;
	title: string;
	project: IProject;
	onClickClose: () => void;
};

export const ShareModalProject = ({ project, ...props }: IShareModalProject) => {
	const { teamspace } = useParams<DashboardParams>();
	const link = projectRoute(teamspace, project, true);
	const subject = formatMessage({ id: 'shareModal.project.subject', defaultMessage: 'project' });

	return <ShareModal subject={subject} link={link} {...props} name={project.name} />;
};
