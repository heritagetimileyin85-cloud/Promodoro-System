// ----- TABS -----

// Show today's date at the top
var today = new Date();
document.getElementById("today").textContent = today.toDateString();

// Find the buttons and pages on the screen
var timerTab = document.getElementById("timerTab");
var habitsTab = document.getElementById("habitsTab");
var timerPage = document.getElementById("timerPage");
var habitsPage = document.getElementById("habitsPage");

// Show the timer page and hide the habits page
function showTimer() {
  timerPage.classList.remove("hidden");
  habitsPage.classList.add("hidden");
  timerTab.classList.add("active");
  habitsTab.classList.remove("active");
}

// Show the habits page and hide the timer page
function showHabits() {
  habitsPage.classList.remove("hidden");
  timerPage.classList.add("hidden");
  habitsTab.classList.add("active");
  timerTab.classList.remove("active");
}

// When a tab is clicked, run the matching function
timerTab.onclick = showTimer;
habitsTab.onclick = showHabits;


// ----- HABITS -----

// This list holds all the habits. Each habit looks like { name: "Read" }
var habits = [];

// Find the habit parts on the screen
var habitInput = document.getElementById("habitInput");
var addButton = document.getElementById("addButton");
var habitList = document.getElementById("habitList");

var habitList = document.getElementById("habitList");
var weekSummary = document.getElementById("weekSummary");

// Save the habits in the browser so they are still here after a refresh
function saveHabits() {
  localStorage.setItem("myHabits", JSON.stringify(habits));
}

// Get the saved habits back when the page opens
function loadHabits() {
  var saved = localStorage.getItem("myHabits");
  if (saved) {
    habits = JSON.parse(saved);
  }

  // Habits saved in step 2 have no doneDays yet, so give each one an empty list
  for (var i = 0; i < habits.length; i++) {
    if (!habits[i].doneDays) {
      habits[i].doneDays = {};
    }
  }
}

// Draw the whole list on the screen
function drawHabits() {
  habitList.innerHTML = "";

  for (var i = 0; i < habits.length; i++) {
    habitList.appendChild(makeRow(i));
  }

  drawSummary();
}

// Write any date like 2026-10-15, used as the label for "done" days
function dateKey(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }

  return year + "-" + month + "-" + day;
}

// Today's date label
function todayKey() {
  return dateKey(new Date());
}

// The date from some days ago. daysAgo(0) is today, daysAgo(1) is yesterday
function daysAgo(howMany) {
  var date = new Date();
  date.setDate(date.getDate() - howMany);
  return date;
}

// The letters shown on the small day boxes (Sunday is first)
var dayLetters = ["S", "M", "T", "W", "T", "F", "S"];

// Count how many days in a row this habit was done
function countStreak(habit) {
  var streak = 0;
  var daysBack = 0;

  // If today is not done yet, start counting from yesterday
  if (!habit.doneDays[dateKey(daysAgo(0))]) {
    daysBack = 1;
  }

  // Keep going back one day at a time while the days are done
  while (habit.doneDays[dateKey(daysAgo(daysBack))]) {
    streak = streak + 1;
    daysBack = daysBack + 1;
  }

  return streak;
}

// Build one small box for one day. Clicking it marks or unmarks that day
function makeDayBox(index, date) {
  var key = dateKey(date);
  var box = document.createElement("button");

  box.className = "dayBox";
  box.textContent = dayLetters[date.getDay()];

  if (habits[index].doneDays[key]) {
    box.classList.add("isDone");
  }
  if (key === todayKey()) {
    box.classList.add("isToday");
  }

  box.onclick = function () {
    toggleDay(index, key);
  };

  return box;
}

// Build one row of the list: name, streak, button, and the last 7 days
function makeRow(index) {
  var habit = habits[index];
  var item = document.createElement("li");

  // The top line: name and streak on the left, button on the right
  var topLine = document.createElement("div");
  topLine.className = "rowTop";

  var left = document.createElement("div");

  var nameText = document.createElement("span");
  nameText.textContent = habit.name;

  var streakText = document.createElement("div");
  streakText.className = "streak";
  streakText.textContent = countStreak(habit) + " day streak";
  if (habit.focusTarget > 0) {
    streakText.textContent = streakText.textContent + " \u00b7 auto-ticks after " + habit.focusTarget + " focus sessions";
  }

  left.appendChild(nameText);
  left.appendChild(streakText);

  var button = document.createElement("button");
  button.className = "doneButton";

  if (habit.doneDays[todayKey()]) {
    button.textContent = "Done today";
    button.classList.add("isDone");
  } else {
    button.textContent = "Mark done";
  }

  button.onclick = function () {
    toggleDay(index, todayKey());
  };

  topLine.appendChild(left);
  topLine.appendChild(button);

  // The last 7 days, oldest on the left and today on the right
  var week = document.createElement("div");
  week.className = "week";

  for (var i = 6; i >= 0; i--) {
    week.appendChild(makeDayBox(index, daysAgo(i)));
  }

   // Small buttons under the week: rename the habit or delete it
  var actions = document.createElement("div");
  actions.className = "actions";

  var renameButton = document.createElement("button");
  renameButton.className = "actionButton";
  renameButton.textContent = "Rename";
  renameButton.onclick = function () {
    renameHabit(index);
  };

  var deleteButton = document.createElement("button");
  deleteButton.className = "actionButton deleteButton";
  deleteButton.textContent = "Delete";
  deleteButton.onclick = function () {
    deleteHabit(index);
  };

  actions.appendChild(renameButton);
  actions.appendChild(deleteButton);

  item.appendChild(topLine);
  item.appendChild(week);
  item.appendChild(actions);
  return item;
}


