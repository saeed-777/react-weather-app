import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './Layout.css';
import './Weather.css';

import Chart from './Components/Chart';

class App extends Component {

  constructor(){
    super();

    //create local states for http request data or error
    this.state = {

      // To Identify if the http request was loaded or not
      isLoaded: false,

      // To hold all the api data 
      data: null,

      // Holds the HTTP error message or a custom error message
      error: null,

      /* tabs and tabContents are responsible to hold HTML DOM elements. These are printed out in the render function */
      tabs: [],
      tabContents: [],

      /* Holds the values for the week. ex: max temperature, pressure*/
      week:{
        avgPressure: null,
        temp_max: null,
        temp_min: null
      }
    }

  }

/*
  * Below functions are to handle all events.
  * First parameter is a string to identify which method to call
  * Second parameter is the element itself where the event listener is attached; which is passed on to the method(s)
*/

/* Handles submit events. Mainly by FORMS */
  handleSubmit(method, elem){

    switch(method){
      case "api_post":
        this.fetchApi(elem);
      break;
      default: 
        return ""
    }
  }

/* Handles all on key up events */
  handleKeyUp(method, elem){
    switch(method){
      case "CITY_NAME":
        this.filterInput(elem);
      break;
      default:
        return;
    }
  }

  /*This method is used mainly by handleSubmit. Param: 'FORM' DOM Element ONLY */
  fetchApi(elem){

    //return if no element is given
    if(elem == null) return null;

    //prevent the element's default action
    elem.preventDefault();

    //return if element not FORM
    if(elem.target.nodeName !== "FORM") return null;

    var form = elem.target;

    //get formData
    var formData = new FormData(form);
    var cityName = formData.get("cityName") 

    /* Return an error message if the city name is empty */
    if(cityName === "" || cityName === null) return this.displayErrorMsg("Please enter a city name");

    this.setState({
      tabContents: "Loading..."
    });

    fetch("http://api.openweathermap.org/data/2.5/forecast?q="+cityName+"&appid=a5b6ef8dd8c8c377650a3235e6114ab7")
      .then((res)=>(res.json()))
      .then(
        (data)=>{
          console.log(data)
          this.setState({
            isLoaded: true,
            data: data
          });

          //call to update UI
          this.updateTabs();

        },
        (err)=>{
          this.setState({
            isLoaded: true,
            data: err
          });
        });
  }

