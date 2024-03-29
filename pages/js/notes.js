import System from "../firebase/system.js";
import {nanoid} from 'https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js'

// document.addEventListener("DOMContentLoaded", attachListeners);
// document.addEventListener("DOMContentLoaded", checkPage);
// test

const system = new System();
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let chosenLanguage = 'English'
const apiKey = '68c909dd-98ea-ec99-111c-cc629bb0a10f:fx';
const apiUrl = 'https://api-free.deepl.com/v2/translate';
const spokenLanguages = {'Deutsch': 'de-DE', 'English': 'en-US', 'Español': 'es-ES', 'Français': 'fr-FR', 'Bahasa Indonesia': 'id-ID', 'Italiano': 'it-IT', '日本語': 'ja-JP', '한국의': 'ko-KR', 'Polski': 'pl-PL', 'Português': 'pt-BR', 'Pусский': 'ru-RU', '普通话': 'zh-CN', '粤語': 'zh-HK'}
const deeplLLanguages = {'Deutsch': 'NL',    'English': 'EN',    'Español': 'ES',    'Français': 'FR',    'Bahasa Indonesia': 'ID',    'Italiano': 'IT',    '日本語': 'JA',    '한국의': 'KO',    'Polski': 'PL',    'Português': 'PT',    'Pусский': 'RU',    '普通话': 'ZH',    '粤語': 'ZH'}
// [0] = translator   [1] = spoken
const languageDropdown = document.querySelectorAll('.dropdown-content')

for (let language in spokenLanguages) {
    let elm = document.createElement('span')
    elm.classList.add('dropdown-option')
    elm.innerHTML = language
    elm.addEventListener('click', async (event) => {
        let textArea = document.querySelector('.notes textarea')
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `auth_key=${apiKey}&text=${encodeURIComponent(textArea.value)}&target_lang=${deeplLLanguages[event.target.innerHTML]}`,
        });
        const data = await response.json();
        if (response.ok) {
            textArea.value += '\n' + data.translations[0].text
        } else {
            console.error('Error:', data.message);
        }
        
    })
    languageDropdown[0].appendChild(elm)

    let elm2 = document.createElement('span')
    elm2.classList.add('dropdown-option')
    elm2.innerHTML = language
    elm2.addEventListener('click', (event) => {
        chosenLanguage = event.target.innerHTML
        var msg = new SpeechSynthesisUtterance();
        msg.text = document.querySelector('.notes textarea').value;
        // msg.text = window.getSelection().toString()
        msg.lang = spokenLanguages[chosenLanguage]
        window.speechSynthesis.speak(msg);
    })
    languageDropdown[1].appendChild(elm2)
}

let audioRecorder;
let recordedChunks = [];
// import System from "../firebase/system.js";

// const system = new System()

document.querySelector('.logout-btn').addEventListener('click', () => {
    system.signOut()
})

document.getElementById('startRecord').addEventListener('click', startRecording);
document.getElementById('stopRecord').addEventListener('click', stopRecording);
document.getElementById('saveRecord').addEventListener('click', saveRecording);

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
      audioRecorder = new MediaRecorder(stream);
      audioRecorder.ondataavailable = function (e) {
        recordedChunks.push(e.data);
      };
      audioRecorder.onstop = function () {
        const audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById('audioPlayback').src = audioUrl;
        document.getElementById('status').innerText = 'Recording Stopped';
        document.getElementById('startRecord').disabled = false;
        document.getElementById('stopRecord').disabled = true;
        document.getElementById('saveRecord').disabled = false;
      };
      audioRecorder.start();
      document.getElementById('status').innerText = 'Recording...';
      document.getElementById('startRecord').disabled = true;
      document.getElementById('stopRecord').disabled = false;
      document.getElementById('saveRecord').disabled = true;
    })
    .catch(function (err) {
      console.error('Error accessing the microphone:', err);
    });
}

function stopRecording() {
  audioRecorder.stop();
}

function saveRecording() {
  const audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
  system.store(audioBlob, 0)
  console.log("passed")
  /*const audioUrl = URL.createObjectURL(audioBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = audioUrl;
  downloadLink.download = 'recorded_audio.wav';
  downloadLink.click();
  **/
}


// notes writingg =--=-=-=-=-=-=--=-==--=-=-=-=-=-=--=-=