// Mark a day as done, or take it back if it was already done
function toggleDay(index, key) {
  var days = habits[index].doneDays;

  if (days[key]) {
    delete days[key];
  } else {
    days[key] = true;
  }

  saveHabits();
  drawHabits();
}
// Give a habit a new name. The streak and the ticked days stay as they are
function renameHabit(index) {
  var newName = prompt("New name for this habit:", habits[index].name);

  // The person pressed Cancel
  if (newName === null) {
    return;
  }

  newName = newName.trim();

  // An empty name is not allowed, so keep the old one
  if (newName === "") {
    return;
  }

  habits[index].name = newName;
  saveHabits();
  drawHabits();
}

// Delete a habit, but only after the person says yes
function deleteHabit(index) {
  var sure = confirm("Delete \"" + habits[index].name + "\" and its streak?");

  if (!sure) {
    return;
  }

  habits.splice(index, 1);
  saveHabits();
  drawHabits();
}

// The number box: how many focus sessions tick the habit by itself
var targetInput = document.getElementById("targetInput");

// Add a new habit from the text box
function addHabit() {
  var name = habitInput.value.trim();

  // If the box is empty, do nothing
  if (name === "") {
    return;
  }

  // 0 means the person ticks the habit themselves
  var target = parseInt(targetInput.value, 10);
  if (isNaN(target) || target < 0) {
    target = 0;
  }
  if (target > 12) {
    target = 12;
  }

  habits.push({ name: name, doneDays: {}, focusTarget: target });
  habitInput.value = "";
  targetInput.value = "0";

  saveHabits();
  drawHabits();
}

// Click the button, or press Enter in the box, to add a habit
addButton.onclick = addHabit;
habitInput.onkeydown = function (event) {
  if (event.key === "Enter") {
    addHabit();
  }
};

// When the page opens: load saved habits and show them
loadHabits();
drawHabits();


// ----- TIMER -----

// How many minutes each mode lasts
var focusMinutes = 25;
var shortMinutes = 5;
var longMinutes = 15;

var currentMode = "focus";          // "focus", "short" or "long"
var secondsLeft = focusMinutes * 60;
var timerId = null;                 // null means the timer is not running
var endTime = 0;                    // the clock time when the timer will reach zero

// Find the timer parts on the screen
var timeLeftText = document.getElementById("timeLeft");
var startButton = document.getElementById("startButton");
var resetButton = document.getElementById("resetButton");
var timerMessage = document.getElementById("timerMessage");
var focusModeButton = document.getElementById("focusMode");
var shortModeButton = document.getElementById("shortMode");
var longModeButton = document.getElementById("longMode");

// How many seconds the current mode lasts in total
function fullSeconds() {
  if (currentMode === "short") {
    return shortMinutes * 60;
  }
  if (currentMode === "long") {
    return longMinutes * 60;
  }
  return focusMinutes * 60;
}

// The ring that shows how much of the time is left
var ringFront = document.getElementById("ringFront");
var ringLength = 2 * Math.PI * 90;      // the length of the circle line

// Colours for each mode
function modeColor() {
  if (currentMode === "short") {
    return "#1f8f86";
  }
  if (currentMode === "long") {
    return "#4a56c9";
  }
  return "#e8523f";
}

// Draw the ring: full at the start, empty when the time is up
// (the colour of the ring now comes from style.css)
function drawRing() {
  var timeUsed = 1 - secondsLeft / fullSeconds();

  ringFront.style.strokeDasharray = ringLength;
  ringFront.style.strokeDashoffset = ringLength * timeUsed;
}

// Show the time left, like 24:05
function drawTime() {
  var minutes = Math.floor(secondsLeft / 60);
  var seconds = secondsLeft % 60;

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  timeLeftText.textContent = minutes + ":" + seconds;
  drawRing();
}

