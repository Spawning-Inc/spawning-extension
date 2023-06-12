import React from 'react';

function App() {
  const openOptionsPage = () => {
    window.open('/js/options.html', '_blank');
  };

  return (
    <div className="App">
      <link rel="stylesheet" href="App.css"></link>
      <body id="spawning-admin-panel">
        <div className="content">
          <span><img src="../assets/icon.svg" alt="icon" height={128} width={128} /><h1>Report Card</h1></span>
          <div id="domain_total"></div>
          <div id="images_total"></div>
          <div id="audio_total"></div>
          <div id="video_total"></div>
          <div id="text_total"></div>
          <div id="code_total"></div>
          <div id="other_total"></div>
          <div id="status_message"></div>
          <button id="go-to-options" onClick={openOptionsPage}>Go to options</button>
        </div>
      </body>
    </div>
  );
}

export default App;
