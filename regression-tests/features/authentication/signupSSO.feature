#  Copyright (C) 2024 3D Repo Ltd
#  
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as
#  published by the Free Software Foundation, either version 3 of the
#  License, or (at your option) any later version.
#  
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#  
#  You should have received a copy of the GNU Affero General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.
Feature: SignupSSO
	Scenario: Sign up with valid properties
		Given I try to signup with Microsoft SSO with:
			| Username    | Company | Microsoft Email       | Microsoft Password |
  			| anSSOUser   | Asite   | anSSOUser@outlook.com | mspassword    |
		Then I should be redirected to the 'dashboard' page

	Scenario: Sign up (username taken)
		Given I try to signup with Microsoft SSO with:
			| Username   	  | Company |
  			| homerJSimpson   | Asite   |
		Then I wait until "selected username is already taken" text appears
