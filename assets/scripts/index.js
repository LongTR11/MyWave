function getApiData(beach, callback) {
    let beachData = SPOTS.find(function (b) {
        return b.name === beach;
    });

    // let currentTime = Math.round(new Date().getTime() / 1000);
    let currentTime = new Date();
    let currentHour = currentTime.getHours() + 2;
    currentTime.setHours(currentHour, 0, 0, 0);
    console.log(currentTime.getTime() / 1000);
    $.ajax({
        url: `http://localhost:3000/point?lat=${beachData.lat}&lng=${beachData.lng}&start=${currentTime.getTime() / 1000}`,
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
    for (let i=0; i < 5; i++) {
        dayOneData.push(data.hours[i])
    };
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
    
   
    console.log(dayOneResultMap);
    beginnerTemplate(dayOneResultMap);
}
populateLocationsDropdown();

function calculateHour(hour) {
    if (hour > 12) {
        hour = hour - 12;
    }
    return hour;
}
// Put all math conditional stuff in here 
function createRatingData(results) {
    let ratingFormula = {};
    let caurrentHour = new Date().getHours() + 1;
    const indexMap = {0: `${calculateHour(currentHour)}:00`, 1: `${calculateHour(currentHour + 1)}:00`, 2: `${calculateHour(currentHour + 2)}:00`, 3: `${calculateHour(currentHour+ 3)}:00`, 4: `${calculateHour(currentHour + 4)}:00`, 5:`${calculateHour(currentHour +5)}:00`};
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
        consectetur. Cras maximus sem non nulla varius, in pulvinar tortor placerat. Donec at </p>
</section>
<section role="section">
    <ul class="info-boxes">
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


