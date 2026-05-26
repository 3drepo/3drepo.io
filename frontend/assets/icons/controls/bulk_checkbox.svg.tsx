/**
 *  Copyright (C) 2026 3D Repo Ltd
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

type IProps = {
	className?: string;
};

export default ({ className }: IProps) => (
	<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M15.4395 12.335L15.4395 3.50293C15.4395 3.17285 15.707 2.90527 16.0371 2.90527C16.3672 2.90527 16.6348 3.17285 16.6348 3.50293V12.335C16.6348 14.7464 14.6799 16.7012 12.2686 16.7012H3.43652C3.10645 16.7012 2.83887 16.4336 2.83887 16.1035C2.83887 15.7734 3.10645 15.5059 3.43652 15.5059L12.2686 15.5059C14.0198 15.5059 15.4395 14.0862 15.4395 12.335Z" fill="currentColor"/>
		<path d="M11.7871 12.9326V14.1279L2.75586 14.1279L2.75586 12.9326L11.7871 12.9326ZM12.9824 11.7373L12.9824 2.70605C12.9824 2.0459 12.4473 1.51074 11.7871 1.51074L2.75586 1.51074C2.09571 1.51074 1.56055 2.0459 1.56055 2.70605L1.56055 11.7373C1.56055 12.3975 2.09571 12.9326 2.75586 12.9326L2.75586 14.1279C1.44587 14.1279 0.381974 13.0743 0.365429 11.7682L0.365234 11.7373L0.365234 2.70605C0.365234 1.38575 1.43555 0.31543 2.75586 0.31543L11.7871 0.31543L11.818 0.315624C13.1241 0.332169 14.1777 1.39606 14.1777 2.70605L14.1777 11.7373L14.1775 11.7682C14.1611 13.064 13.1138 14.1113 11.818 14.1277L11.7871 14.1279V12.9326C12.4473 12.9326 12.9824 12.3975 12.9824 11.7373Z" fill="currentColor"/>
	</svg>
);
