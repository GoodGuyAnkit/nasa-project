const launchesMongo = require("./launches.mongo");
const planets = require('./planets.mongo');

const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100;

async function findLaunch(filter){
    return await launchesMongo.findOne(filter);
}

async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId
    });
}
async function getAllLaunches(){
    return await launchesMongo.find({}, { '__id': 0, '__v': 0 });
}

async function getLatestFlightNumber(){
    const latestLaunch = await launchesMongo.findOne().sort('-flightNumber');
    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function saveLaunch(launch){
    await launchesMongo.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    });
}

async function scheduleNewLaunch(launch){
    let planet = await planets.findOne({
        keplerName: launch.target
    })
    console.log("🚀 ~ file: launches.model.js ~ line 28 ~ saveLaunch ~ planet", planet)

    if(!planet){
        throw new Error('No planet found with provided name');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Bruh', 'NASA'],
        flightNumber: newFlightNumber
    });
    await saveLaunch(newLaunch);
}


async function abortLaunchById(launchId){
    return await launchesMongo.findOneAndUpdate({
        flightNumber: launchId
    }, {
        success: false,
        upcoming: false
    });
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
    console.log('Downloading the launches data...');
    const response = await axios.post(SPACEX_API_URL, {
        query:{},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });
    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers
        }
        console.log(`${launch.flightNumber} ${launch.mission}`);
        await saveLaunch(launch);
    }
}

async function loadLaunchesData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if(firstLaunch){
        console.log('Launch data already loaded');
        return;
    } else {
        await populateLaunches();
    }

}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
    loadLaunchesData
};