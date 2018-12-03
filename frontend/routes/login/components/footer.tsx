/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';

import { StyledButton, Version, FooterContainer } from '../login.styles';
import { clientConfigService } from '../../../services/clientConfig';

const APP_VERSION = clientConfigService.VERSION;

export const Footer = () => (
	<FooterContainer container alignItems="center" justify="space-between">
		<Version flex-direction="row">
			Version:
				<Tooltip title="Release notes">
				<StyledButton
					href={`https://github.com/3drepo/3drepo.io/releases/tag/${APP_VERSION}`}
					target="_blank"
				>
					{APP_VERSION}
				</StyledButton>
			</Tooltip>
		</Version>
		<Grid>
			<StyledButton
				component={Link}
				to="/sign-up"
			>
				Sign up
			</StyledButton>
			<StyledButton
				href="http://3drepo.org/pricing/"
				target="_blank"
			>
				Pricing
				</StyledButton>
		</Grid>
	</FooterContainer>
);