// Highlight the button of the mode we are in
function highlightMode() {
  // The page colour follows the mode: mode-focus, mode-short or mode-long
  document.body.classList.remove("mode-focus");
  document.body.classList.remove("mode-short");
  document.body.classList.remove("mode-long");
  document.body.classList.add("mode-" + currentMode);

  focusModeButton.classList.remove("active");
  shortModeButton.classList.remove("active");
  longModeButton.classList.remove("active");

  if (currentMode === "short") {
    shortModeButton.classList.add("active");
  } else if (currentMode === "long") {
    longModeButton.classList.add("active");
  } else {
    focusModeButton.classList.add("active");
  }
}

// Stop the clock from ticking
function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
  document.body.classList.remove("running");
}

// Work out how many seconds are left, using the real clock
function updateSecondsLeft() {
  var now = new Date().getTime();
  secondsLeft = Math.ceil((endTime - now) / 1000);
}

// This runs again and again while the timer is running
function tick() {
  updateSecondsLeft();

  if (secondsLeft <= 0) {
    finishTimer();
    return;
  }

  drawTime();
}

// Start the timer, or continue it after a pause
function startTimer() {
  endTime = new Date().getTime() + secondsLeft * 1000;
  timerId = setInterval(tick, 250);
  document.body.classList.add("running");
  startButton.textContent = "Pause";
  timerMessage.textContent = "";
}

// Pause the timer but keep the time that is left
function pauseTimer() {
  updateSecondsLeft();
  stopTimer();
  drawTime();
  startButton.textContent = "Resume";
  timerMessage.textContent = "Paused.";
}

// Switch to another mode and start it from the full time
function changeMode(newMode) {
  stopTimer();
  currentMode = newMode;
  secondsLeft = fullSeconds();
  highlightMode();
  drawTime();
  startButton.textContent = "Start";
  timerMessage.textContent = "";
  updateMusic();
}

// ----- SESSIONS -----

// How many focus sessions were finished each day, like { "2026-10-15": 3 }
var sessionsByDay = {};

// How many focus sessions were finished in total. Every 4th one earns a long break
var finishedTotal = 0;

// Find the session parts on the screen
var sessionDots = document.getElementById("sessionDots");
var sessionText = document.getElementById("sessionText");

// Save the session numbers in the browser
function saveSessions() {
  localStorage.setItem("mySessions", JSON.stringify(sessionsByDay));
  localStorage.setItem("myFinishedTotal", String(finishedTotal));
}

// Get the saved session numbers back when the page opens
function loadSessions() {
  var saved = localStorage.getItem("mySessions");
  if (saved) {
    sessionsByDay = JSON.parse(saved);
  }

  var total = localStorage.getItem("myFinishedTotal");
  if (total) {
    finishedTotal = parseInt(total, 10);
  }
}

// How many focus sessions were finished today
function sessionsToday() {
  var count = sessionsByDay[todayKey()];

  if (!count) {
    return 0;
  }
  return count;
}

// Draw the dots: one filled dot for each finished session (at least 4 dots)
function drawSessions() {
  var done = sessionsToday();
  var dotsToShow = 4;

  if (done > dotsToShow) {
    dotsToShow = done;
  }

  sessionDots.innerHTML = "";

  for (var i = 0; i < dotsToShow; i++) {
    var dot = document.createElement("span");
    dot.className = "sessionDot";

    if (i < done) {
      dot.classList.add("filled");
    }

    sessionDots.appendChild(dot);
  }

  if (done === 1) {
    sessionText.textContent = "1 focus session finished today";
  } else {
    sessionText.textContent = done + " focus sessions finished today";
  }
}

// Tick the habits that are set to auto-tick, once enough sessions are finished today
function autoTickHabits() {
  var done = sessionsToday();

  for (var i = 0; i < habits.length; i++) {
    var target = habits[i].focusTarget;

    if (target > 0 && done >= target) {
      habits[i].doneDays[todayKey()] = true;
    }
  }

  saveHabits();
  drawHabits();
}

// The time ran out: count the session, go to the next mode, and wait for Start
function finishTimer() {
  playChime();

  if (currentMode === "focus") {
    // A focus session was finished, so count it
    var key = todayKey();
    sessionsByDay[key] = sessionsToday() + 1;
    finishedTotal = finishedTotal + 1;

    saveSessions();
    drawSessions();
    autoTickHabits();

    // Every 4th session earns a long break
    if (finishedTotal % 4 === 0) {
      changeMode("long");
      timerMessage.textContent = "Focus time is over. You earned a long break.";
    } else {
      changeMode("short");
      timerMessage.textContent = "Focus time is over. Take a short break.";
    }
  } else {
    changeMode("focus");
    timerMessage.textContent = "Break is over. Ready for the next focus time.";
  }
}

// Start/Pause button: it does whichever one makes sense right now
startButton.onclick = function () {
  // Get the sound machine ready now, because browsers only allow it after a click
  getAudioContext();

  if (timerId === null) {
    startTimer();
  } else {
    pauseTimer();
  }
};

