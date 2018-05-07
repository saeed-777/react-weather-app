import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('Test updateApi function', ()=>{
	// String
	expect(App.fetchApi("asd")).equal();

	// int
	// expect(fetchApi(123)).equal();

	// //random note
	// const node = document.createElement('div')
	// expect(fetchApi(node)).equal();
});
