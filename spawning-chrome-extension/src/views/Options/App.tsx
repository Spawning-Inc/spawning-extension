import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom';
import '../App.css'

type OptionsType = { images: boolean; audio: boolean; video: boolean; text: boolean; code: boolean; }

function App() {
  const [options, setOptions] = useState({ images: true, audio: true, video: true, text: true, code: true });
  const [status, setStatus] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(
      { images: true, audio: true, video: true, text: true, code: true },
      (items) => {
        setOptions(items as OptionsType);
      }
    );
  }, []);

  const saveOptions = () => {
    chrome.storage.sync.set(
      { ...options },
      () => {
        setStatus('Options saved.');
        setTimeout(() => {
          setStatus('');
        }, 750);
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({
      ...options,
      [e.target.id]: e.target.checked
    });
  };

  return (
    <div id="spawning-admin-panel">
      <h1>Wtaf</h1>
      <label>
        <input type="checkbox" id="images" checked={options.images} onChange={handleChange} />
        Images
      </label>
      <br />
      <label>
        <input type="checkbox" id="audio" checked={options.audio} onChange={handleChange} />
        Audio
      </label>
      <br />
      <label>
        <input type="checkbox" id="video" checked={options.video} onChange={handleChange} />
        Video
      </label>
      <br />
      <label>
        <input type="checkbox" id="text" checked={options.text} onChange={handleChange} />
        Text
      </label>
      <br />
      <label>
        <input type="checkbox" id="code" checked={options.code} onChange={handleChange} />
        Code
      </label>
      <div id="status">{status}</div>
      <button id="save" onClick={saveOptions}>Save</button>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));