  /*
  * This function is responsible to update the tabs and tab content. Once the data is loaded from the api and the states are updated, this function will use the state data to update the UI 
  */
  updateTabs(){

    // if no data was found, return empty
    if(this.state.data === null ) return;

    // if an error has occured, display the error. Error example:- "City not found".
    if(this.state.data.cod === "404" ) return this.displayErrorMsg(this.state.data.message); 
    // console.log(this.state.data);

  /* This variable holds the date in each iteration to process each day's weather
    * Example: 'dateHolder' will hold the current 'date' from the API. During the iteration,
    * if a same date is found, dateHolder will not change.
    * Once a new date is found, the variable will be updated to process the next day weather
  */
    var dateHolder = null;

    /* Unlike the state variables in the constructor, these local variables were created to prevent abusing .setState() method. These local variables will hold the contents for each iteration. Once the varibales are filled, the .setState() is called at the end (after iterations)*/
    var tabs = [];
    var tabContents = [];
    var tab_title = "";

    //Chart details 
    var labels = []; //x-axis
    var bkColour = []; //background colour for each bar
    var chart_data = []; //y-axis

    //sum 'pressure' to calculate the average pressure for the week
    var sumPressure = 0;

    //calculate max and min temperature of the week 
    var week_max_temp = -999
    var week_min_temp = 999;

    //map through the list data
    this.state.data.list.map((item, index, arr)=>{

      //hold the current date from API
      var date = new Date(item.dt_txt);

      var temp = parseInt( (item.main.temp - 273.15), 10 ); //kelvin to celcius
      var temp_max = parseInt( (item.main.temp_max - 273.15), 10 );
      var temp_min = parseInt( (item.main.temp_min - 273.15), 10 );
      var pressure = parseInt (item.main.pressure, 10);
      sumPressure += pressure; 

      if(temp_max > week_max_temp) week_max_temp = temp_max;
      if(temp_min < week_min_temp) week_min_temp = temp_min;

      //First iteration, initialise variables
      if(dateHolder === null) {

        //dateHolder holding current API date
        dateHolder = date;

        tab_title = "Today"

        //x-axis label
        labels.push(this.getFullTime(date));

        //y-axis data
        chart_data.push(temp);

        //background colour for each item
        bkColour.push(this.getTempColour(temp));

        //return to skip and go to next iteration
        return "";
      }

      //add into vairables 
      labels.push(this.getFullTime(date)); //x-axis
      chart_data.push(temp); //y-axis
      bkColour.push(this.getTempColour(temp)); //background colour

      /**compare the dates and check if it is not the last data; Skip and go to the next iteration if the API date is still the same date from the previous iteration
      * If the item is the last data in the iteration, skip this 'if' loop and proceed to print out the remaining data
      */
      if(this.getFullDate(dateHolder) === this.getFullDate(date) && index !== arr.length - 1)
        return "";

      //Calculate average for the entire week at the last iteration
      if(index === arr.length - 1){
        this.setState({
          week:{
            avgPressure: parseInt(sumPressure / arr.length, 10),
            temp_max: week_max_temp,
            temp_min: week_min_temp
          }
        });
      }

      //set the new date to process since a new date is found
      dateHolder = date; 
      
      //update the UI with current information 
      tabs.push(
        <li key={index} className="nav-item ">
          <a className={"nav-link "+(tab_title === "Today" ? "active": "")} id={"tab-"+index} data-toggle="tab" onClick={(e)=>{e.preventDefault()}} href={"#tab-content-"+index} role="tab" aria-controls={"tab-content-"+index} aria-selected="true">{tab_title}</a>
        </li>
      );

      tabContents.push(
        <div key={index} className={"tab-pane fade "+(tab_title === "Today" ? "show active": "")} id={"tab-content-"+index} role="tabpanel" aria-labelledby={"tab-"+index}>
          <h3>{tab_title} <img alt={item.weather[0].description} src={"http://openweathermap.org/img/w/"+item.weather[0].icon+".png"}/></h3>
          <div className="row">

            <div className="col-sm-3">
              <div className="row">
                <div className="col-sm-5">
                  <label>City: </label>
                  <label>Temperature: </label>
                </div>
                <div className="col-sm-7">
                  <p>{this.state.data.city.name+", "+this.state.data.city.country}</p>
                  <p>{temp}°C</p>
                </div>
              </div>
            </div>

            <div className="col-sm-5">
              <div className="row">
                <div className="col-sm-5">
                  <label>Max Temperature: </label>
                  <label>Min Temperature: </label>
                </div>
                <div className="col-sm-7">
                  <p>{temp_max}°C</p>
                  <p>{temp_min}°C</p>
                </div>
              </div>
            </div>

            <div className="col-sm-4">
              <div className="row">
                <div className="col-sm-6">
                  <label>Pressure: </label>
                </div>
                <div className="col-sm-6">
                  <p>{pressure}</p>
                </div>
              </div>
            </div>
          </div>
          <Chart labels={labels} data={chart_data} backgroundColour={bkColour} />
        </div>
      );

      //update the title to a date
      tab_title =this.getDayName(dateHolder.getDay())+", "+ this.getFullDate(dateHolder);

      //empty vairables once used
      labels = [];
      chart_data = [];

      return "";
    });


    //update the tab headers and contents
    this.setState({
      tabs: tabs,
      tabContents: tabContents
    });

  }

  displayErrorMsg(msg){
    alert(msg)
  }

  /* This method is to print out date only in a 'dd/mm/yyyy' format*/
  getFullDate(date){
    var dd = date.getDate();
    var mm = date.getMonth()+1; //January is 0!
    var yyyy = date.getFullYear();

    if(dd<10) dd='0'+dd;

    if(mm<10) mm='0'+mm; 

    return  dd+'/'+mm+'/'+yyyy;
  }

  /* This method is to print out the time only in a 'HH:MM:SS' format */
  getFullTime(date){

    var HH = date.getHours();
    var MM = date.getMinutes(); 
    var SS = date.getSeconds(); 

    if(HH < 10) HH = "0"+HH;

    if(MM < 10) MM = "0"+MM;

    if(SS < 10) SS = "0"+SS;

    return HH+":"+MM+":"+SS;
  }

