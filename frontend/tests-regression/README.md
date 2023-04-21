# Regression tests

<p align="center">

  <a href="https://3Drepo.com" target="_blank">
    <img alt="3D Repo Local-logo" height="70" alt="3D Repo Local Logo" src="https://3drepo.com/wp-content/uploads/2018/06/3D-Repo-Logo-Blue.png"/>
  </a>
</p>
<p align="center">
    <a href="https://staging.dev.3drepo.io/docs/">Docs</a>
</p>

The regression tests for 3drepo are meant to be a safeguard against any bugs that might reappear. It's based on 3DRepo's tests before pushing out a major release.

# Features

- Provides a config file "config.json" with the test data in order to run the tests
- Testing of dashboard and viewer (To be finished)

# Getting Started

- start your local 3DRepo installation or use 3drepo.io
- Update config.json with the relevant data (the domain and api domain, users and all relevant data must match the server you are using)
- run `yarn install`
- run `yarn test`

# Notes
At the moment config.json has to be configured the first time you run the tests, in the future we might want to have a fixed test data set and local test server to not have to configure the config.json file each time.