// Reset button: back to the full time of the current mode
resetButton.onclick = function () {
  changeMode(currentMode);
};

// The three mode buttons
focusModeButton.onclick = function () {
  changeMode("focus");
};
shortModeButton.onclick = function () {
  changeMode("short");
};
longModeButton.onclick = function () {
  changeMode("long");
};

// When the page opens, show the starting time
drawTime();

// When the page opens, load the finished sessions and show the dots
loadSessions();
drawSessions();


// ----- SOUND MACHINE -----

// The browser's sound machine. We can only make it after a click
var audioContext = null;

// Make the browser's sound machine. This only works after the person clicks something
function getAudioContext() {
  if (audioContext === null) {
    var AudioMaker = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioMaker();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

// Make 6 seconds of noise. "white" is hissy, "brown" is a deep soft rumble
function makeNoise(kind) {
  var length = audioContext.sampleRate * 6;
  var buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  var data = buffer.getChannelData(0);
  var last = 0;

  for (var i = 0; i < length; i++) {
    var random = Math.random() * 2 - 1;

    if (kind === "brown") {
      last = (last + 0.02 * random) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = random * 0.6;
    }
  }

  // Fade the very start and end, so the noise has no click when it repeats
  for (var j = 0; j < 2000; j++) {
    var fade = j / 2000;
    data[j] = data[j] * fade;
    data[length - 1 - j] = data[length - 1 - j] * fade;
  }

  return buffer;
}

// ----- MUSIC -----

// The kinds of music, in the order they show on the screen
var musicCategories = ["Cinematic", "Inspirational", "Calm", "Lo-fi"];

// All the tracks. Each chord is a list of piano-key numbers (60 is middle C, and every
// +1 is the next key up). The first number is the bass note, the rest sit above it.
// "beat" is how many seconds one beat lasts, so a bigger number means slower music.
var tracks = [
  { name: "Epic Rise", category: "Cinematic", style: "cinematic", beat: 0.95,
    chords: [[45, 57, 60, 64], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62]] },
  { name: "Dark Horizon", category: "Cinematic", style: "cinematic", beat: 1.1,
    chords: [[38, 50, 53, 57], [46, 53, 58, 62], [41, 53, 57, 60], [48, 55, 60, 64]] },
  { name: "Open Sky", category: "Cinematic", style: "cinematic", beat: 0.9,
    chords: [[48, 60, 64, 67], [43, 59, 62, 67], [45, 60, 64, 69], [41, 57, 60, 65]] },

  { name: "Rise Up", category: "Inspirational", style: "inspire", beat: 0.55,
    chords: [[48, 60, 64, 67], [43, 59, 62, 67], [45, 60, 64, 69], [41, 60, 65, 69]] },
  { name: "New Day", category: "Inspirational", style: "inspire", beat: 0.6,
    chords: [[43, 55, 59, 62], [50, 57, 62, 66], [40, 55, 59, 64], [48, 55, 60, 64]] },
  { name: "Keep Going", category: "Inspirational", style: "inspire", beat: 0.5,
    chords: [[50, 62, 66, 69], [45, 61, 64, 69], [47, 62, 66, 69], [43, 59, 62, 67]] },

  { name: "Still Water", category: "Calm", style: "calm", beat: 0.9,
    chords: [[48, 60, 64, 67, 71], [45, 57, 60, 64, 67], [41, 57, 60, 64, 65], [43, 59, 62, 64, 67]] },
  { name: "Moonlight", category: "Calm", style: "calm", beat: 1.0,
    chords: [[45, 57, 60, 64, 67], [41, 57, 60, 64, 65], [48, 60, 64, 67, 71], [43, 55, 59, 62, 66]] },

  { name: "Late Night", category: "Lo-fi", style: "lofi", beat: 0.8,
    chords: [[38, 53, 57, 60, 64], [43, 53, 59, 62, 65], [48, 55, 59, 64, 67], [45, 55, 60, 64, 67]] },
  { name: "Study Break", category: "Lo-fi", style: "lofi", beat: 0.75,
    chords: [[41, 57, 60, 64, 67], [40, 55, 59, 62, 67], [38, 53, 57, 60, 64], [48, 55, 59, 64, 67]] }
];

// How each style sounds: how bright it is (cutoff) and how much echo it has
var styles = {
  cinematic: { cutoff: 1800, echo: 0.45 },
  inspire: { cutoff: 3500, echo: 0.30 },
  calm: { cutoff: 4500, echo: 0.50 },
  lofi: { cutoff: 2400, echo: 0.30 }
};

// Add the person's own songs from mymusic.js. They all go under "My music"
if (typeof myOwnTracks !== "undefined" && myOwnTracks.length > 0) {
  musicCategories.push("My music");

  for (var m = 0; m < myOwnTracks.length; m++) {
    tracks.push({ name: myOwnTracks[m].name, category: "My music", style: "file", file: myOwnTracks[m].file });
  }
}

// What the person wants: true means "play my music"
var musicOn = false;

// "" means the person has not picked a type of music yet
var musicCategory = "";

// The name of the chosen track
var musicTrack = "Epic Rise";

// The pieces of the music that is playing right now (null when nothing plays)
var musicTimer = null;
var musicMaster = null;
var musicBus = null;
var musicCompressor = null;
var musicHiss = null;

// The player for one of the person's own songs (null when no song file plays)
var musicPlayer = null;

// The "pause during breaks" box
var pauseInBreaks = document.getElementById("pauseInBreaks");

// Where we are in the track
var nextChordTime = 0;
var chordNumber = 0;

// Find the music parts on the screen
var musicButton = document.getElementById("musicButton");
var musicNote = document.getElementById("musicNote");
var categoryList = document.getElementById("categoryList");
var trackList = document.getElementById("trackList");
var musicVolume = document.getElementById("musicVolume");

// Save the music settings in the browser (the music itself always starts off)
function saveMusicSettings() {
  var settings = {
    category: musicCategory,
    track: musicTrack,
    volume: musicVolume.value,
    pause: pauseInBreaks.checked
  };
  localStorage.setItem("myMusic", JSON.stringify(settings));
}

// Get the saved music settings back when the page opens
function loadMusicSettings() {
  var saved = localStorage.getItem("myMusic");

  if (saved) {
    var settings = JSON.parse(saved);
    musicCategory = settings.category;
    musicTrack = settings.track;
    musicVolume.value = settings.volume;
    pauseInBreaks.checked = settings.pause;
  }
}

// Find a track by its name
function findTrack(name) {
  for (var i = 0; i < tracks.length; i++) {
    if (tracks[i].name === name) {
      return tracks[i];
    }
  }
  return tracks[0];
}

// Turn a piano-key number into a sound pitch in hertz
function noteHz(key) {
  return 440 * Math.pow(2, (key - 69) / 12);
}

// Play one note: it fades in, then fades out
function playTone(hz, startTime, length, loudness, wave, attack, detune) {
  var oscillator = audioContext.createOscillator();
  oscillator.type = wave;
  oscillator.frequency.value = hz;
  oscillator.detune.value = detune;

  var fader = audioContext.createGain();
  fader.gain.setValueAtTime(0.0001, startTime);
  fader.gain.exponentialRampToValueAtTime(loudness, startTime + attack);
  fader.gain.exponentialRampToValueAtTime(0.0001, startTime + length);

  oscillator.connect(fader);
  fader.connect(musicBus);
  oscillator.start(startTime);
  oscillator.stop(startTime + length + 0.05);
}

// A soft piano-like note
function playKey(key, time, loudness) {
  playTone(noteHz(key), time, 3.2, loudness, "sine", 0.012, 0);
  playTone(noteHz(key) * 2, time, 1.1, loudness * 0.3, "sine", 0.008, 0);
}

// A bell or music-box note
function playBell(key, time, loudness) {
  var hz = noteHz(key);
  playTone(hz, time, 4, loudness, "sine", 0.006, 0);
  playTone(hz * 2.01, time, 1.8, loudness * 0.3, "sine", 0.006, 0);
  playTone(hz * 3.98, time, 0.7, loudness * 0.12, "sine", 0.004, 0);
}

// A soft held sound that swells in slowly
function playPad(key, time, length, loudness) {
  playTone(noteHz(key), time, length + 3, loudness, "sawtooth", 2.6, -7);
  playTone(noteHz(key), time, length + 3, loudness, "sawtooth", 2.6, 7);
}

// A deep note that holds
function playBass(key, time, length, loudness) {
  playTone(noteHz(key), time, length, loudness, "sine", 0.05, 0);
}

// Pick one of the chord notes at random, one octave higher
function randomTone(tones) {
  return tones[Math.floor(Math.random() * tones.length)] + 12;
}

// Cinematic: a big slow swell, with a few high piano notes
function playCinematic(bass, tones, time, beat) {
  var length = beat * 8;

  playBass(bass, time, length, 0.3);

  for (var i = 0; i < tones.length; i++) {
    playPad(tones[i], time, length, 0.05);
    playPad(tones[i] + 12, time, length, 0.025);
  }

  playKey(tones[tones.length - 1] + 12, time, 0.12);
  playKey(tones[1] + 12, time + beat * 4, 0.1);
}

// Inspirational: a bright rising and falling piano pattern over a soft pad
function playInspirational(bass, tones, time, beat) {
  var length = beat * 8;

  playBass(bass, time, length, 0.25);

  for (var i = 0; i < tones.length; i++) {
    playPad(tones[i], time, length, 0.025);
  }

  var pattern = [0, 1, 2, 3, 2, 1, 2, 1];
  var notes = [tones[0], tones[1], tones[2], tones[0] + 12];

  for (var n = 0; n < 16; n++) {
    var note = notes[pattern[n % 8]];
    playKey(note + 12, time + n * beat / 2, 0.09);
  }
}

// Calm: a quiet pad with a few bell notes at random
function playCalm(bass, tones, time, beat) {
  var length = beat * 8;

  playBass(bass, time, length, 0.2);

  for (var i = 0; i < tones.length; i++) {
    playPad(tones[i], time, length, 0.04);
  }

  for (var b = 0; b < 8; b++) {
    if (Math.random() < 0.5) {
      playBell(randomTone(tones), time + b * beat + Math.random() * 0.08, 0.18);
    }
  }
}

// Lo-fi: warm keys played twice per chord, with a few random notes on top
function playLofi(bass, tones, time, beat) {
  var length = beat * 8;

  playBass(bass, time, length * 0.95, 0.3);

  for (var round = 0; round < 2; round++) {
    for (var i = 0; i < tones.length; i++) {
      var loud = 0.12;
      if (round === 1) {
        loud = 0.08;
      }
      playKey(tones[i], time + round * beat * 4 + i * 0.045, loud);
    }
  }

  for (var b = 0; b < 8; b++) {
    if (Math.random() < 0.4) {
      playKey(randomTone(tones), time + b * beat + Math.random() * 0.06, 0.1);
    }
  }
}

// Play one chord of a track, in the style of that track
function playChord(track, chord, time) {
  var bass = chord[0];
  var tones = chord.slice(1);

  if (track.style === "cinematic") {
    playCinematic(bass, tones, time, track.beat);
  } else if (track.style === "inspire") {
    playInspirational(bass, tones, time, track.beat);
  } else if (track.style === "calm") {
    playCalm(bass, tones, time, track.beat);
  } else {
    playLofi(bass, tones, time, track.beat);
  }
}

// Keep playing chords a little ahead of time, one after the other
function scheduleMusic() {
  var track = findTrack(musicTrack);

  while (nextChordTime < audioContext.currentTime + 2.5) {
    var chord = track.chords[chordNumber % track.chords.length];
    playChord(track, chord, nextChordTime);
    chordNumber = chordNumber + 1;
    nextChordTime = nextChordTime + track.beat * 8;
  }
}

// True when any music is playing: the made-up music or one of the person's own songs
function musicIsPlaying() {
  return (musicMaster !== null || musicPlayer !== null);
}

// Play one of the person's own songs from its file, again and again
function startFileMusic(track) {
  musicPlayer = new Audio(track.file);
  musicPlayer.loop = true;
  musicPlayer.volume = musicVolume.value / 100;

  // If the file cannot be found or opened, say so on the screen
  musicPlayer.onerror = function () {
    musicNote.textContent = "Could not play " + track.name + ". Check the file name in mymusic.js.";
  };

  // play() can fail (for example when the file is missing). The message above covers that
  var attempt = musicPlayer.play();
  if (attempt !== undefined) {
    attempt.catch(function () {});
  }
}

// Start playing the chosen track
function startMusic() {
  var track = findTrack(musicTrack);

  // One of the person's own songs plays from its file, so there is nothing to make
  if (track.file) {
    startFileMusic(track);
    return;
  }

  var look = styles[track.style];

  // The main volume, then a safety limiter so it never gets too loud
  musicMaster = audioContext.createGain();
  musicMaster.gain.value = 0.0001;

  musicCompressor = audioContext.createDynamicsCompressor();
  musicCompressor.threshold.value = -20;
  musicCompressor.ratio.value = 4;

  musicMaster.connect(musicCompressor);
  musicCompressor.connect(audioContext.destination);

  // Every note goes into the bus, then through a filter that sets how bright it sounds
  musicBus = audioContext.createGain();
  musicBus.gain.value = 1.6;

  var brightness = audioContext.createBiquadFilter();
  brightness.type = "lowpass";
  brightness.frequency.value = look.cutoff;

  musicBus.connect(brightness);
  brightness.connect(musicMaster);

  // The echo: a delayed copy of the sound that repeats and gets softer
  var echo = audioContext.createDelay(2);
  echo.delayTime.value = track.beat * 0.75;

  var echoRepeat = audioContext.createGain();
  echoRepeat.gain.value = 0.4;

  var echoSoft = audioContext.createBiquadFilter();
  echoSoft.type = "lowpass";
  echoSoft.frequency.value = 1800;

  var echoLoud = audioContext.createGain();
  echoLoud.gain.value = look.echo;

  brightness.connect(echo);
  echo.connect(echoSoft);
  echoSoft.connect(echoRepeat);
  echoRepeat.connect(echo);
  echoSoft.connect(echoLoud);
  echoLoud.connect(musicMaster);

  // Lo-fi gets a little tape hiss
  if (track.style === "lofi") {
    musicHiss = audioContext.createBufferSource();
    musicHiss.buffer = makeNoise("white");
    musicHiss.loop = true;

    var hissSoft = audioContext.createBiquadFilter();
    hissSoft.type = "lowpass";
    hissSoft.frequency.value = 3200;

    var hissVolume = audioContext.createGain();
    hissVolume.gain.value = 0.02;

    musicHiss.connect(hissSoft);
    hissSoft.connect(hissVolume);
    hissVolume.connect(musicMaster);
    musicHiss.start();
  }

  // Fade the music in
  musicMaster.gain.setTargetAtTime(musicVolume.value / 100 * 0.7, audioContext.currentTime, 0.5);

  // Start at the first chord and keep scheduling more
  chordNumber = 0;
  nextChordTime = audioContext.currentTime + 0.2;
  scheduleMusic();
  musicTimer = setInterval(scheduleMusic, 400);
}

// Stop the music with a short fade out
function stopMusic() {
  if (musicMaster === null) {
    return;
  }

  clearInterval(musicTimer);
  musicTimer = null;

  // Keep the old pieces so we can switch them off after the fade
  var oldMaster = musicMaster;
  var oldCompressor = musicCompressor;
  var oldHiss = musicHiss;

  oldMaster.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.15);

  setTimeout(function () {
    oldMaster.disconnect();
    oldCompressor.disconnect();
    if (oldHiss !== null) {
      oldHiss.stop();
    }
  }, 1200);

  musicMaster = null;
  musicBus = null;
  musicCompressor = null;
  musicHiss = null;
}

