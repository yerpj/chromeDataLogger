chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'bounds': { 'width': 620, 'height': 500 }
  });
  chrome.app.executeScript(null, {file: "scripts/main.js"});
});