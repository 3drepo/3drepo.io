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

import PATIcon from '@material-ui/icons/InsertDriveFileOutlined';

import { LANDING_ROUTES, STATIC_ROUTES } from '../../../../../services/staticPages';
import { COLOR } from '../../../../../styles';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import { NestedMenuItem } from '../nestedMenuItem/nestedMenuItem.component';
import { MenuContent, MenuItem, MenuText } from './extrasMenu.styles';
import { MenuButton } from './menuButton/menuButton.component';

const ExternalLink = ({ ...props }) => {
	const Icon = props.icon || React.Fragment;
	const iconProps = props.icon ? { style: { color: COLOR.BLACK_54 } } : {};
	return (
		<MenuItem button aria-label={props.label} onClick={props.onButtonClick}>
			<Icon {...iconProps} />
			<MenuText primary={props.label} />
		</MenuItem>
	);
};

const ExtrasMenuContent = (props) => {
	const invokeAndClose = (path) => (...args) => {
		window.open(path, '_blank');
		props.close(...args);
	};

	const commonLinks = [...LANDING_ROUTES];
	const staticLinks = [...STATIC_ROUTES];

	return (
		<MenuContent component="nav">
			{commonLinks.map(({ path, title, icon }, index) => (
				<ExternalLink
					key={index}
					label={title}
					icon={icon}
					onButtonClick={invokeAndClose(path)}
				/>
			))}
			<NestedMenuItem
					label="Privacy & Terms"
					icon={<PATIcon style={{ color: COLOR.BLACK_54 }} />}
					renderContent={staticLinks.map(({ path, title }, index) => (
							<ExternalLink
									key={index}
									label={title}
									onButtonClick={invokeAndClose(path)}
							/>
					))}
			/>
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

	private renderButton = ({ ...props }) => <MenuButton {...props} />;

	public render() {
		return (
			<ButtonMenu
				ripple
				renderButton={this.renderButton}
				renderContent={this.renderMenuContent}
				PopoverProps={{
					anchorOrigin: {
						vertical: 'bottom',
						horizontal: 'right'
					}
				}}
			/>
		);
	}
}
