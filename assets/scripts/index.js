let someBeach;

function getApiData(beach, callback) {
    $('.loading').show();
    someBeach = SPOTS.find(function (b) {
        return b.name === beach;
    });

    const currentTime = new Date();
    const currentHour = currentTime.getHours() + 1;
    currentTime.setHours(currentHour, 0, 0, 0);

    $.ajax({
        url: `https://mywave-inc.herokuapp.com/point?lat=${someBeach.lat}&lng=${someBeach.lng}&start=${currentTime.getTime() / 1000}`,
        dataType: 'json',
        contentType: 'application/json',
        success: callback
    });
}

function populateLocationsDropdown() {
    let locations = {};
    SPOTS.forEach(function (spot) {
        if (!(spot.state in locations)) {
            locations[spot.state] = [];
        }
        locations[spot.state].push(spot);
    });

    const locationsDropdown = $('#js-locations');
    for (let location in locations) {
        let optionsTemplate = '';
        locations[location].forEach(function (l) {
            optionsTemplate += `
                <option value="${l.name}">${l.name}</option>
            `;
        });
        const optGroupTemplate = `
            <optgroup label="${location}">${optionsTemplate}</optgroup>
        `;
        locationsDropdown.append(optGroupTemplate);
    }
}

const HOME_PAGE = `

    <h1>Welcome to
        <img class="logo" src="images/mywave.png" alt="myWave">
    </h1>
    <h2>Where we believe that you don't have to be an expert to catch that perfect wave!</h2>

    <section role="region">
        <form>
            <fieldset>
                <legend>To begin, select a location from the following:</legend>
                <label for="js-locations">Locations</label>
                <select id="js-locations" required>
                    <option value="">Please Select One</option>
                </select>
            </fieldset>
            <button class="go-button enjoy-css" type="submit">GO!</button>
        </form>
            <h3>How It Works:</h3>
                <p>Choose your spot from the dropdown menu, and the soonest available forecast will be provided. Our complex formula takes all the guesswork out of it! You can now see what the conditions are like in one quick glimpse.</p>
    </section>
    `;

$('body').on('click', '#back-button', function (event) {
    $('header').remove();
    renderHomePage();
});

function createResultMap(data) {
    data = JSON.parse(data);
    let oceanData = [];
    for (let i = 0; i < 6; i++) {
        oceanData.push(data.hours[i])
    }
    let resultMap = oceanData.map(function (d) {
        let initialWaveRating = 0;
        let swellDirection = 0;
        let windSpeed = 0;
        let windDirection = 0;
        let swellHeight = 0;
        let swellPeriod = 0;

        let noaaSwellPeriod = d.swellPeriod.find(swellPeriod => swellPeriod.source === "noaa");
        let noaaSwellHeight = d.swellHeight.find(swellHeight => swellHeight.source == "sg");
        let noaaSwellDirection = d.swellDirection.find(swellDirection => swellDirection.source == "noaa");
        let noaaWindSpeed = d.windSpeed.find(windSpeed => windSpeed.source == "noaa");
        let noaaWindDirection = d.windDirection.find(windDirection => windDirection.source == "noaa");

        if (noaaSwellPeriod && noaaSwellHeight && noaaSwellDirection && noaaWindSpeed && noaaWindDirection) {
            swellHeight = noaaSwellHeight.value * 3.28084;
            initialWaveRating = Number(noaaSwellPeriod.value) * swellHeight;
            // 3.28084 is the conversion for meters to feet
            swellDirection = noaaSwellDirection.value;
            windSpeed = Number(noaaWindSpeed.value) * 2.23694;
            windDirection = noaaWindDirection.value;
            swellPeriod = noaaSwellPeriod.value;
        }


        return {
            initialWaveRating, swellDirection, windSpeed, windDirection, swellHeight, swellPeriod
        };
    });

    renderAppTemplate(resultMap);
}

function calculateHour(hour) {
    if (hour > 24) {
        hour = hour - 24;
    } else if (hour > 12) {
        hour = hour - 12;
    }
    return hour;
}

function calculateAMPM(hour) {
    const currentHour = new Date().getHours();
    hour = Number(hour.split(':')[0]);
    return hour >= currentHour - 12 ? 'PM' : 'AM';
}

function inRange(test, min, max) {
    return test >= min && test <= max;
}

function evaluateWindRange(test, minWindRange, maxWindRange) {
    if (typeof (minWindRange) === "object" && typeof (maxWindRange) == "object") {
        return (inRange(test, minWindRange[0], minWindRange[1])) && (inRange(test, maxWindRange[0], maxWindRange[1]));
    }
    return inRange(test, minWindRange, maxWindRange)
}

