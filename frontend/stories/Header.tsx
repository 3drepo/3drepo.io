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
import { Button } from './Button';
import './header.css';

type User = {
	name: string;
};

interface HeaderProps {
	user?: User;
	onLogin: () => void;
	onLogout: () => void;
	onCreateAccount: () => void;
}

export const Header = ({ user, onLogin, onLogout, onCreateAccount }: HeaderProps) => (
	<header>
		<div className="wrapper">
			<div>
				<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<g fill="none" fillRule="evenodd">
						<path
							d="M10 0h12a10 10 0 0110 10v12a10 10 0 01-10 10H10A10 10 0 010 22V10A10 10 0 0110 0z"
							fill="#FFF"
						/>
						<path
							d="M5.3 10.6l10.4 6v11.1l-10.4-6v-11zm11.4-6.2l9.7 5.5-9.7 5.6V4.4z"
							fill="#555AB9"
						/>
						<path
							d="M27.2 10.6v11.2l-10.5 6V16.5l10.5-6zM15.7 4.4v11L6 10l9.7-5.5z"
							fill="#91BAF8"
						/>
					</g>
				</svg>
				<h1>Acme</h1>
			</div>
			<div>
				{user ? (
					<>
						<span className="welcome">
							Welcome, <b>{user.name}</b>!
						</span>
						<Button size="small" onClick={onLogout} label="Log out" />
					</>
				) : (
					<>
						<Button size="small" onClick={onLogin} label="Log in" />
						<Button primary size="small" onClick={onCreateAccount} label="Sign up" />
					</>
				)}
			</div>
		</div>
	</header>
);
