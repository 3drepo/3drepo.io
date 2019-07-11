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

import IconButton from '@material-ui/core/IconButton';
import * as React from 'react';

import { LANDING_ROUTES, STATIC_ROUTES } from '../../../../../services/staticPages';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import {
	BurgerIcon,
	MenuContent,
	MenuItem,
	MenuText
} from './extrasMenu.styles';

const MenuButton = ({ IconProps, Icon, ...props }) => (
	<IconButton
		{...props}
		aria-label="Toggle user menu"
		aria-haspopup="true"
	>
		<BurgerIcon {...IconProps} size="small" />
	</IconButton>
);

const ExternalLink = ({ ...props }) => {
	return (
		<MenuItem button={true} aria-label={props.label} onClick={props.onButtonClick}>
			<MenuText primary={props.label} />
		</MenuItem>
	);
};

const ExtrasMenuContent = (props) => {
	const invokeAndClose = (path) => (...args) => {
		window.open(path, '_blank');
		props.close(...args);
	};

	const links = [
		...STATIC_ROUTES,
		...LANDING_ROUTES
	];

	return (
		<MenuContent component="nav">
			{links.map(({ path, title }, index) => (
				<ExternalLink
					key={index}
					label={title}
					onButtonClick={invokeAndClose(path)}
				/>
			))}
		</MenuContent>
	);
};

export class ExtrasMenu extends React.PureComponent<any, any> {
	public renderMenuContent = (props) => {
		const menuContentProps = {
			...props,
			...this.props
		};

		return <ExtrasMenuContent {...menuContentProps} />;
	}

	public render() {
		return (
			<ButtonMenu
				renderButton={MenuButton}
				renderContent={this.renderMenuContent}
				PopoverProps={{
					anchorOrigin: {
						vertical: 'top',
						horizontal: 'right'
					}
				}}
			/>
		);
	}
}
