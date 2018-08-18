let someBeach;

function getApiData(beach, callback) {
    someBeach = SPOTS.find(function (b) {
        return b.name === beach;
    });

    // let currentTime = Math.round(new Date().getTime() / 1000);
    let currentTime = new Date();
    let currentHour = currentTime.getHours() + 1;
    currentTime.setHours(currentHour, 0, 0, 0);
    console.log(currentTime.getTime() / 1000);
    $.ajax({
        url: `http://localhost:3000/point?lat=${someBeach.lat}&lng=${someBeach.lng}&start=${currentTime.getTime() / 1000}`,
        dataType: 'json',
        contentType: 'application/json',
        success: callback
    })
}

function populateLocationsDropdown() {
    let locations = {};
    SPOTS.forEach(function (spot) {
        if (!(spot.state in locations)) {
            locations[spot.state] = [];
        }
        locations[spot.state].push(spot);
    })
    console.log(locations);

    let locationsDropdown = $('#js-locations');
    for (let location in locations) {
        let optionsTemplate = '';
        locations[location].forEach(function (l) {
            optionsTemplate += `
                <option value="${l.name}">${l.name}</option>
            `;
        });
        let optGroupTemplate = `
            <optgroup label="${location}">${optionsTemplate}</optgroup>
        `;
        locationsDropdown.append(optGroupTemplate);
    }
}


// This event listener loads the basic view of the app with the selected beach's ratings when the user clicks "GO!"
$('form').submit(function (event) {
    event.preventDefault();
    let chosenBeach = $('#js-locations').val()
    getApiData(chosenBeach, createResultMap);
})


function createResultMap(data) {
    data = JSON.parse(data);
    console.log(data);
    let dayOneData = [];
    for (let i = 0; i < 6; i++) {
        dayOneData.push(data.hours[i])
    };
    let dayOneResultMap = dayOneData.map(function (d) {
        let initialWaveRating = 0;
        // 3.28084 is the conversion for meters to feet
        let swellDirection = 0;
        let windSpeed = 0;
        let windDirection = 0;
        let swellHeight = 0;
        let swellPeriod = 0;


        if (d.swellPeriod[1] && d.swellHeight[1] && d.swellDirection[1] && d.windSpeed[1] && d.windDirection[1]) {
            swellHeight = d.swellHeight[1].value * 3.28084;
            initialWaveRating = Number(d.swellPeriod[1].value) * swellHeight;
            // 3.28084 is the conversion for meters to feet
            swellDirection = d.swellDirection[1].value;
            windSpeed = Number(d.windSpeed[1].value) * 2.23694;
            windDirection = d.windDirection[1].value;
            swellPeriod = d.swellPeriod[1].value;
        }


        return {
            initialWaveRating, swellDirection, windSpeed, windDirection, swellHeight, swellPeriod
        };
    })


    console.log(dayOneResultMap);
    beginnerTemplate(dayOneResultMap);
}
populateLocationsDropdown();

function calculateHour(hour) {
    if (hour > 24) {
        hour = hour - 24;
    } else if (hour > 12) {
        hour = hour - 12;
    }
    return hour;
}

function inRange(test, min, max) {
    return test >= min && test <= max;
}

function evaluateWindRange(test, minWindRange, maxWindRange) {
    if (typeof (minWindRange) == "object" && typeof (maxWindRange) == "object") {
        return (inRange(test, minWindRange[0], minWindRange[1])) && (inRange(test, maxWindRange[0], maxWindRange[1]));
    }
    return inRange(test, minWindRange, maxWindRange)
}

// Put all math conditional stuff in here 
function createRatingData(results) {
    let ratingFormula = {};
    let currentHour = new Date().getHours() + 1;
    const indexMap = { 0: `${calculateHour(currentHour)}:00`, 1: `${calculateHour(currentHour + 1)}:00`, 2: `${calculateHour(currentHour + 2)}:00`, 3: `${calculateHour(currentHour + 3)}:00`, 4: `${calculateHour(currentHour + 4)}:00`, 5: `${calculateHour(currentHour + 5)}:00` };
    for (let h = 0; h < results.length; h++) {
        if (results[h].initialWaveRating && results[h].swellDirection && results[h].windDirection && results[h].windSpeed) {
            let initialRating = Math.round(3 + results[h].initialWaveRating / 8);
            if (!(inRange(results[h].swellDirection, someBeach.minSwell, someBeach.maxSwell)) || (results[h].windSpeed > 14 && (!(evaluateWindRange(results[h].windDirection, someBeach.minWind, someBeach.maxWind))))) {
                initialRating = 1;
            }
            else if ((results[h].windSpeed > 6 && results[h].windSpeed < 14) && (!(evaluateWindRange(results[h].windDirection, someBeach.minWind, someBeach.maxWind)))) {
                initialRating -= 2;
            }
            else if ((results[h].windSpeed > 6 && results[h].windSpeed < 16) && (evaluateWindRange(results[h].windDirection, someBeach.minWind, someBeach.maxWind))) {
                initialRating += 1;
            }
            ratingFormula[indexMap[h]] = initialRating;
        } else
            ratingFormula[indexMap[h]] = false;
    }

    return ratingFormula;
}

const NO_DATA = "Sorry! Not Enough Data At This Time";

function ratingTemplate(rating) {
    let template = '';
    if (rating) {
        template = `
            <i class="fas fa-star"></i>
            `;

    } else {
        template = NO_DATA;
    }

    return template;
}

function getAzimuth(deg) {
    if ((deg >= 337.5 && deg <= 360) || (deg >= 0 && deg <= 22.5)) {
        return 'N';
    }
}
//
function beginnerTemplate(dayOneResults) {
    let starTemplate = '';
    let dayOneRating = createRatingData(dayOneResults);
    let validResult = {};
    let hours = Object.keys(dayOneRating);
    for (let h=0; h < dayOneResults.length; h++) {
        hour = hours[h];
        if (dayOneRating[hour]) {
            validResult= dayOneResults[h];
            starTemplate = `
                <div>${hour}: ${ratingTemplate(dayOneRating[hour])}</div>
            `;
            break;
        }
    }

    let dayOneTemplate = `
    <section role="section" class="container-left">
    <p> Surf Ratings for ${someBeach.name} </p>
    ${starTemplate}
</section>
<section role="section">
    <ul class="info-boxes">
        <li>
            <div>Swell</div>
                <p>${validResult.swellHeight.toFixed(2)} feet @</p>
                <p>${validResult.swellPeriod.toFixed(2)} seconds</p>
        </li>
        <li>
            <div>Wind</div>
                <p>${validResult.windSpeed.toFixed(2)} mph @</p>
                <p>${getAzimuth(validResult.windDirection)}</p>
        </li>
        <li>
            <div>Tide</div>
                <p>Best @ ${someBeach.tide}</p>
        </li>   
    </ul>   
</section>
`;

$('main').before(`
    <header role="banner" class="nav">
        <img class="navLogo" src="images/mywave.png">
            <button type="button" class="backButton">Back</button>
    </header>
`)
$('.container').html(dayOneTemplate);
}


