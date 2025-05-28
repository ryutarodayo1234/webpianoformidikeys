const pianoroll = document.getElementById('pianoroll');
// 下から1オクターブ(12)短くする
const NOTE_MIN = 21;   // A0(21) → A1(33)
const NOTE_MAX = 108;       // C9(120)

for (let midi = NOTE_MIN; midi <= NOTE_MAX; midi++) {
  const key = document.createElement('div');
  key.className = 'roll-key';
  key.dataset.note = midi;
  // 白鍵・黒鍵の判定
  const scale = midi % 12;
  if ([1, 3, 6, 8, 10].includes(scale)) {
    key.classList.add('black');
  } else {
    key.classList.add('white');
  }
  pianoroll.appendChild(key);
}

// 光らせる関数
function highlightKey(note) {
  const el = document.querySelector(`.roll-key[data-note="${note}"]`);
  if (el) el.classList.add('active');
}
function unhighlightKey(note) {
  const el = document.querySelector(`.roll-key[data-note="${note}"]`);
  if (el) el.classList.remove('active');
}

// playNote/stopNoteをフック
const origPlayNote = window.playNote;
const origStopNote = window.stopNote;
window.playNote = function(midiNote, velocity) {
  highlightKey(midiNote);
  if (origPlayNote) origPlayNote(midiNote, velocity);
}
window.stopNote = function(midiNote) {
  unhighlightKey(midiNote);
  if (origStopNote) origStopNote(midiNote);
}
