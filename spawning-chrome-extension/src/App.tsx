import React from 'react';

function App() {
  const openOptionsPage = () => {
    window.open('/js/options.html', '_blank');
  };

  return (
    <div className="App">
      Hello World
      <img src="../assets/icon.svg" alt="icon" height={256} width={256} />
      <body id="spawning-admin-panel">
        <div className="content">
          <h1>Report Card</h1>
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
        <script src="popup.js"></script>
      </body>
    </div>
  );
}

export default App;