// Highlight the chosen type of music and the chosen track
function highlightMusic() {
  for (var i = 0; i < categoryList.children.length; i++) {
    var categoryButton = categoryList.children[i];

    if (categoryButton.textContent === musicCategory) {
      categoryButton.classList.add("active");
    } else {
      categoryButton.classList.remove("active");
    }
  }

  for (var j = 0; j < trackList.children.length; j++) {
    var trackButton = trackList.children[j];

    if (trackButton.textContent === musicTrack) {
      trackButton.classList.add("active");
    } else {
      trackButton.classList.remove("active");
    }
  }
}

// Make the music match what the person wants, then update the screen
function updateMusic() {
  var inBreak = (currentMode !== "focus");
  var paused = musicOn && inBreak && pauseInBreaks.checked;
  var shouldPlay = musicOn && !paused;

  if (shouldPlay && musicMaster === null) {
    startMusic();
  }
  if (!shouldPlay && musicMaster !== null) {
    stopMusic();
  }

  // The little music bars only dance while music is really playing
  if (musicMaster !== null) {
    document.body.classList.add("musicPlaying");
  } else {
    document.body.classList.remove("musicPlaying");
  }

  if (musicOn) {
    musicButton.textContent = "Stop music";
  } else {
    musicButton.textContent = "Play music";
  }

  if (!musicOn && musicCategory === "") {
    musicNote.textContent = "Music is off. Pick a type of music below.";
  } else if (!musicOn) {
    musicNote.textContent = "Music is off.";
  } else if (paused) {
    musicNote.textContent = musicTrack + " is paused during this break. It comes back with the next focus time.";
  } else {
    musicNote.textContent = "Playing: " + musicTrack + ".";
  }

  highlightMusic();
}

