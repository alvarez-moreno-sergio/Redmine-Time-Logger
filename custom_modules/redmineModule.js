const querystring = require('querystring')
const requestModule = require('request');
const serverModule = require('./serverModule');
const config = require('../config');

function convertMiliseconds(miliseconds, format) {
    let days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

    total_seconds = parseInt(Math.floor(miliseconds / 1000));
    total_minutes = parseInt(Math.floor(total_seconds / 60));
    total_hours = parseInt(Math.floor(total_minutes / 60));
    days = parseInt(Math.floor(total_hours / 24));

    seconds = parseInt(total_seconds % 60);
    minutes = parseInt(total_minutes % 60);
    hours = parseInt(total_hours % 24);

    switch(format) {
        case 's':
            return total_seconds;
        case 'm':
            return total_minutes;
        case 'h':
            return total_hours;
        case 'd':
            return days;
        default:
            return { d: days, h: hours, m: minutes, s: seconds };
    }
}

exports.createAndSendTimeEntry = function(request, response){
    let body = '';
    let timeEntries = {};
    request.on('data',function (chunk) {
        body += chunk;
    });

    request.on('end', function () {
        timeEntries = querystring.parse(body);
        sendTimeEntries(timeEntries, response);
    });

};

function timeEntriesToXML(timeEntries){
    let startDate = timeEntries.startDate;
    let endDate = timeEntries.endDate;
    let dateDiff = endDate===''||isNaN(new Date(endDate))? 0:new Date(endDate) - new Date(startDate);

    dateDiff = convertMiliseconds(dateDiff, 'd');
    let new_timeEntriesXML = new Array(dateDiff+1);
    console.log(`Start Date: ${startDate}, End Date: ${endDate}`);
    if (dateDiff === 0){
        new_timeEntriesXML[0] = `<time_entry>`+
            `<issue_id>${timeEntries.issue_id}</issue_id>`+
            `<spent_on>${timeEntries.startDate}</spent_on>`+
            `<hours>${timeEntries.hours}</hours>`+
            `<activity_id>${timeEntries.activity_id}</activity_id>`+
            `<comments>${timeEntries.comments}</comments>`+
            `</time_entry>`;
        console.log(new_timeEntriesXML[0]);
    }
    else {
        let actualDate = new Date(startDate);
        for (let i=0;i<dateDiff+1;i++){
            new_timeEntriesXML[i] = `<time_entry>`+
                `<issue_id>${timeEntries.issue_id}</issue_id>`+
                `<spent_on>${actualDate.toISOString().substring(0, 10)}</spent_on>`+
                `<hours>${timeEntries.hours}</hours>`+
                `<activity_id>${timeEntries.activity_id}</activity_id>`+
                `<comments>${timeEntries.comments}</comments>`+
                `</time_entry>`;
            console.log(new_timeEntriesXML[i]);
            actualDate.setDate(actualDate.getDate()+1); // inc 1 day
        }
    }

    return new_timeEntriesXML;
}

function sendTimeEntries(timeEntries, response){
    let xml = timeEntriesToXML(timeEntries);
    console.log(`xml:${xml}`);
    let globalStatusOK = true;
    let completeResponse = '';
    let totalCalls = 0;
    let apiKey = timeEntries.apiKey;
    for (let data in xml) {
        console.log(`data:${xml[data]}`);
        requestModule({
                method:'POST',
                url: `${config.redmineURL}/time_entries.xml?key=${apiKey}`,
                headers: {'Content-Type':'application/xml'},
                body: xml[data]
            }, function (error, apiResponse, body) {
                totalCalls++;
                let status = apiResponse.statusCode;
                console.log('Status', status);
                console.log('Headers', JSON.stringify(apiResponse.headers));
                console.log('Response', body);
                completeResponse += (status===201?body:status) + '; \n';
                if (globalStatusOK && apiResponse.statusCode !== 201){
                    globalStatusOK = false;
                }

                if (totalCalls === xml.length){
                    serverModule.sendContent(response, completeResponse);
                    console.log(`globalStatusOK:${globalStatusOK}`);
                }
            }
        );
    }
}