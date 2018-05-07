import React, { Component } from 'react';
import {Bar} from 'react-chartjs-2';

export default class Chart extends Component {
	constructor(props){
		super(props);
		this.state = {	
			chartData: {
				labels: props.labels,
		        datasets: [{
		            label: "Temperature",
		            backgroundColor: props.backgroundColour,
		            borderColor: 'rgb(255, 99, 132)',
		            data: props.data,
		        }]
			},
			options: {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true
		                }
		            }]
		        }
		    },
		    api_data: props.data
		}
	}

	componentWillReceiveProps(updateProps){
		// this.processList(updateProps.data.list)
		this.setState({
			api_data: updateProps.data,
			chartData: {
				labels: updateProps.labels,
		        datasets: [{
		            label: "Temperature",
		            backgroundColor: updateProps.backgroundColour,
		            borderColor: 'rgb(255, 99, 132)',
		            data: updateProps.data,
		        }]
			}
		});
	}

	render(){
		return(
		<div>
			<Bar data={this.state.chartData} options={this.state.options} />
		</div>
		);
	}
}