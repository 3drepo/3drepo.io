# 3drepo.io ![](https://travis-ci.org/3drepo/3drepo.io.svg?branch=master)

3drepo.io a web based BIM collaboration platform. It is one of the 4 parts of the 3D Repo ecosystem.

![3drepo](https://user-images.githubusercontent.com/11945337/44221768-60634280-a17a-11e8-989e-089a650e3710.png)

#

## Latest Release & API
* Latest release: https://github.com/3drepo/3drepo.io/releases/tag/latest
* Corresponding Backend API docs: https://3drepo.github.io/3drepo.io/
* Corresponding UnityUtils API: https://3drepo.github.io/3drepo.io/frontend/classes/unity_util.UnityUtil.html

## Dependencies

* Node.js (v 8.11.3)
* [yarn](https://yarnpkg.com/lang/en/docs/install/)

## Setting up your 3D Repo environment
To setup the whole 3D Repo Ecosystem, you will need the following:
- A running MongoDB database, with an admin user created;
- A RabbitMQ server;
- A running Bouncer Worker service, provided in [3drepobouncer](https://github.com/3drepo/3drepobouncer).

Note: To generate viewable 3D models, you will need 3drepounity to create asset bundles. **This is a closed source project**. Please contact sales@3drepo.com for a business license, alternatively you can use 3drepo.io version v1.12 which uses the old x3dom rendering engine.

## Installation

Note: If using windows, please ensure cmd.exe was invoked as administrator (i.e. Right click -> Run as Administrator).

1. Clone the repository: `git clone https://github.com/3drepo/3drepo.io.git`
2. Change directory: `cd 3drepo.io`
3. Check out latest release, which should be the latest of our master branch
5. Setup the configuration file for running the 3D Repo web app as per the `Configuration` section below.
6. Install the required backend dependencies: `cd backend && yarn install`
7. Install the required frontend dependencies: `cd frontend && yarn install`
8. Compile the frontend: `cd frontend && yarn run build` (for file watching/live reloading, see `Running the application` below)

## Configuration

The configuration files are contained in the `config` folder. Each directory in config represents a different configuration. This allows you to quickly switch between, for example, a development environment and a production environment. Each configuration folder is expected to have a config.js file, which details the configuration settings for the particular environment.

In general, to configure a new configuration enviroment called <config_name>:

1. Change to the configuration directory: `cd config`
2. First create a new directory under config: `mkdir <config_name>`
3. Copy config/sample_config.js to the new directory as config.js: `cp config_sample.js <config_name>/config.js`
4. Edit config.js as described in [Configuration File](https://github.com/3drepo/3drepo.io/wiki/Configuration-File)

## Running the application

The repository includes a script `run_app` and `run_app.cmd` specifically for Windows to run the server. It has two arguments:

`./run/run_app <config> [debug]`
- `config` This is the directory under config that the configuration resides in
- `debug` Type debug here for node.js debugging, or leave it out for none.

Typically you will want to run the server using pm2 (install with `npm -g install pm2` under the superuser account):

`./run_app_pm2 <config>`
* `config` This is the directory under config that the configuration resides in

## File Watching & Live Reloading

All frontend files are observed and automatically re-compiled if you run `yarn run watch`.

For live reloading, set `development: true` in your `config.js`.

## Locally running the application

The application requires the use of cookies for tracking user authentication. Some browsers do not
allow the use of cookies for the `localhost` domain. To circumvent this problem, please use the loopback address (127.0.0.1) as your domain name.

Alternatively you can modify your hosts file to add a DNS entry to your loopback address. For Windows, you must use an Administrator notepad to edit the file:

`C:\Windows\System32\Drivers\etc\hosts`

For Linux, you must edit the file with Administrator privileges:

`sudo nano /etc/hosts`

Within this file you must append to, or create, a line for the entry for example:

`127.0.0.1 localhost example.org`

In the configuration file for the server, you then set hostname to `example.org` or whatever host you have redirected.

## Licenses
This project is Copyright of [3D Repo Ltd](http://3drepo.org), a company registered in England and Wales No. 14772861, and is released under the open source [GNU Affero General Public License v3](http://www.gnu.org/licenses/agpl-3.0.en.html). Should you require a commercial license, please contact [support@3drepo.com](mailto:support@3drepo.com). All contributors are required to sign either the [3D Repo Individual](https://gist.github.com/jozefdobos/e177af804c9bcd217b73) or the [3D Repo Entity](https://gist.github.com/jozefdobos/c7c4c1c18cfb211c45d2) [Contributor License Agreement (CLA)](https://en.wikipedia.org/wiki/Contributor_License_Agreement).

## Contributing
We very much encourage contributions to the 3D Repo project. Firstly, fork the desired repository and commit your modifications there. Once happy with the changes, you can generate a [pull request](https://help.github.com/articles/using-pull-requests/) and our team will integrate it upstream after a review.

Your pull requests should:

1. Follow the style of the existing code
2. One commit should just do one thing, and one thing only
3. Rebase your branch against [upstream's master](https://help.github.com/articles/merging-an-upstream-repository-into-your-fork/) so that we don't pull redundant commits
4. Sign our [3D Repo Individual CLA](https://gist.github.com/jozefdobos/e177af804c9bcd217b73) or if you are representing a legal entity, sign the [3D Repo Entity CLA](https://gist.github.com/jozefdobos/c7c4c1c18cfb211c45d2)


## Contact

If you need any help or want to contribute please contact: [support@3drepo.com](mailto:support@3drepo.com)
We look forward to hearing from you.