// function attachListeners() {
    // document.querySelector('.login_form')?.addEventListener('submit', login);
    // let logoutButton = document.querySelector('.logout');
    // if (logoutButton) {
    //     logoutButton.addEventListener('click', logout);
    // }
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(),
        scaleX = canvas.width / rect.width,
        scaleY = canvas.height / rect.height;
    
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    }
}

const note = document.querySelector('.notes textarea');
note.addEventListener('keydown', (event) => {
    saveFile();
})

let drawing = false;

let painting = false;

let penPoints = [[]];
let penColor = 'black';
let penWidth = 0.5;

let highlighterPoints = [[]];
let highlighterColor = 'yellow';
let highlighterWidth = 2;

const eraserWidth = 5; 

const tools = ['p', 'e', 'h']

let tool = tools[0];

const cursorBtn = document.querySelector('.cursor-btn');
const penBtn = document.querySelector('.pen-btn');
const eraserBtn = document.querySelector('.eraser-btn');
const highlighterBtn = document.querySelector('.highlighter-btn');

penBtn.addEventListener('click', () => {tool = tools[0];})
eraserBtn.addEventListener('click', () => {tool = tools[1];})
highlighterBtn.addEventListener('click', () => {tool = tools[2];})

cursorBtn.addEventListener('click', () => {
    if(drawing) {
        drawing = false;
        canvas.style.pointerEvents = 'none';
    } else {
        drawing = true;
        canvas.style.pointerEvents = 'auto';
    }
})

const useTools = (details) => {
    if(!drawing) {return}
    switch (tool) {
        case 'p':
            penDraw(details, penWidth, penColor);
            break;
            
        case 'e':
            eraserDraw(details);
            break;
            
        case 'h':
            highlightDraw(details, highlighterWidth, highlighterColor);
            break;
    }
}
            
const pushStroke = () => {
    if(!drawing) {return}
    switch (tool) {
        case 'p':
            penPoints.push([]);
            break;

        case 'h':
            highlighterPoints.push([]);
            break;
    }
}

