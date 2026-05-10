![Webpack CI](https://github.com/Pera-Swarm/visualizer/workflows/Webpack%20CI/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A basic boilerplate for a Three.js project including the use of Webpack and ES6 syntax via Babel.

## Project Structure

```
build - Directory for built and compressed files from the pnpm build script
src - Directory for all dev files
├── css - Contains all SCSS files, that are compiled to `src/public/css`
├── js - All the Three.js app files, with `app.js` as entry point. Compiled to `src/public/js` with webpack
│   ├── app
│   │   ├── components - Three.js components that get initialized in `main.js`
│   │   ├── helpers - Classes that provide ideas on how to set up and work with defaults
│   │   ├── managers - Manage complex tasks such as GUI or input
│   │   └── model - Classes that set up the model object
│   ├── data - Any data to be imported into app
│   └── utils - Various helpers and vendor classes
└── public - Used by webpack-dev-server to serve content. Webpack builds local dev files here.
    └── assets - Is copied over to build folder with build command. Place external asset files here.
```

## Getting started

Install dependencies:

```
pnpm install
```

Then run dev script:

```
pnpm run dev
```

Spins up a webpack dev server at localhost:8080 and keeps track of all js and sass changes to files.

## Build

```
pnpm run build
```

Cleans existing build folder while linting js folder and copies over the public assets folder from src. Then sets environment to production and compiles js and css into build.

## Access the visualizer

You need to provide the username and password of the MQTT broker, when you are visiting the web interface for the first time. After the first visit, the login details will be stored in the browser cache.

Example URL (for local run):
    <http://localhost:8080/?username={user_name}&password={password}>

Example URL (for production run):
    <http://pera-swarm.github.io/visualizer/?username={user_name}&password={password}>

## Other pnpm Scripts

You can run any of these individually if you'd like with the `pnpm run` command:

* `prebuild` - Cleans up build folder and lints `src/js`
* `clean` - Cleans build folder
* `lint` - Runs lint on the `src/js` folder and uses the `.eslintrc` file in root for linting rules
* `webpack-server` - Start up a  webpack-dev-server with hot-module-replacement
* `webpack-watch` - Run webpack in dev environment with watch
* `dev:js` - Run webpack in dev environment without watch
* `build:dir` - Copy files and folders from `src/public` to `build`
* `build:js` - Run webpack in production environment

## Input Controls

* Arrow controls will pan
* Mouse left click will rotate/right click will pan
* Scroll wheel zooms in and out

## Latest build

You can see the latest deployment of this repository from [https://pera-swarm.ce.pdn.ac.lk/visualizer/](https://pera-swarm.ce.pdn.ac.lk/visualizer/)
