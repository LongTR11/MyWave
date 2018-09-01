# myWave
https://mywave-inc.herokuapp.com

myWave is an application where the user selects a beach location from the dropdown given, and a zero to five rating is displayed for the surf quality of the chosen beach. 

![home page](https://github.com/LongTR11/MyWave/blob/master/screenshots/my-wave-screenshot1.PNG)

The rating displayed comes from the next upcoming hour. If the JSON data is missing necessary stats, then the app will formulate a rating for the next soonest hour. If no there is not enough to data to calculate a rating within six hours of the current time, an apologetic rating is displayed to the user. 

![no data screen](https://github.com/LongTR11/MyWave/blob/master/screenshots/my-wave-screenshot2.PNG)

Along with a zero to five star rating is some additional key information is displayed for the surfer who wants to know how we come up with this rating. This information includes the swell(or wave) height and period, the wind speed and direction, and the tide(s) for which the chosen beach typically produces the best surfing conditions. 

To get an initial rating, we multiply the swell height by the period. Then, depending on the wind conditions, we either add or subtract stars accordingly. Wind is most always bad for surfing, but in some cases can actually help waves grow larger. If the wind speed is too high, it will let the user know. 

![standard page](https://github.com/LongTR11/MyWave/blob/master/screenshots/my-wave-screenshot3.PNG)

This is a list of ALL factors taken into consideration with the rating:
    
    - Swell Height
    - Swell Period
    - Swell Direction                  
    - Wind Speed
    - Wind Direction

![Too windy message](https://github.com/LongTR11/MyWave/blob/master/screenshots/my-wave-screenshot4.PNG)

If the user so chooses, he/she may use the back button to return to the home page and view the conditions at a different location. 