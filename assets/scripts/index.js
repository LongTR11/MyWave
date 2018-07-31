function getApiData(beach, callback) {
    let beachData = SPOTS.find(function (b) {
        return b.name === beach;
    });

    let currentTime = new Date().getTime();
     console.log(currentTime);
    $.ajax({
        url: `http://localhost:3000/point?lat=${beachData.lat}&lng=${beachData.lng}&start=${currentTime}`,
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
    getApiData(chosenBeach, twoDaysData);
})

const timeMap = {
    dayOne: [6, 9, 12, 15, 18, 20,],
    dayTwo: [30, 33, 36, 39, 42, 44]
}

function twoDaysData(data) {
    data = JSON.parse(data);
    let dayOneData = [];
    timeMap.dayOne.forEach(function (hour) {
        dayOneData.push(data.hours[hour])
    })
    let dayOneResultMap = dayOneData.map(function (d) {
        let initialWaveRating = d.swellPeriod[1].value * (d.swellHeight[1].value) * 3.28084;
        // 3.28084 is the conversion for meters to feet
        let swellDirection = d.swellDirection[1].value;
        let windSpeed = d.windSpeed[1].value;
        let windDirection = d.windDirection[1].value;


        return {
            initialWaveRating, swellDirection, windSpeed, windDirection
        };
    })
    let dayTwoData = [];
    timeMap.dayTwo.forEach(function (hour) {
        dayTwoData.push(data.hours[hour])
    })
    let dayTwoResultMap = dayTwoData.map(function (d) {
        let initialWaveRating = d.swellPeriod[1].value * (d.swellHeight[1].value + 1) * 3.28084;
        // 3.28084 is the conversion for meters to feet
        let swellDirection = d.swellDirection[1].value;
        let windSpeed= d.windSpeed[1].value;
        let windDirection = d.windDirection[1].value;


        return {
            initialWaveRating, swellDirection, windSpeed, windDirection
        };
    })
    console.log(data);
    console.log(dayOneResultMap);
    beginnerTemplate(dayOneResultMap);
}
populateLocationsDropdown();

// Put all math conditional stuff in here 
function createRatingData(results) {
    let ratingFormula = {};
    const indexMap = {0: '6:00 AM', 1: '9:00 AM', 2: '12:00 PM', 3: '3:00 PM', 4: '6:00 PM', 5:'8:00 PM'};
    for (let h=0; h < results.length; h++) {
        ratingFormula[indexMap[h]] = Math.round(3 + results[h].initialWaveRating / 8);
    }
    return ratingFormula;
}

function ratingTemplate(rating) {
    let template = '';
    for (let i=0; i < rating; i++) {
        template += `
         <span><img class="star-image" src="images/starRating.jpeg"></span>
        `;
    }
    return template;
}

// This template displays beginner-level content on the UI. This is the default view.
function beginnerTemplate(dayOneResults) { 
    let dayOneTemplate = `
    <section role="section" class="container-left">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam semper gravida est, eu ultricies mauris sodales
        ac. Quisque auctor urna lectus, eu ultrices massa dapibus id. Donec in eros velit. Vestibulum pretium
        luctus turpis in feugiat. Sed eleifend viverra metus eget sollicitudin. Proin eu felis nisi. Vestibulum
        vel lobortis purus, et maximus nisl. Maecenas volutpat rhoncus consectetur. Nulla molestie ex in dapibus
        consectetur. Cras maximus sem non nulla varius, in pulvinar tortor placerat. Donec at convallis lectus,
        vel pharetra lorem. Ut hendrerit nunc elit, at placerat leo dignissim et. Mauris sagittis arcu non risus
        sagittis luctus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
        Donec tincidunt quis augue eu rutrum. Vivamus convallis ante lacus, a tempus ante gravida ut. Integer
        sed orci ac libero porta consequat at a dui. Vestibulum venenatis neque et finibus iaculis. Etiam porttitor
        felis et lorem convallis, at sodales nisi volutpath</p>
</section>
<section role="section">
    <ul class="info-boxes>
        <li>Swell</li>
        <li>Size</li>
        <li>Direction</li>
        <li>Tide</li>
    </ul>   
</section>
`;
    let dayOneRating = createRatingData(dayOneResults);
    for (let hour in dayOneRating) {
        dayOneTemplate += `
            <div>${hour}: ${ratingTemplate(dayOneRating[hour])}</div>
        `;
    }
    $('.container').html(dayOneTemplate);
}


    

function applyWaveRating() {
    // if initialWaveRating
}

// If desired, the user can opt to view a more in-depth version of the same content by clicking a hyperlink.
function advancedTemplate() {

}

// function renderResults(result) {
//     return `
//     <div>
//         <img class='js-thumbnail-image' src='${result.snippet.thumbnails.medium.url}'/>
//     </div>
//     `;


