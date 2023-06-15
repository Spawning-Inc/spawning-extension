import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom';
import '../../App.css'

type OptionsType = { images: boolean; audio: boolean; video: boolean; text: boolean; code: boolean; }
type Links = { images: string[]; audio: string[]; video: string[]; text: string[]; code: string[]; }

function App() {
  const [options, setOptions] = useState({ images: true, audio: true, video: true, text: true, code: true });
  const [urlRecords, setUrlRecords] = useState<Record<string, { links: Links; timestamp: string; currentUrl: string; }>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(
      { images: true, audio: true, video: true, text: true, code: true },
      (items) => {
        setOptions(items as OptionsType);
      }
    );

     // Fetch URL records
     chrome.storage.local.get(null, function(items) {
      const urlRecords = Object.entries(items).reduce((acc, [key, value]) => {
        if (key.startsWith('urlRecord_')) {
          acc[key.slice(10)] = value as { links: Links; timestamp: string; currentUrl: string; };
        }
        return acc;
      }, {} as Record<string, { links: Links; timestamp: string; currentUrl: string; }>);
      
      setUrlRecords(urlRecords);
    });
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
      <div id="urlRecords">
        <h2>URL Records</h2>
        {Object.entries(urlRecords).map(([id, record]) => (
          <div key={id}>
            <h3>ID: {id}</h3>
            <p>Timestamp: {record.timestamp}</p>
            <p>Current URL: {record.currentUrl}</p>
            {Object.entries(record.links).map(([type, urls]) => (
              <div key={type}>
                <h4>{type}</h4>
                {urls.map(url => <p key={url}>{url}</p>)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));

