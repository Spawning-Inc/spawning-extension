import React from 'react';

function App() {

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
          <div id="download_button"></div>
        </div>
      </body>
    </div>
  );
}

export default App;
