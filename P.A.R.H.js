javascript:(() => {
let startTime = Date.now();
let canRead = true;
let reading = new Map();
let linkCounter = 0;
let selectedParagraphs = [];

function addLink(el) {
    if(!el.id) {
        el.id = `link-${linkCounter++}`;
    }
    return el.id;
}


const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        let el = entry.target;

        if(!reading.has(el)) {
            addLink(el);
            reading.set(el, { time: 0, timer: null });
        }
        const state = reading.get(el);
        if(entry.isIntersecting) {
            state.timer = setInterval(() => {
                state.time += 0.5;
            }, 500);
        }
        else
        {
            clearInterval(state.timer);
            state.timer = null;
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll("p").forEach(p => observer.observe(p));

if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Jomhuria"]')) {
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css2?family=Jomhuria&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Text copied to clipboard!");
        const url = `https://gemini.google.com/app?hl=en`;
        
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
    .catch(err => {
        alert("Failed to copy text: ", err);
    }
    );
}

function showResults(duration, readParagraphs) {
    const box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.top = '20px';
    box.style.right = '20px';
    box.style.maxWidth = '350px';
    box.style.maxHeight = '400px';
    box.style.overflowY = 'auto';
    box.style.background = '#fae3c6';
    box.style.border = '2px solid #333';
    box.style.borderRadius = '12px';
    box.style.padding = '12px';
    box.style.fontSize = "30px";
    box.style.lineHeight = "1.3";
    box.style.zIndex = '999';
    box.style.fontFamily = "'Jomhuria', sans-serif";
    box.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    box.innerHTML = `<strong>🕒 Total Time:</strong> ${duration}s<br>
    <strong>📖 Read Paragraphs:</strong><ul style="padding-left: 1em;"></ul>
    <button id="closePARH" style="margin-top: 10px; background-color: #ffaaa5;
     border: none; border-radius: 8px;font-family: 'Jomhuria', sans-serif; font-size: 20px; padding: 3px 6px;
      cursor: pointer;">Close</button><button id="openGemini" style="margin-top: 10px; background-color: #9df9ef; border: none; border-radius: 8px; font-family: 'Jomhuria', sans-serif;
       font-size: 20px; padding: 3px 6px; cursor: pointer;">Ask Gemini</button>`;

    const ul = box.querySelector('ul');
    readParagraphs.forEach(p => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${p.id}`;
        a.textContent = `"${p.text}" → ${p.time}s`;
        
        a.style.color = '#333';
        a.style.fontFamily = "'Jomhuria', sans-serif";

        a.addEventListener('click', (e) => {
            
            const target = document.getElementById(p.id);
            if(target) {
                target.style.transition = "background-color 0.5s";
                target.style.backgroundColor = "#ffff99";
                target.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    target.style.backgroundColor = "";
                  }, 800);
            }
        });

        li.appendChild(a);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '5px';
        checkbox.addEventListener('change', (e) => {
            if(e.target.checked) {
                
                selectedParagraphs.push(p.textFull);
            } else {
                selectedParagraphs = selectedParagraphs.filter(txt => txt !== p.text);
            }
        });
        li.prepend(checkbox);
        ul.appendChild(li);
    });
    document.body.appendChild(box);
    document.getElementById('closePARH').addEventListener('click', () => {
        box.remove();
    });

    document.getElementById('openGemini').addEventListener('click', () => {
        if(selectedParagraphs.length == 0) {
            alert("Please select at least one paragraph!");
            return;
        }
        const prompt = `Tell me more about these paragraphs, in the language that they are written and in a easier way: \n\n${selectedParagraphs.join("\n\n")}`;
        copyToClipboard(prompt);
    });
        

}

alert('Your reading is started! Press Shift+Enter to stop the timer and see the results.');

window.stopReading = () => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const read = [];
    reading.forEach((data, paragraph) => {
        if(data.time > 1) {
            read.push({ text: paragraph.innerText.slice(0, 40) + "...",
                textFull: paragraph.innerText,
                  time: data.time,
                  id: paragraph.id });
                 

        }
    });
    showResults(duration, read);
    reading.clear();
    observer.disconnect();
    
}

document.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && e.shiftKey && canRead) {
       stopReading();
       canRead = false;
    }
});


})();