// Put all math conditional stuff in here 
function createRatingData(results) {
    let ratingFormula = {};
    const currentHour = new Date().getHours();
    let tooWindy = false;
    const indexMap = { 0: `${calculateHour(currentHour)}:00`, 1: `${calculateHour(currentHour + 1)}:00`, 2: `${calculateHour(currentHour + 2)}:00`, 3: `${calculateHour(currentHour + 3)}:00`, 4: `${calculateHour(currentHour + 4)}:00`, 5: `${calculateHour(currentHour + 5)}:00` };
    for (let h = 0; h < results.length; h++) {
        if ((results[h].initialWaveRating) && (results[h].swellDirection) && (results[h].windDirection) && (results[h].windSpeed)) {
            let initialRating = 2 + Math.round(results[h].initialWaveRating / 8);

            if (!(inRange(results[h].swellDirection, someBeach.minSwell, someBeach.maxSwell)) || (results[h].windSpeed > 18 && (!(evaluateWindRange(results[h].windDirection, someBeach.minWind, someBeach.maxWind))))) {
                initialRating = 1;
                if (results[h].windSpeed > 18) {
                    tooWindy = true;
                }
            }
            if ((results[h].windSpeed > 6 && results[h].windSpeed <= 10) && (!(evaluateWindRange(results[h].windDirection, someBeach.minWind, someBeach.maxWind)))) {
                initialRating -= 1;
            }
            if ((results[h].windSpeed > 10 && results[h].windSpeed <= 18) && (!(evaluateWindRange(results[h].windDirection, someBeach.minWind, someBeach.maxWind)))) {
                initialRating -= 1.5;
            }
            if ((results[h].windSpeed > 6 && results[h].windSpeed < 18) && (evaluateWindRange(results[h].windDirection, someBeach.minWind, someBeach.maxWind))) {
                initialRating += 1;
            }
            ratingFormula[indexMap[h]] = { value: initialRating / 2, tooWindy: tooWindy };
        } else
            ratingFormula[indexMap[h]] = false;
    }

    return ratingFormula;
}

function ratingTemplate(rating) {
    const needHalfStar = !((rating * 2) % 2 === 0);
    rating = Math.floor(rating);
    let template = '';

    for (let i = 0; i < rating; i++) {
        template += `
            <i class="fas fa-star"></i>
            `;
    }
    if (needHalfStar) {
        template += `
            <i class="fas fa-star-half"></i>
            `;
    }
    return template;
}

function getAzimuth(deg) {
    if ((deg > 337.5 && deg <= 360) || (deg >= 0 && deg <= 22.5)) {
        return 'N';
    }
    else if (deg > 22.5 && deg <= 67.5) {
        return 'NE';
    }
    else if (deg > 67.5 && deg <= 112.5) {
        return 'E';
    }
    else if (deg > 112.5 && deg <= 157.5) {
        return 'SE';
    }
    else if (deg > 157.5 && deg <= 202.5) {
        return 'S';
    }
    else if (deg > 202.5 && deg <= 247.5) {
        return 'SW';
    }
    else if (deg > 247.5 && deg <= 292.5) {
        return 'W';
    }
    else if (deg > 292.5 && deg <= 337.5) {
        return 'NW';
    }
}

function renderAppTemplate(hourlyResults) {
    let starTemplate = '';
    const hourlyRating = createRatingData(hourlyResults);
    let validResult = {};
    const hours = Object.keys(hourlyRating);
    let hour;
    for (let h = 0; h < hourlyResults.length; h++) {
        hour = hours[h];
        if (hourlyRating[hour]) {
            validResult = hourlyResults[h];
            starTemplate = `
                <div>${hour}${calculateAMPM(hour)} : ${ratingTemplate(hourlyRating[hour].value)}</div>
            `;
            break;
        }
    }

    const NO_DATA = `    
    <section role="region">
    <h1>Surf Ratings for ${someBeach.name}</h1>
    <p> Sorry! No Data...</p>
    </section>
    `;

    let appTemplate = NO_DATA;
    if (Object.keys(validResult).length) {
        appTemplate = `
<section role="region">
    <h1> Surf Ratings for ${someBeach.name} </h1>
    ${starTemplate}
    <p>The rating given is based on data from the soonest available hour.</p>
    </section>
<section role="region">
    <ul class="info-boxes">
        <li>
            <div class="underline">Swell</div>
                <p>${validResult.swellHeight.toFixed(2)} feet @</p>
                <p>${validResult.swellPeriod.toFixed(2)} seconds</p>
        </li>
        <li>
            <div class="underline">Wind</div>
                <p>${getAzimuth(validResult.windDirection)} @</p>
                <p>${validResult.windSpeed.toFixed(0)} mph </p>

        </li>
        <li>
            <div class="underline">Tide</div>
                <p>Best @ ${someBeach.tide}</p>
        </li>   
    </ul>   
</section>
`;
        if (hourlyRating[hour].tooWindy) {
            appTemplate += `
        <div>Sorry mate! A bit too windy to surf today...</div>
        `
        }
    }

    $('main').before(`
<header role="banner" class="nav">
<img class="navLogo left" src="images/mywave.png" alt="myWave">
    <button type="button" id="back-button" class="enjoy-css right margin-top-x1">Back</button>
</header>
`
    );
    $('.container').html(appTemplate);
    $('.loading').hide();
}

function renderHomePage() {
    $('.container').html(HOME_PAGE);
    populateLocationsDropdown();

    // This event listener renders the app with the selected beach's ratings when the user clicks "GO!"
    $('form').submit(function (event) {
        event.preventDefault();
        let chosenBeach = $('#js-locations').val()
        getApiData(chosenBeach, createResultMap);
    });
}

$(renderHomePage());

