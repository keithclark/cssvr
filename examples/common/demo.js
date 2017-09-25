(function() {
  let noSleep = new NoSleep();
  let startButton = document.getElementById('start');
  let running = false;

  function toggle() {
    if (!running) {
      startButton.textContent = 'Stop';
      CSSVR.start(vrConfig);
      running = true;
    } else {
      CSSVR.stop();
      startButton.textContent = 'Start';
      running = false;
    }
  }

  function enableNoSleep() {
    noSleep.enable();
    startButton.removeEventListener('touchstart', enableNoSleep, false);
    startButton.removeEventListener('mousedown', enableNoSleep, false);
  }

  startButton.addEventListener('touchstart', enableNoSleep, false);
  startButton.addEventListener('mousedown', enableNoSleep, false);
  startButton.addEventListener('click', toggle);
}());
