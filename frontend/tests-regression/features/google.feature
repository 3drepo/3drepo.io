Feature: Google search
	Scenario: Finding some cheese
		Given I am on the Google search page
		When I search for "Cheese!"
		Then the page title should start with "cheese"

	Scenario: Finding some olives
		Given I am on the Google search page
		When I search for "olives"
		Then the page title should start with "olives"