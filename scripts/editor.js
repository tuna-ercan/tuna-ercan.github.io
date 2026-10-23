/* =====================================================================
   editor.js  -  THE PROJECT EDITOR (pages/project/editor.html)
   =====================================================================

   You write a project in the form; the preview on the right shows the
   finished page while you type. "Save" then writes, into your site
   folder:
     1. pages/project/<name>.html               the new project page
     2. images/projects/<name>/<photos>         the photos you added
     3. pages/projects.html                     a new button for it

   <name> comes from the title, e.g. "Robot Arm" -> robot-arm.

   Saving uses the browser's File System Access feature, which lets a
   page write into a folder you pick. It works in Chrome and Edge.

   Sections of this file:
     1. Settings
     2. The project being edited (its data)
     3. Text helpers
     4. Building the project page HTML   <- edit this to change how
                                            new project pages look
     5. The form
     6. The live preview
     7. Draft (keeps your text if you reload the page)
     8. Saving into the site folder
     9. Start-up
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. SETTINGS
   --------------------------------------------------------------------- */

// Where the draft is kept in the browser between visits
const DRAFT_KEY = 'projectEditorDraft';

// projects.html contains this line; new project buttons go right above it
const LIST_MARKER = '<!-- The project editor adds new projects above this line -->';

// Same footer text as the other pages
const FOOTER_TEXT = '© 2026 Tuna Ercan';

// Names that must not be used for a project page
const RESERVED_NAMES = ['editor'];


/* ---------------------------------------------------------------------
   2. THE PROJECT BEING EDITED
   title  - the project title
   blocks - the sections and photos, in order. Each one is either
              { type: 'section', heading, text }
              { type: 'photo', file, url, fileName }
            (file = the chosen photo, url = a temporary address used
             for the preview, fileName = its name once saved)
   --------------------------------------------------------------------- */

let title = '';
let blocks = [];

function newSection(heading = '', text = '') {
    return { type: 'section', heading: heading, text: text };
}

function newPhoto() {
    return { type: 'photo', file: null, url: '', fileName: '' };
}


/* ---------------------------------------------------------------------
   3. TEXT HELPERS
   --------------------------------------------------------------------- */

// Makes text safe to put inside HTML (so "<" or "&" in your text
// show up as written instead of breaking the page)
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Turns a title or file name into a simple web-safe name:
// "Robot Arm Çalışması!" -> "robot-arm-calismasi"
function slugify(text) {
    const turkish = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
                      'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
    return text
        .replace(/[çğıöşüÇĞİÖŞÜ]/g, function (c) { return turkish[c]; })
        .normalize('NFD').replace(/[̀-ͯ]/g, '')   // remove other accents
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')                        // anything else -> "-"
        .replace(/^-+|-+$/g, '');                           // no "-" at the ends
}

// The name the page file will get, from the title
function projectName() {
    return slugify(title);
}

// Splits the text of a section into paragraphs (an empty line starts a
// new one) and turns [text](address) into a link.
function textToParagraphs(text) {
    return text
        .split(/\n\s*\n/)
        .map(function (part) { return part.trim(); })
        .filter(function (part) { return part !== ''; })
        .map(function (part) {
            let html = escapeHtml(part);
            html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (all, label, address) {
                if (/^javascript:/i.test(address)) return all;   // never allow script links
                return '<a href="' + address + '">' + label + '</a>';
            });
            return html.replace(/\n/g, '<br>\n');   // a single line break stays a line break
        });
}

// Gives every chosen photo a clean, unique file name
// ("My Photo.JPG" -> "my-photo.jpg", a second one -> "my-photo-2.jpg")
function assignPhotoNames() {
    const used = new Set();
    blocks.forEach(function (block) {
        if (block.type !== 'photo' || !block.file) return;
        const original = block.file.name;
        const dot = original.lastIndexOf('.');
        const extension = dot >= 0 ? original.slice(dot).toLowerCase() : '';
        const base = slugify(dot >= 0 ? original.slice(0, dot) : original) || 'photo';
        let name = base + extension;
        let number = 2;
        while (used.has(name)) {
            name = base + '-' + number + extension;
            number++;
        }
        used.add(name);
        block.fileName = name;
    });
}


/* ---------------------------------------------------------------------
   4. BUILDING THE PROJECT PAGE
   Produces the full HTML of a project page, with the same structure as
   "How I Made This Website" so it gets the same look from
   projectPage_style.css.
   photoAddress(block) decides what each photo's src is: a temporary
   address for the preview, or the real file path when saving.
   --------------------------------------------------------------------- */

