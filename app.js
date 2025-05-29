// --- Global Variables ---
let audioContext;
let masterGainNode;
const loadedSounds = {}; // Stores AudioBuffers, keyed by the absolute soundFile URL
const activeSources = {}; // Stores currently playing AudioBufferSourceNodes for choking
const loadingSpinner = document.getElementById('loading-spinner');
let midiAccessInstance = null; // Store the MIDI Access object
const absoluteBaseUrlForSounds = 'https://ryutarodayo1234.github.io/webstudiodrumsformidikeys/sounds/';

// --- Drum Instrument Mapping ---
// soundFile paths are now absolute URLs
const drumMap = {
    48: { name: 'Kick', keyBinding: 'C2', group: 'kick', indicatorStyleClass: 'key-style-kick',
        velocityLayers: [
            { maxVelocity: 80, soundFile: absoluteBaseUrlForSounds + 'kick_80.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'kick_120.mp3' }
        ]
    },
    49: { name: 'Snare Closed Rim', keyBinding: 'C#2', group: 'snare', indicatorStyleClass: 'key-style-snare',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'snareClosedRim_50.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'snareClosedRim_120.mp3' }
        ]
    },
    50: { name: 'Snare', keyBinding: 'D2', group: 'snare', indicatorStyleClass: 'key-style-snare',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'snare_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'snare_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'snare_120.mp3' }
        ]
    },
    51: { name: 'Snare Double Stroke', keyBinding: 'D#2', group: 'snare', indicatorStyleClass: 'key-style-snare',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'snareDoubleStroke_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'snareDoubleStroke_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'snareDoubleStroke_120.mp3' }
        ]
    },
    52: { name: 'Snare Rim', keyBinding: 'E2', group: 'snare', indicatorStyleClass: 'key-style-snare',
        velocityLayers: [
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'snareRim_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'snareRim_120.mp3' }
        ]
    },
    53: { name: 'Tom Low 2', keyBinding: 'F2', group: 'tomLow2', indicatorStyleClass: 'key-style-tom',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'tomLow2_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'tomLow2_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'tomLow2_120.mp3' }
        ]
    },
    54: { name: 'Closed HH', keyBinding: 'F#2', group: 'hh', indicatorStyleClass: 'key-style-hh',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'closedHH_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'closedHH_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'closedHH_120.mp3' }
        ]
    },
    55: { name: 'Tom Low 1', keyBinding: 'G2', group: 'tomLow1', indicatorStyleClass: 'key-style-tom',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'tomLow1_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'tomLow1_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'tomLow1_120.mp3' }
        ]
    },
    56: { name: 'Closed HH', keyBinding: 'G#2', group: 'hh', indicatorStyleClass: 'key-style-hh', // Shares samples with F#2
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'closedHH_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'closedHH_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'closedHH_120.mp3' }
        ]
    },
    57: { name: 'Tom Low 1', keyBinding: 'A2', group: 'tomLow1', indicatorStyleClass: 'key-style-tom', // Shares samples with G2
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'tomLow1_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'tomLow1_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'tomLow1_120.mp3' }
        ]
    },
    58: { name: 'Open HH', keyBinding: 'A#2', group: 'hh', indicatorStyleClass: 'key-style-hh',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'openHH_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'openHH_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'openHH_120.mp3' }
        ]
    },
    59: { name: 'Tom Mid', keyBinding: 'B2', group: 'tomMid', indicatorStyleClass: 'key-style-tom',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'tomMid_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'tomMid_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'tomMid_120.mp3' }
        ]
    },
    60: { name: 'Tom Mid', keyBinding: 'C3', group: 'tomMid', indicatorStyleClass: 'key-style-tom', // Shares samples with B2
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'tomMid_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'tomMid_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'tomMid_120.mp3' }
        ]
    },
    61: { name: 'Clash Cymbal', keyBinding: 'C#3', group: 'clash', indicatorStyleClass: 'key-style-cymbal',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'clashCymbal_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'clashCymbal_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'clashCymbal_120.mp3' }
        ]
    },
    62: { name: 'Tom High', keyBinding: 'D3', group: 'tomHigh', indicatorStyleClass: 'key-style-tom',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'tomHigh_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'tomHigh_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'tomHigh_120.mp3' }
        ]
    },
    63: { name: 'Ride Bow', keyBinding: 'D#3', group: 'ride', indicatorStyleClass: 'key-style-cymbal',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'rideBow_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'rideBow_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'rideBow_120.mp3' }
        ]
    },
    64: { name: 'Ride Edge', keyBinding: 'E3', group: 'ride', indicatorStyleClass: 'key-style-cymbal',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'rideEdge_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'rideEdge_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'rideEdge_120.mp3' }
        ]
    },
    65: { name: 'Ride Bell', keyBinding: 'F3', group: 'ride', indicatorStyleClass: 'key-style-cymbal',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'rideBell_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'rideBell_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'rideBell_120.mp3' }
        ]
    },
    66: { name: 'Splash Cymbal', keyBinding: 'F#3', group: 'splash', indicatorStyleClass: 'key-style-cymbal',
        velocityLayers: [
            { maxVelocity: 50, soundFile: absoluteBaseUrlForSounds + 'cymbalSplash_50.mp3' },
            { maxVelocity: 90, soundFile: absoluteBaseUrlForSounds + 'cymbalSplash_90.mp3' },
            { maxVelocity: 120, soundFile: absoluteBaseUrlForSounds + 'cymbalSplash_120.mp3' }
        ]
    }
};

