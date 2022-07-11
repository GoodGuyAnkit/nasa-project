const express = require('express');

const { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunchById } = require('./launches.controller');

const launchesRouter = express.Router();

// planets/
launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.delete('/:id', httpAbortLaunchById);

module.exports = launchesRouter;