function buildProjectPage(photoAddress) {
    const indent = '                ';

    const content = blocks.map(function (block) {
        if (block.type === 'section') {
            const parts = [];
            if (block.heading.trim() !== '') {
                parts.push(indent + '<h2>' + escapeHtml(block.heading.trim()) + '</h2>');
            }
            const paragraphs = textToParagraphs(block.text);
            if (paragraphs.length > 0) {
                parts.push(
                    indent + '<div class="paragSec">\n' +
                    paragraphs.map(function (p) { return indent + '    <p>' + p + '</p>'; }).join('\n') + '\n' +
                    indent + '</div>'
                );
            }
            return parts.join('\n\n');
        }
        if (block.type === 'photo' && block.file) {
            return indent + '<div class="photoSec"><img class="articlePhoto" src="' + photoAddress(block) + '" alt=""></div>';
        }
        return '';
    }).filter(function (html) { return html !== ''; }).join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PageOfAPear</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Created with the project editor (pages/project/editor.html) -->

    <!-- Styles, in this order:
         1. variables.css - all colours and sizes (change things here)
         2. common.css    - parts shared by every page (menu, footer, ...)
         3. styles for project article pages -->
    <link rel="stylesheet" href="../../styles/variables.css" />
    <link rel="stylesheet" href="../../styles/common.css" />
    <link rel="stylesheet" href="../../styles/projectPage_style.css" />
</head>
<body>

    <!-- Scroll progress bar on the right edge (styled in common.css, moved by main.js) -->
    <div id="progressBar"></div>
    <div id="scrollPath"></div>

    <!-- #all wraps the whole page; it slides right when the menu opens -->
    <section class="page" id="all">

        <!-- Menu icon (top left) -->
        <header>
            <div id="toggle"></div>
        </header>

        <!-- White card -->
        <section id="secBackground">

            <!-- The article: a title, then sections and photos -->
            <section id="articleSection">

                <section id="titleSec"><h1>${escapeHtml(title.trim())}</h1></section>

${content}

            </section>
        <div id="space"></div>
        </section>

        <!-- Slide-out menu (hidden off the left edge until the icon is clicked) -->
        <div id="navigation">
            <ul>
                <li><a href="../../index.html">Welcome</a></li>
                <li><a href="../projects.html">Projects</a></li>
                <li><a href="../gallery.html">Gallery</a></li>
                <li><a href="../info.html">Info</a></li>
            </ul>
        </div>

    </section>

    <!-- Footer bar at the bottom of the window -->
    <footer><div> ${FOOTER_TEXT}</div></footer>

    <!-- Menu and progress bar behaviour, shared by every page -->
    <script src="../../scripts/main.js"></script>
</body>
</html>
`;
}

// The button that goes into projects.html for this project
function buildProjectButton(name) {
    return `<li class="projectLi">
                    <a href="project/${name}.html">
                        <div class="contentTitle">
                            ${escapeHtml(title.trim())}
                        </div>
                    </a>
                </li>

                `;
}


/* ---------------------------------------------------------------------
   5. THE FORM
   --------------------------------------------------------------------- */

const titleInput = document.getElementById('title');
const fileNameText = document.getElementById('fileName');
const blocksBox = document.getElementById('blocks');
const statusText = document.getElementById('status');

// Called after every change: update the preview, the file name and the draft
function changed() {
    fileNameText.textContent = 'pages/project/' + (projectName() || '...') + '.html';
    saveDraft();
    schedulePreview();
}

// Draws all section and photo blocks in the form, in order
function renderBlocks() {
    blocksBox.innerHTML = '';

    blocks.forEach(function (block, index) {
        const templateId = block.type === 'section' ? 'sectionTemplate' : 'photoTemplate';
        const card = document.getElementById(templateId).content.firstElementChild.cloneNode(true);

        // Up / down / remove buttons
        const up = card.querySelector('[data-action="up"]');
        const down = card.querySelector('[data-action="down"]');
        up.disabled = index === 0;
        down.disabled = index === blocks.length - 1;
        up.addEventListener('click', function () { moveBlock(index, -1); });
        down.addEventListener('click', function () { moveBlock(index, 1); });
        card.querySelector('[data-action="remove"]').addEventListener('click', function () {
            removeBlock(index);
        });

        if (block.type === 'section') {
            const heading = card.querySelector('.heading');
            const text = card.querySelector('.text');
            heading.value = block.heading;
            text.value = block.text;
            heading.addEventListener('input', function () { block.heading = heading.value; changed(); });
            text.addEventListener('input', function () { block.text = text.value; changed(); });
        } else {
            const fileInput = card.querySelector('.photoInput');
            const thumb = card.querySelector('.thumb');
            if (block.url) thumb.src = block.url;
            fileInput.addEventListener('change', function () {
                const file = fileInput.files[0];
                if (!file) return;
                if (block.url) URL.revokeObjectURL(block.url);   // free the old preview
                block.file = file;
                block.url = URL.createObjectURL(file);
                thumb.src = block.url;
                changed();
            });
        }

        blocksBox.appendChild(card);
    });
}

function moveBlock(index, direction) {
    const other = index + direction;
    if (other < 0 || other >= blocks.length) return;
    const moving = blocks[index];
    blocks[index] = blocks[other];
    blocks[other] = moving;
    renderBlocks();
    changed();
}

function removeBlock(index) {
    const block = blocks[index];
    if (block.url) URL.revokeObjectURL(block.url);
    blocks.splice(index, 1);
    renderBlocks();
    changed();
}

titleInput.addEventListener('input', function () {
    title = titleInput.value;
    changed();
});

document.getElementById('addSection').addEventListener('click', function () {
    blocks.push(newSection());
    renderBlocks();
    changed();
    blocksBox.lastElementChild.querySelector('.heading').focus();
});

document.getElementById('addPhoto').addEventListener('click', function () {
    blocks.push(newPhoto());
    renderBlocks();
    changed();
    blocksBox.lastElementChild.querySelector('.photoInput').click();   // open the file chooser
});

document.getElementById('clear').addEventListener('click', function () {
    if (!confirm('Start a new, empty project?')) return;
    blocks.forEach(function (block) { if (block.url) URL.revokeObjectURL(block.url); });
    title = '';
    blocks = [newSection()];
    titleInput.value = '';
    setStatus('');
    renderBlocks();
    changed();
});

function setStatus(message, isError) {
    statusText.textContent = message;
    statusText.className = isError ? 'error' : '';
}


/* ---------------------------------------------------------------------
   6. THE LIVE PREVIEW
   The preview is the real project page, shown in the frame on the
   right. It is rebuilt a moment after you stop typing, and keeps its
   scroll position.
   --------------------------------------------------------------------- */

const preview = document.getElementById('preview');
let previewTimer = null;
let previewScroll = 0;

function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 300);
}

function updatePreview() {
    assignPhotoNames();
    try { previewScroll = preview.contentWindow.scrollY; } catch (e) { previewScroll = 0; }
    preview.srcdoc = buildProjectPage(function (block) { return block.url; });
}

preview.addEventListener('load', function () {
    try { preview.contentWindow.scrollTo(0, previewScroll); } catch (e) { /* ignore */ }
});


/* ---------------------------------------------------------------------
   7. DRAFT
   Your title and texts are kept in this browser, so reloading the page
   doesn't lose them. (Photos can't be kept this way; choose them again
   after a reload.)
   --------------------------------------------------------------------- */

function saveDraft() {
    try {
        const draft = {
            title: title,
            blocks: blocks.map(function (block) {
                return block.type === 'section'
                    ? { type: 'section', heading: block.heading, text: block.text }
                    : { type: 'photo' };
            })
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) { /* storage not available: nothing to do */ }
}

function loadDraft() {
    try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
        if (draft) {
            title = draft.title || '';
            blocks = (draft.blocks || []).map(function (block) {
                return block.type === 'section' ? newSection(block.heading || '', block.text || '') : newPhoto();
            });
        }
    } catch (e) { /* no usable draft */ }
    if (blocks.length === 0) blocks = [newSection()];
}


/* ---------------------------------------------------------------------
   8. SAVING INTO THE SITE FOLDER
   The first time, the browser asks you to pick your site folder (the
   one with index.html in it). The choice is remembered, so later saves
   only ask for permission.
   --------------------------------------------------------------------- */

// Returns a problem to show, or '' if the project is ready to save
function checkReady() {
    if (title.trim() === '') return 'Add a title.';
    if (projectName() === '') return 'The title needs at least one letter or number.';
    if (RESERVED_NAMES.includes(projectName())) return 'Choose a different title.';
    if (blocks.some(function (block) { return block.type === 'photo' && !block.file; })) {
        return 'A photo block is empty: choose a photo or remove the block.';
    }
    return '';
}

// Writes text or a photo file into a folder
async function writeFile(folder, name, data) {
    const handle = await folder.getFileHandle(name, { create: true });
    const writer = await handle.createWritable();
    await writer.write(data);
    await writer.close();
}

// Does the actual saving into the chosen site folder (siteFolder).
// Returns a summary, or null if you chose not to replace an existing page.
async function saveToFolder(siteFolder) {
    const name = projectName();
    assignPhotoNames();

    // Make sure this really is the site folder
    let pagesFolder, projectsListFile;
    try {
        pagesFolder = await siteFolder.getDirectoryHandle('pages');
        projectsListFile = await pagesFolder.getFileHandle('projects.html');
    } catch (e) {
        throw new Error('This is not the site folder (pages/projects.html was not found). Choose the folder that contains index.html.');
    }
    const projectFolder = await pagesFolder.getDirectoryHandle('project', { create: true });

    // Is there already a project with this name?
    let pageExists = false;
    try {
        await projectFolder.getFileHandle(name + '.html');
        pageExists = true;
    } catch (e) { /* not there yet: fine */ }
    if (pageExists && !confirm('pages/project/' + name + '.html already exists. Replace it?')) {
        return null;
    }

    // 1. Photos -> images/projects/<name>/
    const photos = blocks.filter(function (block) { return block.type === 'photo' && block.file; });
    if (photos.length > 0) {
        const imagesFolder = await siteFolder.getDirectoryHandle('images', { create: true });
        const allProjectsFolder = await imagesFolder.getDirectoryHandle('projects', { create: true });
        const photoFolder = await allProjectsFolder.getDirectoryHandle(name, { create: true });
        for (const block of photos) {
            await writeFile(photoFolder, block.fileName, block.file);
        }
    }

    // 2. The project page -> pages/project/<name>.html
    const page = buildProjectPage(function (block) {
        return '../../images/projects/' + name + '/' + block.fileName;
    });
    await writeFile(projectFolder, name + '.html', page);

    // 3. The button on the Projects page (only if it isn't there already)
    let listHtml = await (await projectsListFile.getFile()).text();
    let buttonAdded = false;
    if (!listHtml.includes('href="project/' + name + '.html"')) {
        if (!listHtml.includes(LIST_MARKER)) {
            throw new Error('The project page was saved, but the button could not be added: the marker line is missing from pages/projects.html.');
        }
        listHtml = listHtml.replace(LIST_MARKER, buildProjectButton(name) + LIST_MARKER);
        await writeFile(pagesFolder, 'projects.html', listHtml);
        buttonAdded = true;
    }

    return { name: name, photos: photos.length, buttonAdded: buttonAdded };
}

// Remembering the chosen folder between visits (in the browser's IndexedDB)
function folderMemory(action, folder) {
    return new Promise(function (resolve, reject) {
        const open = indexedDB.open('projectEditor', 1);
        open.onupgradeneeded = function () { open.result.createObjectStore('folders'); };
        open.onerror = function () { reject(open.error); };
        open.onsuccess = function () {
            const store = open.result
                .transaction('folders', action === 'get' ? 'readonly' : 'readwrite')
                .objectStore('folders');
            const request = action === 'get' ? store.get('site')
                          : action === 'forget' ? store.delete('site')
                          : store.put(folder, 'site');
            request.onsuccess = function () { resolve(request.result); };
            request.onerror = function () { reject(request.error); };
        };
    });
}

// Gets the site folder: the remembered one if allowed, otherwise asks you to pick it
async function getSiteFolder() {
    try {
        const remembered = await folderMemory('get');
        if (remembered && await remembered.requestPermission({ mode: 'readwrite' }) === 'granted') {
            return remembered;
        }
    } catch (e) { /* nothing remembered */ }

    const picked = await window.showDirectoryPicker({ mode: 'readwrite' });
    try { await folderMemory('put', picked); } catch (e) { /* can't remember it: fine */ }
    return picked;
}

document.getElementById('save').addEventListener('click', async function () {
    if (!window.showDirectoryPicker) {
        setStatus('Saving needs Chrome or Edge.', true);
        return;
    }
    const problem = checkReady();
    if (problem) {
        setStatus(problem, true);
        return;
    }

    try {
        const siteFolder = await getSiteFolder();
        setStatus('Saving...');
        const result = await saveToFolder(siteFolder);
        if (!result) {
            setStatus('Not saved.');
            return;
        }
        setStatus(
            'Saved pages/project/' + result.name + '.html' +
            (result.photos > 0 ? '\n' + result.photos + ' photo(s) in images/projects/' + result.name + '/' : '') +
            (result.buttonAdded ? '\nButton added to the Projects page.' : '\nThe Projects page already had its button.')
        );
    } catch (e) {
        if (e.name === 'AbortError') {   // you closed the folder chooser
            setStatus('');
            return;
        }
        if (e.message.indexOf('not the site folder') !== -1) {
            try { await folderMemory('forget'); } catch (ignored) { /* ignore */ }
        }
        setStatus(e.message, true);
    }
});


/* ---------------------------------------------------------------------
   9. START-UP
   --------------------------------------------------------------------- */

loadDraft();
titleInput.value = title;
renderBlocks();
changed();
updatePreview();