// Make the button for one track. Tapping it plays that track
function makeTrackButton(name) {
  var button = document.createElement("button");
  button.className = "trackButton";
  button.textContent = name;

  button.onclick = function () {
    musicTrack = name;
    musicOn = true;
    saveMusicSettings();
    getAudioContext();
    stopMusic();
    updateMusic();
  };

  return button;
}

// Show the tracks of the chosen type of music
function drawTracks() {
  trackList.innerHTML = "";

  if (musicCategory === "") {
    return;
  }

  for (var i = 0; i < tracks.length; i++) {
    if (tracks[i].category === musicCategory) {
      trackList.appendChild(makeTrackButton(tracks[i].name));
    }
  }
}

// Make the button for one type of music. Tapping it shows its tracks
function makeCategoryButton(name) {
  var button = document.createElement("button");
  button.className = "soundChoice";
  button.textContent = name;

  button.onclick = function () {
    musicCategory = name;
    saveMusicSettings();
    drawTracks();
    highlightMusic();
  };

  return button;
}

// Show the buttons for the types of music
function drawCategories() {
  categoryList.innerHTML = "";

  for (var i = 0; i < musicCategories.length; i++) {
    categoryList.appendChild(makeCategoryButton(musicCategories[i]));
  }
}

// Play music / Stop music button
musicButton.onclick = function () {
  musicOn = !musicOn;

  if (musicOn) {
    getAudioContext();
  }

  updateMusic();
};

