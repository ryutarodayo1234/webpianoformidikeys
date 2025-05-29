const AudioContextFunc = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContextFunc();
const player = new WebAudioFontPlayer();
let instrument = _tone_0000_JCLive_sf2_file;

// マスターボリュームノードを作成
const masterGain = audioContext.createGain();
masterGain.gain.value = 1.0; // 初期値100%
masterGain.connect(audioContext.destination);

player.loader.decodeAfterLoading(audioContext, instrument);

// 音源読み込みボタン用
async function loadInstrument() {
  // 音量を0に
  const prevVolume = masterGain.gain.value;
  masterGain.gain.value = 0.0;

  // ローディングスピナー表示
  document.getElementById('loading-spinner').style.display = 'flex';

  // 音源ロード
  await player.loader.decodeAfterLoading(audioContext, instrument);

  // 88鍵すべてを順に鳴らす
  const NOTE_MIN = 21; // A0
  const NOTE_MAX = 108; // C8
  const velocity = 100;
  const duration = 0.1; // 秒
  const delay = 0.03; // 秒

  let now = audioContext.currentTime + 0.1;
  for (let midiNote = NOTE_MIN; midiNote <= NOTE_MAX; midiNote++) {
    player.queueWaveTable(audioContext, masterGain, instrument, now, midiNote, duration, velocity / 127);
    now += delay;
  }

  // 全ての鍵盤を押し終わった後に音量を戻す
  setTimeout(() => {
    masterGain.gain.value = prevVolume;
    // ローディングスピナー非表示
    document.getElementById('loading-spinner').style.display = 'none';
    // alert("音源を読み込みました！"); // ポップアップを削除
  }, ((NOTE_MAX - NOTE_MIN + 1) * delay + duration) * 1000);
}

// マスターボリューム変更用
function setMasterVolume(value) {
  masterGain.gain.value = value;
}

// MIDI入力対応
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
  for (let input of midiAccess.inputs.values()) {
    input.onmidimessage = onMIDIMessage;
  }
}

function onMIDIFailure() {
  console.warn("MIDIデバイスが見つかりませんでした");
}

function onMIDIMessage(event) {
  const [status, note, velocity] = event.data;
  const command = status & 0xf0;
  if (command === 0x90 && velocity > 0) {
    playNote(note, velocity);
  } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    stopNote(note);
  }
}

function playNote(midiNote = 60, velocity = 127) {
  const now = audioContext.currentTime;
  player.queueWaveTable(audioContext, masterGain, instrument, now, midiNote, 1.5, velocity / 127);
}

function stopNote(midiNote = 60) {
  // WebAudioFontはnoteOff不要ですが、必要ならここに記述
}

// グローバル公開
window.loadInstrument = loadInstrument;
window.setMasterVolume = setMasterVolume;