const hoverTools = (details) => {
    if(!drawing) {return}
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.globalAlpha = 1;
    const {x, y} = getMousePos(canvas, details);
    switch (tool) {
        case 'p':
            // black dot
            ctx.arc(x, y, penWidth, 0, 2 * Math.PI);
            ctx.fillStyle = penColor;
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penWidth;
            ctx.fill();

            break;

        case 'e':
            // eraser
            ctx.arc(x, y, eraserWidth, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.1;
            ctx.globalAlpha = 1;
            ctx.fill();
            break;

        case 'h':
            // yellow rectangle
            ctx.rect(x - highlighterWidth/2, y - highlighterWidth/2, highlighterWidth, highlighterWidth);
            // no black border
            ctx.strokeStyle = highlighterColor;
            ctx.fillStyle = highlighterColor;
            ctx.fill();
            break;
    }
    ctx.stroke();

    // draw all strokes
    draw(penPoints, penWidth, penColor);
    draw(highlighterPoints, highlighterWidth, highlighterColor, 0.5);
}

const penDraw = (details, width, color) => {
    const currentStroke = penPoints[penPoints.length - 1];
    let {x, y} = getMousePos(canvas, details);
    currentStroke.push({x: x, y: y});
    draw(penPoints, width, color);
}

const highlightDraw = (details, width, color) => {
    const currentStroke = highlighterPoints[highlighterPoints.length - 1];
    let {x, y} = getMousePos(canvas, details);
    currentStroke.push({x: x, y: y});
    draw(highlighterPoints, width, color, 0.01);
}

const eraserDraw = (details) => {
    // go through all points and if they are within the eraser's width, remove them
    let {x, y} = getMousePos(canvas, details);
    // console.log(x, y);
    penPoints.forEach(strokes => {
        strokes.forEach((point, index) => {
            if (Math.abs(point.x - x) < eraserWidth && Math.abs(point.y - y) < eraserWidth) {
                strokes.splice(index, 1);
            }
        })
    })
    highlighterPoints.forEach(strokes => {
        strokes.forEach((point, index) => {
            if (Math.abs(point.x - x) < eraserWidth && Math.abs(point.y - y) < eraserWidth) {
                strokes.splice(index, 1);
            }
        })
    })
}
// draw on mousedown
canvas.addEventListener('mousedown', (event) => {
    painting = true;pushStroke();
});
canvas.addEventListener('mouseup', (event) => {
    painting = false;
    saveFile();
})
canvas.addEventListener('mousemove', (event) => {
    hoverTools(event);
    if (!painting) {return}
    if(!drawing) {return}
    event.preventDefault();
    useTools(event);
})

canvas.addEventListener('touchstart', (event) => {
    painting = true;pushStroke();
});
canvas.addEventListener('touchend', (event) => {
    painting = false;
    saveFile();
})
canvas.addEventListener('touchmove', (event) => {
    hoverTools(event.targetTouches[0]);
    if (!painting) {return}
    if(!drawing) {return}
    event.preventDefault();
    useTools(event.targetTouches[0]);
})

system.auth.onAuthStateChanged((user) => {
    // add files
    if (user) {
        // console.log(user)
        system.getData(system.userRef).then((snapshot) => {
            snapshot = snapshot.val();
            snapshot.notes.forEach(note => {
                addFile(note.title, note.id);
            });
        });
    }
})
system.auth.onAuthStateChanged((user) => {
    system.onAuthStateChanged(user);
})

let addButton = document.querySelector('.add_file');
if (addButton) {
    addButton.addEventListener('click', () => {
        const fileName = 'My New File'
        const content = '' 
        const id = nanoid(8)
        createNote(fileName, content, id);
        addFile(fileName, id);
    });
}
// }


const draw = (points, width, color, transparency = 1) => {
    points.forEach(strokes => {
        ctx.beginPath();
        strokes.forEach((point, index) => {
            if(index == 0){
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        })
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.globalAlpha = transparency;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 0;
        ctx.imageSmoothingEnabled = false;
        ctx.stroke();
    })
}

const createNote = async (title, content, id) => {
    console.log('creating note');
    let userData = await system.getData(system.userRef)
    userData = userData.val();
    // console.log(userData);
    userData.notes.push({
        id: id,
        title: title,
        content: content,
        timestamp: Date.now()
    });
    // console.log(userData);
    system.setData(system.userRef, userData);
}

let currentNoteId = null;
const saveFile = () => {
    if (currentNoteId === null) {return}
    const localNote = document.querySelector('.notes textarea');
    // console.log(localNote.value);
    system.getData(system.userRef).then((snapshot) => {
        snapshot = snapshot.val();
        snapshot.notes.forEach(note => {
            if (note.id === currentNoteId) {
                note.content = localNote.value;
                note.timestamp = Date.now();
                note.points = {
                    penPoints: penPoints,
                    highlighterPoints: highlighterPoints
                }
                // console.log(note.content, localNote.value)
            }
        });
        system.setData(system.userRef, snapshot);
    });
}

const openFile = (content, drawingPoints) => {
    let note = document.querySelector('.notes textarea');
    note.value = content;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    penPoints = [[]];
    highlighterPoints = [[]];

    // console.log(drawingPoints);
    if(!drawingPoints) {return}
    if(drawingPoints.penPoints) {
        penPoints = drawingPoints.penPoints;
        // turn object into array
        // check if penPoints is an array
        if(!Array.isArray(penPoints)) {
            penPoints = Object.values(penPoints);
        }
        draw(penPoints, penWidth, penColor);
    }
    if(drawingPoints.highlighterPoints) {
        highlighterPoints = drawingPoints.highlighterPoints;
        // turn object into array
        // check if highlighterPoints is an array
        if(!Array.isArray(highlighterPoints)) {
            highlighterPoints = Object.values(highlighterPoints);
        }
        draw(highlighterPoints, highlighterWidth, highlighterColor, 0.5);
    }
}
// 1701546933730
function addFile(title, id) {

    let filebar = document.querySelector('.files');
    let newFileButton = document.createElement('button');

    newFileButton.textContent = title;
    
    newFileButton.addEventListener('click', () => {
        currentNoteId = id;
        system.getData(system.userRef).then((snapshot) => {
            snapshot = snapshot.val();
            snapshot.notes.forEach(note => {
                if (note.id === id) {
                    console.log(note)
                    openFile(note.content, note.points);
                }
            });
        });
    });

    filebar.appendChild(newFileButton);
}

