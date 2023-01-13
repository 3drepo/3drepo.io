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
import { FC, useEffect } from 'react';
import { Button, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { DialogContainer, Actions, Details, Status, WarningIcon } from '@/v5/ui/components/shared/modals/modals.styles';
import { AxiosError } from 'axios';
import { getErrorCode, getErrorMessage, getErrorStatus, isPathNotFound, isProjectNotFound, isResourceNotFound, isTeamspaceNotFound } from '@/v5/validation/errors.helpers';
import { generatePath, useHistory } from 'react-router';
import { DASHBOARD_ROUTE, TEAMSPACE_ROUTE_BASE, PROJECT_ROUTE_BASE } from '@/v5/ui/routes/routes.constants';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { formatMessage } from '@/v5/services/intl';

interface IAlertModal {
	onClickClose?: () => void,
	currentActions?: string
	error: AxiosError;
	details?: string
}

export const AlertModal: FC<IAlertModal> = ({ onClickClose, currentActions = '', error, details }) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const history = useHistory();

	const message = getErrorMessage(error);
	const code = getErrorCode(error);
	const status = getErrorStatus(error);
	const errorStatus = status && code ? `${status} - ${code}` : '';
	const pathNotFound = isPathNotFound(error);

	const getSafePath = () => {
		if (isTeamspaceNotFound(code)) return generatePath(DASHBOARD_ROUTE);
		if (isProjectNotFound(code)) return generatePath(TEAMSPACE_ROUTE_BASE, { teamspace });
		if (isResourceNotFound(code)) return generatePath(PROJECT_ROUTE_BASE, { teamspace, project });
	};

	const getSafePathName = () => {
		if (isTeamspaceNotFound(code)) {
			return formatMessage({ id: 'alertModal.redirect.dashboard', defaultMessage: 'the dashboard' });
		}
		if (isProjectNotFound(code)) {
			return formatMessage({ id: 'alertModal.redirect.teamspace', defaultMessage: 'the teamspace page' });
		}
		if (isResourceNotFound(code)) {
			return formatMessage({ id: 'alertModal.redirect.project', defaultMessage: 'the project page' });
		}
	};
	
	const redirectToSafePath = () => {
		const path = getSafePath();
		history.push(path);
	};

	useEffect(() => () => {
		if (pathNotFound) redirectToSafePath();
	}, []);

	return (
		<DialogContainer>
			<WarningIcon />
			<DialogTitle>
				<FormattedMessage
					id="alertModal.header"
					defaultMessage="Something went wrong when {currentActions}"
					values={{ currentActions }}
				/>
				{pathNotFound && (
					<>.
						<br />
						<FormattedMessage
							id="alertModal.redirect"
							defaultMessage="You'll be redirected to {to}."
							values={{ to: getSafePathName() }}
						/>
					</>
				)}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{message}
				</DialogContentText>
				{!!status && <Status>{errorStatus}</Status>}
			</DialogContent>
			<Actions>
				<Button autoFocus type="submit" onClick={onClickClose} variant="contained" color="primary">
					<FormattedMessage
						id="alertModal.action.ok"
						defaultMessage="Ok, close window"
					/>
				</Button>
				<Button href="https://3drepo.com/contact/" variant="outlined" color="secondary">
					<FormattedMessage
						id="alertModal.action.contactSupport"
						defaultMessage="Contact support"
					/>
				</Button>
			</Actions>
			{details && <Details>{details}</Details>}
		</DialogContainer>
	);
};