// The music volume slider changes the volume while the music plays
musicVolume.oninput = function () {
  if (musicPlayer !== null) {
    musicPlayer.volume = musicVolume.value / 100;
  }
  if (musicMaster !== null) {
    musicMaster.gain.setTargetAtTime(musicVolume.value / 100 * 0.7, audioContext.currentTime, 0.05);
  }
  saveMusicSettings();
};

// The "pause during breaks" box
pauseInBreaks.onchange = function () {
  saveMusicSettings();
  updateMusic();
};

// When the page opens: load the settings and show the music section
loadMusicSettings();
drawCategories();
drawTracks();
updateMusic();


// ----- WEEK SUMMARY -----

// Make one small tile: a big number and a label under it
function makeStat(number, label) {
  var tile = document.createElement("div");
  tile.className = "statTile";

  var bigNumber = document.createElement("div");
  bigNumber.className = "statNumber";
  bigNumber.textContent = number;

  var smallLabel = document.createElement("div");
  smallLabel.className = "statLabel";
  smallLabel.textContent = label;

  tile.appendChild(bigNumber);
  tile.appendChild(smallLabel);
  return tile;
}

// Show how the last 7 days went (today and the 6 days before it)
function drawSummary() {
  weekSummary.innerHTML = "";

  // With no habits there is nothing to add up
  if (habits.length === 0) {
    weekSummary.className = "";
    return;
  }

  weekSummary.className = "summary";

  // Count the ticked days of all habits in the last 7 days
  var ticks = 0;
  var possible = habits.length * 7;

  for (var h = 0; h < habits.length; h++) {
    for (var d = 0; d < 7; d++) {
      if (habits[h].doneDays[dateKey(daysAgo(d))]) {
        ticks = ticks + 1;
      }
    }
  }

  var percent = Math.round(ticks / possible * 100);

  // Find the longest streak among the habits
  var bestStreak = 0;
  for (var k = 0; k < habits.length; k++) {
    var streak = countStreak(habits[k]);
    if (streak > bestStreak) {
      bestStreak = streak;
    }
  }

  // Count the focus sessions of the last 7 days
  // (the sessions may not be loaded yet when the page first opens)
  var sessions = sessionsByDay || {};
  var focusDone = 0;
  for (var s = 0; s < 7; s++) {
    var count = sessions[dateKey(daysAgo(s))];
    if (count) {
      focusDone = focusDone + count;
    }
  }

  // The title and the bar that fills up with the percent
  var title = document.createElement("div");
  title.className = "summaryTitle";
  title.textContent = "Last 7 days: " + ticks + " of " + possible + " habit days done (" + percent + "%)";

  var bar = document.createElement("div");
  bar.className = "summaryBar";

  var fill = document.createElement("div");
  fill.className = "summaryFill";
  fill.style.width = percent + "%";
  bar.appendChild(fill);

  // The three tiles
  var tiles = document.createElement("div");
  tiles.className = "statTiles";
  tiles.appendChild(makeStat(percent + "%", "done"));
  tiles.appendChild(makeStat(bestStreak, "best streak"));
  tiles.appendChild(makeStat(focusDone, "focus sessions"));

  weekSummary.appendChild(title);
  weekSummary.appendChild(bar);
  weekSummary.appendChild(tiles);
}

