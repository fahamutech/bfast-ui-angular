# bfast-ui-angular

Web IDE for angular based bfast-ui project

# Development

Clone repository from [github](https://github.com/fahamutech/bfast-ui-angular) then run `npm run start` from project
directory after you install all dependencies `npm install`.

Make sure you have [bfast-tools](https://github.com/fahamutech/bfast-tools) for development.

# Get Started

Install project from npm `npm install bfast-ui-ng`

# Start IDE

Create `.js` file anywhere and add the following codes

```javascript
const BFastUiAngular = require("bfast-ui-ng");

new BFastUiAngular().init().then(value => {
    return value.ide.start();
}).then(reason => {
    console.log('start successful');
}).catch(reason => {
    console.log(reason);
})

```

# API Reference

## Classes

## BFastUiAngular

Main class for initiate IDE instance

### Methods

Following are the public methods

#### init

Initiate a bfast ui angular ide

* Parameters - null

* Return

        Promise<{ide: BfastFunctions, port: number}>

## BfastFunctions

From `bfast-functions` package to start a bfast functions engine.

### Methods

#### start

Start bfast engine

* Parameters - null

* Return

        Promise<Server>

        NOTE : Server is node-js Server object

#### stop

Stop bfast engine

* Parameters - null

* Return

        Promise<void>

