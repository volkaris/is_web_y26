let db;
let selectedFiles = [];

const request = indexedDB.open("MyDb", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore("goods", {keyPath: 'id', autoIncrement: true});
    objectStore.createIndex('timestamp', 'timestamp', {unique: false});
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadEntries();
};

request.onerror = (event) => {
    console.error('Вы не должны это видеть!', event.target.errorCode);
};

const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const form = document.getElementById('form');
const entriesDiv = document.getElementById('savedGoods');


const modal = document.getElementById('modalWindow');
const modalImage = document.getElementById('fullSizedModalImage');
const closeModal = document.getElementById('closeModalWindow');

closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === closeModal) {
        modal.classList.remove('show');
    }
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('hover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('hover');
    }, false);
});

dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('click', () => {
    fileInput.click();
});
fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEntry();
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    const filesArray = Array.from(files);
    const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
    selectedFiles = selectedFiles.concat(imageFiles);
    updateDropArea();
}

function updateDropArea() {
    if (selectedFiles.length > 0) {
        dropArea.innerHTML = `<p>${selectedFiles.length} изображений выбрано</p>`;
    } else {
        dropArea.innerHTML = `<p>Вставьте сюда изображение или нажмите сюда, чтобы выбрать изображение</p>`;
    }
}

function loadEntries() {
    const transaction = db.transaction(['goods']);
    const objectStore = transaction.objectStore('goods');
    const index = objectStore.index('timestamp');
    const request = index.openCursor(null, 'next');

    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            renderEntry(cursor.value);
            cursor.continue();
        }
    };

    request.onerror = (event) => {
        console.error("Вы не должны это видеть!", event.target.error);
    };
}

function renderEntry(entry) {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("entry");

    const textDiv = document.createElement('div');
    textDiv.classList.add('entry-text');
    textDiv.textContent = `Товар: ${entry.goodsName}, Цена: ${entry.cost}`;
    entryDiv.appendChild(textDiv);

    const imagesDiv = document.createElement("div");
    imagesDiv.classList.add("entry-images");

    entry.images.forEach(blob => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(blob);
        img.alt = "Вы не должны это видеть!";

        img.addEventListener("click", () => {
            modalImage.src = img.src;
            modal.classList.add('show');
        });

        imagesDiv.appendChild(img);
    });

    entryDiv.appendChild(imagesDiv);

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('entry-time');
    const date = new Date(entry.timestamp);
    timeDiv.textContent = date.toLocaleString();
    entryDiv.appendChild(timeDiv);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить изображение';
    deleteButton.addEventListener('click', () => {
        deleteEntry(entry.id, entryDiv);
    });

    entryDiv.appendChild(deleteButton);
    entriesDiv.appendChild(entryDiv);
}

function saveEntry() {
    const cost = document.getElementById('costInput').value.trim();
    const goodsName = document.getElementById('goodsInput').value.trim();

    if (!cost || !goodsName || selectedFiles.length === 0) {
        alert('Нужно заполнить все текстовые поля и вставить хотя бы одну картинку');
        return;
    }

    const entry = {
        cost: cost,
        goodsName: goodsName,
        images: selectedFiles,
        timestamp: new Date().toISOString()
    };

    const transaction = db.transaction(['goods'], 'readwrite');
    const objectStore = transaction.objectStore('goods');
    const request = objectStore.add(entry);

    request.onsuccess = () => {
        entry.id = request.result;
        renderEntry(entry);
        form.reset();
        selectedFiles = [];
        updateDropArea();
    };

    request.onerror = (event) => {
        console.error('Вы не должны это видеть!', event.target.error);
    };
}

function deleteEntry(id, entryElement) {
    const transaction = db.transaction(['goods'], 'readwrite');
    const objectStore = transaction.objectStore('goods');
    const request = objectStore.delete(id);

    request.onsuccess = () => {
        entriesDiv.removeChild(entryElement);
    };

    request.onerror = (event) => {
        console.error('Вы не должны это видеть!', event.target.error);
    };
}