// When the page opens, the sessions are loaded now, so draw the summary again
drawSummary();

// ----- CHIME -----

// The tick box that turns the chime on or off
var chimeBox = document.getElementById("chimeBox");

// Play one soft bell note at a chosen time
function playChimeNote(hz, time) {
  var oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = hz;

  var fader = audioContext.createGain();
  fader.gain.setValueAtTime(0.0001, time);
  fader.gain.exponentialRampToValueAtTime(0.25, time + 0.02);
  fader.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);

  oscillator.connect(fader);
  fader.connect(audioContext.destination);
  oscillator.start(time);
  oscillator.stop(time + 2);
}

// Play three rising bell notes when a timer ends
function playChime() {
  // No sound machine yet (nobody clicked anything), or the person turned the chime off
  if (audioContext === null || !chimeBox.checked) {
    return;
  }

  var now = audioContext.currentTime;
  playChimeNote(659, now);
  playChimeNote(784, now + 0.3);
  playChimeNote(988, now + 0.6);
}

// Remember if the person turned the chime off
chimeBox.onchange = function () {
  if (chimeBox.checked) {
    localStorage.setItem("myChime", "yes");
  } else {
    localStorage.setItem("myChime", "no");
  }
};

// When the page opens: bring back the chime choice
if (localStorage.getItem("myChime") === "no") {
  chimeBox.checked = false;
}