  /*
  * This function represents each temperature's colour
  */
  getTempColour(temp){
    if(temp === null) return null;

    if(temp >= 40 ) return "#f50200";
    if(temp >= 35 ) return "#f76201";
    if(temp >= 30 ) return "#f7c803";
    if(temp >= 25 ) return "#98c604";
    if(temp >= 20 ) return "#007d00";
    if(temp >= 15 ) return "#31c8cb";
    if(temp >= 10 ) return "#93c9f7";
    if(temp >= 5 ) return "##3062f6";
    if(temp >= 0 ) return "#0001f6";
    if(temp >= -5 ) return "#000080";
    if(temp >= -10 ) return "#302e98";
    if(temp >= -15 ) return "##2e2e32";
    if(temp >= -20 ) return "#000000";
    if(temp < -20 ) return "#000000";

  }

  /* This method takes the day number from date.getDay() (javascript method) and converts to string day name*/
  getDayName(i){
    if(i === null) return null;
    if (i !== parseInt(i, 10)) return null; //return null if not int
    if(i >= 7 ) return null; //return null if 'i' is equal or more than 7
    var weekday = new Array(7);
    weekday[0] =  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    return weekday[i];
  }

  /*
  * This is a onKeyUp event method. For each time a user type, an API is called to find a suitable result.
  * The parameter is the input DOM. 
  * The API does NOT support auto-complete feature. It shows the exact results of the input value. It also shows the same city name in different countries
  */
  filterInput(elem){
    if(elem === null ) return;

    var input, filter, div, i, a;
    input = elem.target;
    filter = input.value.toUpperCase();

    // Variable to display the city list
    div = document.getElementById("cityList");

    
    fetch("http://api.openweathermap.org/data/2.5/find?q="+filter+"&appid=a5b6ef8dd8c8c377650a3235e6114ab7")
    .then((res)=>(res.json()) )
    .then(
      (data)=>{
        // console.log(data)

        //make sure the filtering doesn't work if the code is not 400(HTTP Error code)
        if(data.cod !== "400"){
          div.innerHTML = "";
          for (i = 0; i < data.list.length; i++) {
            a = document.createElement("button");
            a.className = "dropdown-item";
            a.type= 'button';
            a.onclick = this.updateCityName.bind(this, a);
            a.innerHTML = data.list[i].name+", "+data.list[i].sys.country;
            div.appendChild(a);
          }
        }
      },
      (err)=>{
        console.log(err)
      }
    )
  }

  //A simple function to update the input DOM. It gets the innerHTML of the btn passed and replaces the input DOM value with it
  updateCityName(btn, event){
    var input = document.getElementById("cityName");
    input.value = btn.innerHTML;

  }

  /*This method displays the weekly stat*/
  getWeekStats(){
    return(
      <div className="col-sm-12">

        <h5>This week summary: </h5>
        <table className="table">
          <tbody>
            <tr>
              <th>Average Pressure</th>
              <th>Highest Temperature</th>
              <th>Lowest Temperature</th>
            </tr>
            <tr>
              <td>{this.state.week.avgPressure}</td>
              <td>{this.state.week.temp_max}°C</td>
              <td>{this.state.week.temp_min}°C</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Weather-App built using ReactJS</h1>
          <h5>Author: Saeed Alam</h5>
        </header>

        <div className="container">
          <div className="row">
            <div className="col-sm-12 padding-3">
              <h3>Search Weather by City Name </h3>
              <form onSubmit={this.handleSubmit.bind(this, "api_post")}>
                <div className="form-row">
                  <div className="form-group col-sm-6">
                    <label htmlFor="cityName">City</label>
                    <div className="dropdown">
                      <input type="text" id="cityName" name="cityName" onKeyUp={this.handleKeyUp.bind(this, "CITY_NAME")} placeholder="Enter City Name" className="form-control dropdown-toggle"  data-toggle="dropdown" />
                      <div className="dropdown-menu" id="cityList" aria-labelledby="cityName">
                      </div>
                    </div>
                  </div>
                  <div className="form-group col-sm-6">
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" >Search</button>
              </form>
            </div>

            { (this.state.week.avgPressure === null? "": this.getWeekStats() )}

            <div className="col-sm-12 weather-container">

              <ul className="nav nav-tabs" id="myTab" role="tablist">
                { this.state.tabs }
              </ul>
              <div className="tab-content" id="myTabContent">
                { this.state.tabContents }
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
