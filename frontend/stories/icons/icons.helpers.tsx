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
import { IconsTemplate, IconsTemplateProps } from './icons.component';

const groupIconsByType = (icons: string[]) => {
	const svgIcons: string[] = [];
	const svgTsxIcons: string[] = [];
	for (let i = icons.length - 1; i >= 0; i--) {
		const currentIcon = icons[i];
		if (!currentIcon.endsWith('.tsx')) {
			// the original file was a plain svg, not tsx
			svgIcons.unshift(currentIcon);
		} else {
			// the original file was a tsx, and an svg was created for it
			svgTsxIcons.unshift(currentIcon);
			i--; // skip next item which is the created svg
		}
	}
	return [svgIcons, svgTsxIcons];
};

const getIconsNamesByTypeFromContext = (context) => {
	const fileNames = context.keys().map((path) => path.replace('./', ''));
	return groupIconsByType(fileNames);
};
const getDisplayName = (name) => name.replace('.tsx', '').replace('.svg', '');

export const getIcons = (context, dir?) => {
	const [svgs, tsxs] = getIconsNamesByTypeFromContext(context);
	const formattedDir = dir ? `${dir}/` : '';

	const tsxIcons = tsxs.map((name) => ({
		// eslint-disable-next-line
		Icon: require(`@assets/icons/${formattedDir}${name.replace(/\.tsx/, '')}`).default,
		name: getDisplayName(name),
	}));
	const svgIcons = svgs.map((name) => ({
		// eslint-disable-next-line
		Icon: () => <img src={require(`@assets/icons/${formattedDir}${name}`)} alt={name} />,
		name: getDisplayName(name),
	}));
	return [...tsxIcons, ...svgIcons].sort((a, b) => a.name.localeCompare(b.name));
};

export const metaColorlessIcon = {
	argTypes: {
		backgroundColor: {
			type: 'string',
		},
		iconSize: {
			type: 'number',
		},
	},
	args: {
		iconSize: 10,
	},
	render: (args) => (<IconsTemplate {...args as IconsTemplateProps} />),
	parameters: { controls: { exclude: 'icons' } },
};

export const metaIcon = {
	...metaColorlessIcon,
	argTypes: {
		...metaColorlessIcon.argTypes,
		color: {
			type: 'string',
		},
	},
	parameters: { controls: { exclude: 'icons' } },
};
