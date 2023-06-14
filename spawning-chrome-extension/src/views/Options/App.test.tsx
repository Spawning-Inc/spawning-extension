import React from 'react';
import ReactDOM from 'react-dom';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

afterEach(cleanup);

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

describe('Options checkboxes', () => {
  const optionsIds = ['images', 'audio', 'video', 'text', 'code'];

  optionsIds.forEach(id => {
    test(`Checkbox with id '${id}' toggles on click`, async () => {
      const { getByLabelText } = render(<App />);

      const checkbox = getByLabelText(new RegExp(id, 'i')) as HTMLInputElement;
      const initialCheckedStatus = checkbox.checked;

      fireEvent.click(checkbox);
      expect(checkbox.checked).toEqual(!initialCheckedStatus);
    });
  });
});
