#  Copyright (C) 2023 3D Repo Ltd
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

Feature: Signup
	# Scenario: Sign up link
	# 	Given Im not logged in
	# 	And I navigate to '/'
	# 	When I click on 'Sign up'
	# 	Then I should be redirected to the 'signup' page

	Scenario: Sign up with valid  properties
		# Given Im not logged in
		Given I navigate to 'signup'
		And I fill in the form with:
			| Username  | Email             | Password        |
  			| newuser   | newuser@mail.com  | +jk+gnPZM^2LXDV |
		And I click on "Next step"
		And I fill in the form with:
			| First name  | Last name       |
  			| New		  | User  			|
		And I click on "Next step"
		And I click on the checkbox near "I agree"
		And I click on "Create account"
		And I wait until "verify your email" text appears
		And I navigate to verify account from email "newuser@mail.com" 


	