const mappedMIDINotes = Object.keys(drumMap).map(Number);

// --- Audio Initialization and Loading ---
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGainNode = audioContext.createGain();
        const masterVolumeSlider = document.querySelector('input[type="range"][oninput^="setMasterVolume"]');
        masterGainNode.gain.value = masterVolumeSlider ? parseFloat(masterVolumeSlider.value) : 0.3;
        masterGainNode.connect(audioContext.destination);
        console.log("AudioContext initialized.");
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => console.log("AudioContext resumed by init."));
    }
}

async function fetchAndDecodeAudio(absoluteSoundFileUrl) {
    try {
        const response = await fetch(absoluteSoundFileUrl);
        if (!response.ok) {
            throw new Error(`Sound file not found or error loading: ${absoluteSoundFileUrl} - Status: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        loadedSounds[absoluteSoundFileUrl] = audioBuffer; // Use the absolute URL as the key
    } catch (error) {
        console.error(`Error loading sound ${absoluteSoundFileUrl}:`, error);
        throw error;
    }
}

async function loadInstrument() {
    initAudioContext();
    if (loadingSpinner) loadingSpinner.style.display = 'flex';

    const soundUrlsToLoad = new Set();
    Object.values(drumMap).forEach(instrument => {
        if (instrument.velocityLayers) {
            instrument.velocityLayers.forEach(layer => {
                soundUrlsToLoad.add(layer.soundFile); // Add the absolute URL
            });
        }
    });

    const soundPromises = [];
    soundUrlsToLoad.forEach(absoluteUrl => {
        if (!loadedSounds[absoluteUrl]) { // Check with absolute URL
            soundPromises.push(fetchAndDecodeAudio(absoluteUrl)); // Pass absolute URL
        }
    });

    try {
        await Promise.all(soundPromises);
        const allRequestedUrls = Array.from(soundUrlsToLoad); // Array of absolute URLs
        const successfullyLoadedCount = allRequestedUrls.filter(url => loadedSounds[url]).length;
        console.log(`${successfullyLoadedCount} of ${allRequestedUrls.length} unique sound files processed.`);

        if (successfullyLoadedCount < allRequestedUrls.length) {
            const missingUrls = allRequestedUrls.filter(url => !loadedSounds[url]);
            console.warn("Some sound files may have failed to load or were already missing:", missingUrls);
            if (missingUrls.length > 0) {
                alert(`Warning: ${missingUrls.length} sound file(s) failed to load. Check console for details. Missing examples: ${missingUrls.slice(0,3).join(', ')}`);
            }
        } else if (soundPromises.length > 0) {
             console.log("All newly requested sounds loaded successfully!");
        } else {
            console.log("No new sounds to load; all previously requested sounds are present.");
        }

        dimUnusedPianoKeys();
        applyKeyColorIndicators();
        if (navigator.requestMIDIAccess) {
            setupMIDIAccess(false);
        } else {
            console.warn("Web MIDI API not supported in this browser.");
            alert("Web MIDI API is not supported in your browser.");
        }
    } catch (error) {
        console.error("An error occurred during the sound loading process:", error);
        alert("An error occurred while loading sounds. Check the console for details.");
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
}

// --- UI Styling for Piano Keys ---
function dimUnusedPianoKeys() {
    const pianoKeys = document.querySelectorAll('#pianoroll .roll-key');
    pianoKeys.forEach(key => {
        const note = parseInt(key.dataset.note);
        if (!mappedMIDINotes.includes(note)) {
            key.classList.add('dimmed');
        } else {
            key.classList.remove('dimmed');
        }
    });
}

function applyKeyColorIndicators() {
    const pianoKeys = document.querySelectorAll('#pianoroll .roll-key');
    pianoKeys.forEach(key => {
        const note = parseInt(key.dataset.note);
        const instrument = drumMap[note];

        Object.values(drumMap).forEach(instr => {
            if (instr.indicatorStyleClass) key.classList.remove(instr.indicatorStyleClass);
        });

        if (instrument && instrument.indicatorStyleClass) {
            if (!key.classList.contains('dimmed')) {
                 key.classList.add(instrument.indicatorStyleClass);
            }
        }
    });
}

// --- MIDI Handling ---
function setupMIDIAccess(isInitialLoad = false) {
    if (!navigator.requestMIDIAccess) {
        if (!isInitialLoad) alert("Web MIDI API is not supported in this browser.");
        console.warn("Web MIDI API not supported in this browser.");
        return;
    }
    navigator.requestMIDIAccess()
        .then((midi) => {
            midiAccessInstance = midi;
            console.log("MIDI Access Granted!");
            bindMIDIEvents(isInitialLoad);
            midiAccessInstance.onstatechange = (event) => {
                console.log(`MIDI device state changed: ${event.port.name}, type: ${event.port.type}, state: ${event.port.state}`);
                bindMIDIEvents(true);
                dimUnusedPianoKeys();
                applyKeyColorIndicators();
            };
        })
        .catch((error) => {
            console.error("Could not access MIDI devices:", error);
            if (!isInitialLoad) alert("Could not access MIDI devices. Grant permission or check other apps.");
        });
}

function bindMIDIEvents(isInitialLoad = false) {
    if (!midiAccessInstance) return;
    const inputs = midiAccessInstance.inputs.values();
    let deviceFound = false;
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        deviceFound = true;
        input.value.onmidimessage = null;
        input.value.onmidimessage = onMIDIMessage;
        console.log(`Listening to MIDI input: ${input.value.name} (Manufacturer: ${input.value.manufacturer || 'N/A'})`);
    }
    if (!deviceFound && !isInitialLoad) {
        console.warn("No MIDI input devices found after explicit check.");
        alert("No MIDI input devices found. Connect a device; it might be detected automatically or try reloading instruments.");
    } else if (!deviceFound) {
        console.warn("No MIDI input devices found on initial check.");
    }
}

function onMIDIMessage(event) {
    if (!audioContext) {
        console.warn("AudioContext not ready for MIDI message.");
        return;
    }
    
    let soundsAvailable = false;
    const instrumentForNote = drumMap[event.data[1]];
    if (instrumentForNote && instrumentForNote.velocityLayers) {
        soundsAvailable = instrumentForNote.velocityLayers.some(layer => loadedSounds[layer.soundFile]); // Check absolute URL in loadedSounds
    }

    if (!soundsAvailable && Object.keys(loadedSounds).length === 0) {
        return;
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => console.log("AudioContext resumed by MIDI event."));
    }

    const command = event.data[0] >> 4;
    const note = event.data[1];
    const velocity = event.data[2];

    if (command === 9 && velocity > 0) { // Note On
        window.playNote(note, velocity);
    } else if (command === 8 || (command === 9 && velocity === 0)) { // Note Off
         window.stopNote(note);
    }
}

// --- Sound Playback ---
window.playNote = function(midiNote, velocity) {
    if (!audioContext || !masterGainNode) {
        console.warn("AudioContext/MasterGain not ready. Cannot play note.");
        return;
    }
    if (audioContext.state === 'suspended') {
        console.warn("AudioContext is suspended. Attempting to resume for playback.");
        audioContext.resume();
    }

    const instrument = drumMap[midiNote];
    if (instrument && instrument.velocityLayers && instrument.velocityLayers.length > 0) {
        let selectedLayer = null;
        for (const layer of instrument.velocityLayers) {
            if (velocity <= layer.maxVelocity) {
                selectedLayer = layer;
                break;
            }
        }
        if (!selectedLayer) {
            selectedLayer = instrument.velocityLayers[instrument.velocityLayers.length - 1];
        }

        const soundToPlayAbsoluteUrl = selectedLayer.soundFile; // This is the absolute URL
        const audioBufferForVelocity = loadedSounds[soundToPlayAbsoluteUrl]; // Access with absolute URL

        if (audioBufferForVelocity) {
            if (activeSources[instrument.group]) {
                try {
                    activeSources[instrument.group].stop();
                    activeSources[instrument.group].disconnect();
                } catch (e) { /* ignore if already stopped */ }
            }

            const source = audioContext.createBufferSource();
            source.buffer = audioBufferForVelocity;

            const gainNode = audioContext.createGain();
            gainNode.gain.value = Math.sqrt(velocity / 127) * 5;

            source.connect(gainNode);
            gainNode.connect(masterGainNode);
            source.start(0);
            activeSources[instrument.group] = source;
        } else {
            console.warn(`Sound buffer not found for: ${soundToPlayAbsoluteUrl} (MIDI: ${midiNote}, vel: ${velocity}). Ensure it loaded correctly.`);
        }
    } else if (instrument) {
        console.warn(`No velocity layers defined or found for instrument: ${instrument.name} (MIDI: ${midiNote})`);
    }
};

window.stopNote = function(midiNote) {
    // For pianoroll.js to unhighlight its key (or other note off actions)
};

// --- Master Volume Control ---
function setMasterVolume(value) {
    if (masterGainNode) {
        masterGainNode.gain.value = parseFloat(value);
    } else if (audioContext) {
        console.warn("Master gain node not ready, but volume changed. Volume will be applied once ready if initAudioContext is called again or masterGainNode is created.");
    }
}

// --- Event Listeners & Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    setupMIDIAccess(true);
    dimUnusedPianoKeys();
    applyKeyColorIndicators();
});

window.loadInstrument = loadInstrument;
window.setMasterVolume = setMasterVolume;