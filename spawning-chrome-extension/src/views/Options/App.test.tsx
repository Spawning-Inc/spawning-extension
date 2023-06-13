import React from 'react';
import * as ReactDOM from 'react-dom';
import { render, fireEvent } from '@testing-library/react';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders options correctly', () => {
  const { getByLabelText } = render(<App />);

  expect((getByLabelText(/images/i) as HTMLInputElement).checked).toEqual(true);
  expect((getByLabelText(/audio/i) as HTMLInputElement).checked).toEqual(true);
  expect((getByLabelText(/video/i) as HTMLInputElement).checked).toEqual(true);
  expect((getByLabelText(/text/i) as HTMLInputElement).checked).toEqual(true);
  expect((getByLabelText(/code/i) as HTMLInputElement).checked).toEqual(true);
});

it('checks and unchecks an option', () => {
  const { getByLabelText } = render(<App />);

  const imagesInput = getByLabelText(/images/i) as HTMLInputElement;
  fireEvent.click(imagesInput);
  expect(imagesInput.checked).toEqual(false);

  fireEvent.click(imagesInput);
  expect(imagesInput.checked).toEqual(true);
});
