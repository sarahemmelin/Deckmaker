// --- DOM Selectors ---
const csvFileInput = document.getElementById('csvFileInput');
const fileStatus = document.getElementById('fileStatus');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');
const cardGrid = document.getElementById('cardGrid');
const cardCount = document.getElementById('cardCount');

const presetSection = document.getElementById('presetSection');
const presetDivider = document.getElementById('presetDivider');
const mappingSection = document.getElementById('mappingSection');
const mappingTargetSelect = document.getElementById('mappingTargetSelect');
const mappingBacksideSelect = document.getElementById('mappingBacksideSelect');
const mappingDivider = document.getElementById('mappingDivider');
const presetSelect = document.getElementById('presetSelect');
const loadPresetBtn = document.getElementById('loadPresetBtn');
const savePresetBtn = document.getElementById('savePresetBtn');
const updatePresetBtn = document.getElementById('updatePresetBtn');
const deletePresetBtn = document.getElementById('deletePresetBtn');
const exportPresetBtn = document.getElementById('exportPresetBtn');
const importPresetInput = document.getElementById('importPresetInput');

const stylingSection = document.getElementById('stylingSection');
// Styling Selectors
const targetCategory = document.getElementById('targetCategory');
const bgColorPicker = document.getElementById('bgColorPicker');
const bgColorText = document.getElementById('bgColorText');
const bgImageUpload = document.getElementById('bgImageUpload');
const removeBgImageBtn = document.getElementById('removeBgImageBtn');
const clearOverlayBtn = document.getElementById('clearOverlayBtn');
const bgScaleSlider = document.getElementById('bgScaleSlider');
const bgPosXSlider = document.getElementById('bgPosXSlider');
const bgPosYSlider = document.getElementById('bgPosYSlider');
const fgScaleSlider = document.getElementById('fgScaleSlider');
const fgHeightSlider = document.getElementById('fgHeightSlider');
const fgPosXSlider = document.getElementById('fgPosXSlider');
const fgPosYSlider = document.getElementById('fgPosYSlider');
const overlayColorPicker = document.getElementById('overlayColorPicker');
const overlayColorText = document.getElementById('overlayColorText');
const overlayOpacitySlider = document.getElementById('overlayOpacitySlider');
const textColorPicker = document.getElementById('textColorPicker');
const textColorText = document.getElementById('textColorText');
const accentColorPicker = document.getElementById('accentColorPicker');
const accentColorText = document.getElementById('accentColorText');
const fontFamilySelect = document.getElementById('fontFamilySelect');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const wordBreakToggle = document.getElementById('wordBreakToggle');
const showBuoyancyToggle = document.getElementById('showBuoyancyToggle');
const addCustomTextBtn = document.getElementById('addCustomTextBtn');
const backToAllBtn = document.getElementById('backToAllBtn');

// Accessibility Checker Selectors
const a11yChecker = document.getElementById('a11yChecker');
const a11yIcon = document.getElementById('a11yIcon');
const a11yStatus = document.getElementById('a11yStatus');
const a11yRatio = document.getElementById('a11yRatio');

const imageUploadInput = document.getElementById('imageUploadInput');

// --- Global State ---
let parsedCsvData = [];
let cardCategories = new Set();
let cardTitles = new Set();
let activeImagePlaceholder = null;
let backsideMappings = {}; // Store Category -> Back Card Title Mappings

// Stores styling state globally. 
// Format: { "cat_Upgrade": { bg: "#fff", ... }, "card_Experimental Chassis": { bg: ... }, "all": { ... } }
let categoryStyles = {
    "all": {
        bg: "#ffffff",
        bgImage: "none",
        fgImage: "none",
        bgScale: "100",
        bgPosX: "50",
        bgPosY: "50",
        fgScale: "100",
        fgHeight: "1",
        fgPosX: "50",
        fgPosY: "50",
        overlayColor: "#ffffff",
        overlayOpacity: "0",
        text: "#111827",
        accent: "#1f2937",
        font: "'Inter', sans-serif",
        size: "1",
        wordBreak: false,
        showBuoy: true,
        customTexts: []
    }
};

// --- Event Listeners ---
csvFileInput.addEventListener('change', handleFileUpload);
generateBtn.addEventListener('click', generateCards);
printBtn.addEventListener('click', generatePrintLayout);

// Undo/Redo & Copy/Paste System
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 50;
let copiedStyles = null;

function saveStateToHistory() {
    undoStack.push(JSON.stringify(categoryStyles));
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = []; // Clear future redos when branching history
}

function handleUndo() {
    if (undoStack.length === 0) return;
    redoStack.push(JSON.stringify(categoryStyles));
    categoryStyles = JSON.parse(undoStack.pop());
    reapplyAllStyles();
}

function handleRedo() {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.stringify(categoryStyles));
    categoryStyles = JSON.parse(redoStack.pop());
    reapplyAllStyles();
}

function reapplyAllStyles() {
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => applyStoredStyles(card, card.dataset.category, card.dataset.sysId));
    updateControlsToMatchCategory();
}

document.addEventListener('keydown', (e) => {
    // Ignore keystrokes if typing inside text fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        const target = targetCategory.value;
        if (target !== 'all' && categoryStyles[target]) {
            e.preventDefault();
            copiedStyles = JSON.parse(JSON.stringify(categoryStyles[target]));
        }
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        const target = targetCategory.value;
        if (target !== 'all' && copiedStyles) {
            e.preventDefault();
            saveStateToHistory();
            const newStyles = JSON.parse(JSON.stringify(copiedStyles));
            // Regenerate IDs
            if (newStyles.customTexts) {
                newStyles.customTexts.forEach(txt => {
                    txt.id = 'ctx_' + Math.random().toString(36).substr(2, 9) + Date.now();
                });
            }
            categoryStyles[target] = Object.assign({}, categoryStyles[target], newStyles);
            reapplyAllStyles();
        }
    }
});

// Preset Listeners
savePresetBtn.addEventListener('click', handleSavePreset);
loadPresetBtn.addEventListener('click', handleLoadPreset);
updatePresetBtn.addEventListener('click', handleUpdatePreset);
deletePresetBtn.addEventListener('click', handleDeletePreset);
exportPresetBtn.addEventListener('click', handleExportPreset);
importPresetInput.addEventListener('change', handleImportPreset);

presetSelect.addEventListener('change', () => {
    const hasSelection = presetSelect.value !== '';
    updatePresetBtn.disabled = !hasSelection;
    deletePresetBtn.disabled = !hasSelection;
});

// Styling Listeners
targetCategory.addEventListener('change', () => {
    updateControlsToMatchCategory();
    highlightSelectedCard();

    // Sync Backside Mapping Target if it exists
    const selectedTarget = targetCategory.value;
    if (selectedTarget !== 'all') {
        const mappingOptionExists = Array.from(mappingTargetSelect.options).some(opt => opt.value === selectedTarget);
        if (mappingOptionExists) {
            mappingTargetSelect.value = selectedTarget;
            // Dispatch change event to trigger the backside select enablement/population
            mappingTargetSelect.dispatchEvent(new Event('change'));
        }
    } else {
        mappingTargetSelect.value = '';
        mappingTargetSelect.dispatchEvent(new Event('change'));
    }
    // Sync back button
    if (targetCategory.value !== 'all') {
        backToAllBtn.style.display = 'inline-flex';
    } else {
        backToAllBtn.style.display = 'none';

        // Restore scroll position
        if (savedScrollPos > 0) {
            // Need a slight timeout to let DOM render the grid before scrolling
            setTimeout(() => {
                window.scrollTo({ top: savedScrollPos, behavior: 'smooth' });
            }, 50);
        }
    }
});

backToAllBtn.addEventListener('click', () => {
    targetCategory.value = 'all';
    targetCategory.dispatchEvent(new Event('change'));

    // Scroll sidebar to top so user sees the newly expanded controls
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.scrollTo({ top: 0, behavior: 'smooth' });
});

// Color Picker Helpers
function syncColorInput(picker, textInput, property) {
    picker.addEventListener('mousedown', saveStateToHistory);
    textInput.addEventListener('focus', saveStateToHistory);

    // When swatch changes, update text and apply globally
    picker.addEventListener('input', () => {
        textInput.value = picker.value;
        applyStyle(property, picker.value);
    });

    // When text changes, validate hex, update swatch and apply globally
    const handleTextChange = () => {
        let val = textInput.value.trim();
        // Add hash if missing
        if (val && !val.startsWith('#')) val = '#' + val;

        // Check if vaild hex color
        if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
            // normalise to 6 char hex
            if (val.length === 4) {
                val = '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
            }
            picker.value = val;
            textInput.value = val;
            applyStyle(property, val);
        }
    };

    textInput.addEventListener('change', handleTextChange);
    textInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleTextChange();
    });
}

// Attach sync logic to the 5 color inputs
syncColorInput(bgColorPicker, bgColorText, 'bg');
syncColorInput(overlayColorPicker, overlayColorText, 'overlayColor');
syncColorInput(textColorPicker, textColorText, 'text');
syncColorInput(accentColorPicker, accentColorText, 'accent');
syncColorInput(document.getElementById('redFilterColorPicker'), document.getElementById('redFilterColorText'), 'redFilter');

bgImageUpload.addEventListener('change', handleBgImageUpload);
removeBgImageBtn.addEventListener('click', () => {
    saveStateToHistory();
    applyStyle('bgImage', 'none');
    bgImageUpload.value = '';
});

// Dynamic Range Track Slider Background updates
function updateSliderBackground(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value);
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #005fb2 0%, #005fb2 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
}

function bindSlider(slider, propertyName) {
    // Initial paint
    updateSliderBackground(slider);

    slider.addEventListener('mousedown', saveStateToHistory);

    slider.addEventListener('input', () => {
        applyStyle(propertyName, slider.value);
        updateSliderBackground(slider);
    });
}

// Bind all sliders with visual tracks
bindSlider(bgScaleSlider, 'bgScale');
bindSlider(bgPosXSlider, 'bgPosX');
bindSlider(bgPosYSlider, 'bgPosY');
bindSlider(fgScaleSlider, 'fgScale');
bindSlider(fgHeightSlider, 'fgHeight');
bindSlider(fgPosXSlider, 'fgPosX');
bindSlider(fgPosYSlider, 'fgPosY');
bindSlider(overlayOpacitySlider, 'overlayOpacity');
bindSlider(fontSizeSlider, 'size');

clearOverlayBtn.addEventListener('click', () => {
    saveStateToHistory();
    // Reset the internal model representations by applying the default values
    applyStyle('overlayColor', '#ffffff');
    applyStyle('overlayOpacity', '0');

    // Visually reset the active sidebar controls
    overlayColorPicker.value = '#ffffff';
    overlayColorText.value = '#ffffff';
    overlayOpacitySlider.value = 0;
    updateSliderBackground(overlayOpacitySlider);
});

fontFamilySelect.addEventListener('change', () => { saveStateToHistory(); applyStyle('font', fontFamilySelect.value); });
fontSizeSlider.addEventListener('input', () => applyStyle('size', fontSizeSlider.value));
wordBreakToggle.addEventListener('change', () => { saveStateToHistory(); applyStyle('wordBreak', wordBreakToggle.checked); });
showBuoyancyToggle.addEventListener('change', () => { saveStateToHistory(); applyStyle('showBuoy', showBuoyancyToggle.checked); });
addCustomTextBtn.addEventListener('click', handleAddCustomText);

// Backside Mapping Listeners
mappingTargetSelect.addEventListener('change', () => {
    const target = mappingTargetSelect.value;
    if (!target) {
        mappingBacksideSelect.disabled = true;
        mappingBacksideSelect.value = '';
    } else {
        mappingBacksideSelect.disabled = false;
        mappingBacksideSelect.value = backsideMappings[target] || '';
    }
});

mappingBacksideSelect.addEventListener('change', () => {
    const target = mappingTargetSelect.value;
    if (target) {
        backsideMappings[target] = mappingBacksideSelect.value;
        resetPresetButtons();
    }
});

// Image Upload Listener
imageUploadInput.addEventListener('change', handleImageSelection);

/**
 * Handles the CSV file upload
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        fileStatus.textContent = 'No file uploaded.';
        generateBtn.disabled = true;
        return;
    }

    fileStatus.textContent = `Selected: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function (e) {
        parsedCsvData = parseCSV(e.target.result);

        if (parsedCsvData && parsedCsvData.length > 0) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
            alert("Could not parse data. Ensure it's a valid CSV.");
        }
    };
    reader.onerror = () => alert("Failed to read the file.");
    reader.readAsText(file);
}

/**
 * 100% Vanilla JS Custom CSV Parser (handles quoted commas and newlines)
 */
function parseCSV(text) {
    if (!text) return [];

    const rows = [];
    let curRow = [];
    let curCell = '';
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i], nextC = text[i + 1];

        if (c === '"' && inQuote && nextC === '"') {
            curCell += '"'; i++;
        } else if (c === '"') {
            inQuote = !inQuote;
        } else if (c === ',' && !inQuote) {
            curRow.push(curCell); curCell = '';
        } else if ((c === '\n' || (c === '\r' && nextC === '\n')) && !inQuote) {
            if (c === '\r') i++;
            curRow.push(curCell); rows.push(curRow);
            curRow = []; curCell = '';
        } else if (c === '\r' && !inQuote) {
            curRow.push(curCell); rows.push(curRow);
            curRow = []; curCell = '';
        } else {
            curCell += c;
        }
    }
    curRow.push(curCell);
    if (curRow.length > 1 || curCell.trim() !== '') rows.push(curRow);
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim());
    const data = [];

    for (let i = 1; i < rows.length; i++) {
        if (rows[i].length === 1 && rows[i][0].trim() === '') continue;
        const rowObj = {};
        for (let j = 0; j < headers.length; j++) {
            rowObj[headers[j]] = rows[i][j] ? rows[i][j].trim() : '';
        }
        data.push(rowObj);
    }
    return data;
}

/**
 * Generates DOM cards and populates categories
 */
function generateCards() {
    if (!parsedCsvData || parsedCsvData.length === 0) return;

    cardGrid.innerHTML = '';
    cardCategories.clear();
    cardTitles.clear();
    let totalCardsGenerated = 0;
    const titleCounts = {};

    parsedCsvData.forEach(rowData => {
        // Track unique Card_Types for the Styling dropdown
        const type = rowData.Card_Type ? rowData.Card_Type.trim() : 'Uncategorized';
        // Fallback to Card_ID if Card_Title is empty, else Untitled
        const fallback = rowData.Card_ID ? rowData.Card_ID.trim() : 'Untitled';
        const title = rowData.Card_Title ? rowData.Card_Title.trim() : fallback;
        if (type) cardCategories.add(type);

        // Handle Quantity. Default is 1 if not specified or invalid.
        let qty = parseInt(rowData.Qty, 10);
        if (isNaN(qty) || qty < 1) qty = 1;

        for (let q = 0; q < qty; q++) {
            // Uniquely identify each copy visually and systemically
            if (!titleCounts[title]) titleCounts[title] = 0;
            titleCounts[title]++;
            const copyNum = titleCounts[title];
            const sysId = copyNum > 1 ? `${title}__copy${copyNum}` : title;
            cardTitles.add(sysId);

            const cardEl = document.createElement('div');
            cardEl.className = 'game-card';
            if (type.startsWith('Back_')) {
                cardEl.classList.add('is-backside');
            }
            cardEl.dataset.category = type; // Critical for targeted styling
            cardEl.dataset.title = title; // Visual title only
            cardEl.dataset.sysId = sysId; // Anchor for css updates

            // Build Top Badges
            let badgesHTML = '';
            // We consistently inject the badge html if there's data, and let 'display: flex|none' 
            // from the CSS toggle it dynamically from the Styling Panel so sizing doesn't break.
            if (rowData.Buoy_Mod) badgesHTML += `<span class="stat-badge buoy-badge">Buoyancy: ${escapeHTML(rowData.Buoy_Mod)}</span>`;

            // Add Duplicate Button explicitly
            const duplicateBtnHTML = `<button class="duplicate-card-btn material-icons" title="Duplicate this Card" data-index="${parsedCsvData.indexOf(rowData)}">content_copy</button>`;

            // Build Points HTML (Body)
            let pointsHTML = '';
            if (rowData.Min_Pts || rowData.Bio_Pts) {
                pointsHTML = `<div class="card-points" style="margin: 0.05in 0; font-weight: 600; font-size: 0.6rem; color: var(--dynamic-card-accent);">`;
                if (rowData.Min_Pts) pointsHTML += `<span style="margin-right: 0.1in;">Mineral Pts: ${escapeHTML(rowData.Min_Pts)}</span>`;
                if (rowData.Bio_Pts) pointsHTML += `<span>Bio Pts: ${escapeHTML(rowData.Bio_Pts)}</span>`;
                pointsHTML += `</div>`;
            }

            cardEl.innerHTML = `
                <div class="card-bg-layer"></div>
                <div class="card-overlay-layer"></div>
                ${duplicateBtnHTML}
                <div class="card-type-banner"></div>
                <div class="card-header">
                    <h3 class="card-title">${escapeHTML(title)}</h3>
                    <div class="card-stats">${badgesHTML}</div>
                </div>
                
                <div class="card-image-placeholder">Click to add illustration</div>
                
                <div class="card-body">
                    ${rowData.Standard_Text ? `<div class="card-standard-text">${escapeHTML(rowData.Standard_Text)}</div>` : ''}
                    ${pointsHTML}
                    ${rowData.Red_Filter_Text ? `<div class="card-red-text">${escapeHTML(rowData.Red_Filter_Text)}</div>` : ''}
                    ${rowData.Mechanic_Action ? `<div class="card-mechanic">${escapeHTML(rowData.Mechanic_Action)}</div>` : ''}
                    ${rowData.Flavor_Text ? `<div class="card-flavor">${escapeHTML(rowData.Flavor_Text).replace(/\n/g, '<br>')}</div>` : ''}
                </div>
                ${rowData.Card_ID ? `<div class="card-id-footer">${escapeHTML(rowData.Card_ID)}</div>` : ''}
            `;

            // Attach click/drag/scroll listener for Image
            const imgPlaceholder = cardEl.querySelector('.card-image-placeholder');

            let isImgDragging = false;
            let startX, startY;
            let startPosX, startPosY;
            let hasDragged = false;

            imgPlaceholder.addEventListener('mousedown', (e) => {
                if (!imgPlaceholder.classList.contains('has-image')) return;
                saveStateToHistory();
                isImgDragging = true;
                hasDragged = false;
                startX = e.clientX;
                startY = e.clientY;

                // Auto-select this card so image manipulations are strictly localized
                selectCardTarget(sysId);

                // Read current values
                const currentX = parseFloat(getComputedStyle(cardEl).getPropertyValue('--dynamic-card-fg-pos-x')) || 50;
                const currentY = parseFloat(getComputedStyle(cardEl).getPropertyValue('--dynamic-card-fg-pos-y')) || 50;
                startPosX = currentX;
                startPosY = currentY;

                e.preventDefault(); // Prevent text selection
            });

            document.addEventListener('mousemove', (e) => {
                if (!isImgDragging) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) hasDragged = true;

                // Sensitivity multiplier (adjustable)
                const sensitivity = 0.2;
                let newX = startPosX - (deltaX * sensitivity);
                let newY = startPosY - (deltaY * sensitivity);

                // Clamping
                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                cardEl.style.setProperty('--dynamic-card-fg-pos-x', `${newX}%`);
                cardEl.style.setProperty('--dynamic-card-fg-pos-y', `${newY}%`);
            });

            document.addEventListener('mouseup', (e) => {
                if (!isImgDragging) return;
                isImgDragging = false;

                if (hasDragged) {
                    // Save to state
                    const newX = parseFloat(cardEl.style.getPropertyValue('--dynamic-card-fg-pos-x'));
                    const newY = parseFloat(cardEl.style.getPropertyValue('--dynamic-card-fg-pos-y'));

                    const tCategory = targetCategory.value;
                    let shouldSave = false;

                    if (tCategory === 'all') shouldSave = true;
                    else if (tCategory.startsWith('cat_') && cardEl.dataset.category === tCategory.substring(4)) shouldSave = true;
                    else if (tCategory.startsWith('card_') && cardEl.dataset.sysId === tCategory.substring(5)) shouldSave = true;

                    if (shouldSave && categoryStyles[tCategory]) {
                        categoryStyles[tCategory].fgPosX = newX;
                        categoryStyles[tCategory].fgPosY = newY;
                        fgPosXSlider.value = newX;
                        fgPosYSlider.value = newY;
                        updateSliderBackground(fgPosXSlider);
                        updateSliderBackground(fgPosYSlider);
                        resetPresetButtons();
                    }
                }
            });

            // Zoom via Mouse Wheel
            let zoomTimeout;
            imgPlaceholder.addEventListener('wheel', (e) => {
                if (!imgPlaceholder.classList.contains('has-image')) return;
                e.preventDefault();

                if (!zoomTimeout) saveStateToHistory();
                clearTimeout(zoomTimeout);
                zoomTimeout = setTimeout(() => { zoomTimeout = null; }, 500);

                // Auto-select this card so image manipulations are strictly localized
                selectCardTarget(sysId);

                const currentScale = parseFloat(getComputedStyle(cardEl).getPropertyValue('--dynamic-card-fg-size')) || 100;

                // Zoom direction
                const zoomAmount = 5;
                let newScale = currentScale;
                if (e.deltaY > 0) newScale -= zoomAmount; // Scroll down = zoom out
                else if (e.deltaY < 0) newScale += zoomAmount; // Scroll up = zoom in

                newScale = Math.max(10, Math.min(300, newScale));

                cardEl.style.setProperty('--dynamic-card-fg-size', `${newScale}%`);

                // Save to state
                const tCategory = targetCategory.value;
                let shouldSave = false;

                if (tCategory === 'all') shouldSave = true;
                else if (tCategory.startsWith('cat_') && cardEl.dataset.category === tCategory.substring(4)) shouldSave = true;
                else if (tCategory.startsWith('card_') && cardEl.dataset.sysId === tCategory.substring(5)) shouldSave = true;

                if (shouldSave && categoryStyles[tCategory]) {
                    categoryStyles[tCategory].fgScale = newScale;
                    fgScaleSlider.value = newScale;
                    updateSliderBackground(fgScaleSlider);
                    resetPresetButtons();
                }
            });

            imgPlaceholder.addEventListener('click', () => {
                if (hasDragged) return; // Prevent upload dialog if we just finished dragging
                activeImagePlaceholder = imgPlaceholder;
                imageUploadInput.click();
            });

            // Apply existing styles immediately on generation
            applyStoredStyles(cardEl, type, sysId);

            if (type.startsWith('Back_')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'card-wrapper';
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '0.5rem';

                const label = document.createElement('div');
                label.className = 'backside-label';
                label.textContent = escapeHTML(title);
                label.title = "Click to selectively style this exact card";

                // Allow clicking the backside label to select it since the card itself is often filled with draggable images
                label.addEventListener('click', (e) => {
                    selectCardTarget(sysId);
                });

                wrapper.appendChild(label);
                wrapper.appendChild(cardEl);
                cardGrid.appendChild(wrapper);
            } else {
                cardGrid.appendChild(cardEl);
            }

            // Click-to-Select Card logic
            cardEl.addEventListener('click', (e) => {
                // Handle Duplicate Card Click
                if (e.target.classList.contains('duplicate-card-btn')) {
                    const rowIdx = parseInt(e.target.dataset.index, 10);
                    if (!isNaN(rowIdx)) {
                        const originalRow = parsedCsvData[rowIdx];
                        const clonedRow = { ...originalRow, Qty: "1" }; // Shallow copy, force Qty to 1 to prevent exploding counts

                        // Push to dataset (Title rewriting removed!)
                        parsedCsvData.push(clonedRow);

                        // Optional: Copy preset styles from the original
                        const originalKey = `card_${sysId}`;

                        // Predict the new sysId (It will be the current title's total count + 1)
                        const newCopyNum = titleCounts[title] + 1;
                        const newSysId = `${title}__copy${newCopyNum}`;
                        const newKey = `card_${newSysId}`;

                        if (categoryStyles[originalKey]) {
                            // Deep copy styles via JSON stringify to avoid reference tangles
                            categoryStyles[newKey] = JSON.parse(JSON.stringify(categoryStyles[originalKey]));

                            // Regenerate IDs for custom texts so they aren't linked across siblings!
                            if (categoryStyles[newKey].customTexts) {
                                categoryStyles[newKey].customTexts.forEach(txt => {
                                    txt.id = 'ctx_' + Math.random().toString(36).substr(2, 9) + Date.now();
                                });
                            }
                        }

                        // Re-render
                        // Wait a tiny fraction so the click event finishes propagating before we destroy the DOM
                        setTimeout(() => generateCards(), 10);
                        return;
                    }
                }

                // Ignore clicks on images or custom texts so we don't interrupt uploads/drags
                if (e.target.closest('.card-image-placeholder') || e.target.closest('.custom-text-element')) return;

                // Select this exact card in the dropdown
                selectCardTarget(sysId);
            });

            totalCardsGenerated++;
        }
    });

    // Update Sidebar UI
    cardCount.textContent = `${totalCardsGenerated} Cards Generated`;
    printBtn.disabled = false;
    presetSection.style.display = 'block';
    presetDivider.style.display = 'block';
    stylingSection.style.display = 'flex';

    // Populate dropdown
    updateCategoryDropdown();
    populatePresetDropdown();
    updateBacksideMapping();
}

/**
 * --- Interactive Illustrations Logic ---
 */
async function handleBgImageUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        applyStyle('bgImage', 'none');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.url) {
            applyStyle('bgImage', `url("${data.url}")`);
        }
    } catch (err) {
        console.error("Failed to upload background texture:", err);
    }
}

async function handleImageSelection(event) {
    const file = event.target.files[0];
    if (!file || !activeImagePlaceholder) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.url) {
            // Set the uploaded image as the background of the exact placeholder clicked
            activeImagePlaceholder.style.backgroundImage = `url('${data.url}')`;
            activeImagePlaceholder.classList.add('has-image');

            // Save state to correct category/card
            const cardEl = activeImagePlaceholder.closest('.game-card');
            if (cardEl) {
                const targetTitle = cardEl.dataset.sysId;
                const targetKey = "card_" + targetTitle;

                if (!categoryStyles[targetKey]) {
                    categoryStyles[targetKey] = JSON.parse(JSON.stringify(categoryStyles["all"]));
                }
                categoryStyles[targetKey].fgImage = `url('${data.url}')`;
                resetPresetButtons();
            }

            // Reset the input so the same file could be selected again if needed
            imageUploadInput.value = '';
            activeImagePlaceholder = null;
        }
    } catch (err) {
        console.error("Failed to upload illustration:", err);
    }
}

/**
 * --- Bulk Styling & Targeting Logic ---
 */
let savedScrollPos = 0;

function selectCardTarget(title) {
    const exactCardOpt = Array.from(targetCategory.options).find(opt => opt.value === `card_${title}`);
    if (exactCardOpt) {
        // Record scroll position before jumping into card view
        if (targetCategory.value === 'all') {
            savedScrollPos = window.scrollY || document.documentElement.scrollTop;
        }

        // Only trigger DOM update if it's an actual change, to prevent jitter
        if (targetCategory.value !== exactCardOpt.value) {
            targetCategory.value = exactCardOpt.value;
            targetCategory.dispatchEvent(new Event('change'));
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

function updateCategoryDropdown() {
    targetCategory.innerHTML = '<option value="all">All Cards</option>';

    // Group 1: Categories
    const catGroup = document.createElement('optgroup');
    catGroup.label = "By Category";
    cardCategories.forEach(cat => {
        // Only clone if missing and not a backside
        if (!categoryStyles["cat_" + cat] && !cat.startsWith('Back_')) {
            categoryStyles["cat_" + cat] = JSON.parse(JSON.stringify(categoryStyles["all"]));
        }
        const opt = document.createElement('option');
        opt.value = "cat_" + cat;
        opt.textContent = `Category: ${cat}`;
        catGroup.appendChild(opt);
    });
    targetCategory.appendChild(catGroup);

    // Group 2: Single Cards
    const cardGroup = document.createElement('optgroup');
    cardGroup.label = "Single Individual Cards";
    cardTitles.forEach(sysId => {
        const cardEl = document.querySelector(`.game-card[data-sys-id="${CSS.escape(sysId)}"]`);
        const catName = cardEl ? cardEl.dataset.category : null;
        const baseTitle = cardEl ? cardEl.dataset.title : sysId;
        const isBackside = catName ? catName.startsWith('Back_') : false;

        // Only deep clone inherited texts if it is a frontside card.
        // Critically, we MUST inherit from the specific Category (if styled) so we don't accidentally overwrite category layouts with global defaults!
        if (!categoryStyles["card_" + sysId] && !isBackside) {
            const sourceStyles = (catName && categoryStyles["cat_" + catName])
                ? categoryStyles["cat_" + catName]
                : categoryStyles["all"];
            categoryStyles["card_" + sysId] = JSON.parse(JSON.stringify(sourceStyles));
        } else if (!categoryStyles["card_" + sysId] && isBackside) {
            // Blank slate for backsides since they exclude 'all' inherited texts
            categoryStyles["card_" + sysId] = { customTexts: [] };
        }

        const opt = document.createElement('option');
        opt.value = "card_" + sysId;

        // Parse sysId for a clean display name
        const match = sysId.match(/__copy(\d+)$/);
        if (match) {
            opt.textContent = `Card: ${baseTitle} (Copy ${match[1]})`;
        } else {
            opt.textContent = `Card: ${baseTitle}`;
        }

        cardGroup.appendChild(opt);
    });
    targetCategory.appendChild(cardGroup);

    highlightSelectedCard();
}

function highlightSelectedCard() {
    const target = targetCategory.value;
    const allCards = document.querySelectorAll('.game-card');

    allCards.forEach(card => {
        // Remove from all
        card.classList.remove('is-selected');

        // Add if specifically targeted
        if (target === `card_${card.dataset.sysId}`) {
            card.classList.add('is-selected');
        }
    });
}

function updateControlsToMatchCategory() {
    const target = targetCategory.value;
    const styles = categoryStyles[target];

    // 1. Sync the UI controls if we have stored styles for this target
    // 1. Sync the UI controls if we have stored styles for this target
    if (styles) {
        bgColorPicker.value = styles.bg;
        bgColorText.value = styles.bg;
        if (!styles.bgImage || styles.bgImage === 'none') {
            bgImageUpload.value = '';
        }
        bgScaleSlider.value = styles.bgScale !== undefined ? styles.bgScale : "100";
        bgPosXSlider.value = styles.bgPosX !== undefined ? styles.bgPosX : "50";
        bgPosYSlider.value = styles.bgPosY !== undefined ? styles.bgPosY : "50";
        fgScaleSlider.value = styles.fgScale !== undefined ? styles.fgScale : "100";
        fgHeightSlider.value = styles.fgHeight !== undefined ? styles.fgHeight : "1";
        fgPosXSlider.value = styles.fgPosX !== undefined ? styles.fgPosX : "50";
        fgPosYSlider.value = styles.fgPosY !== undefined ? styles.fgPosY : "50";
        overlayColorPicker.value = styles.overlayColor !== undefined ? styles.overlayColor : "#ffffff";
        overlayColorText.value = styles.overlayColor !== undefined ? styles.overlayColor : "#ffffff";
        overlayOpacitySlider.value = styles.overlayOpacity !== undefined ? styles.overlayOpacity : "0";
        textColorPicker.value = styles.text;
        textColorText.value = styles.text;
        accentColorPicker.value = styles.accent;
        accentColorText.value = styles.accent;

        // Sync Typography Controls
        fontFamilySelect.value = styles.font;
        fontSizeSlider.value = styles.size;
        wordBreakToggle.checked = styles.wordBreak;
        showBuoyancyToggle.checked = (styles.showBuoy !== undefined) ? styles.showBuoy : true;

        // Repaint styling on all range tracks now that values shifted
        updateSliderBackground(bgScaleSlider);
        updateSliderBackground(bgPosXSlider);
        updateSliderBackground(bgPosYSlider);
        updateSliderBackground(fgScaleSlider);
        updateSliderBackground(fgHeightSlider);
        updateSliderBackground(fgPosXSlider);
        updateSliderBackground(fgPosYSlider);
        updateSliderBackground(overlayOpacitySlider);
        updateSliderBackground(fontSizeSlider);
    }

    // 2. Filter the UI Grid to ONLY show the targeted cards
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        let shouldShow = false;
        if (target === 'all') {
            shouldShow = true;
        } else if (target.startsWith('cat_') && card.dataset.category === target.substring(4)) {
            shouldShow = true;
        } else if (target.startsWith('card_') && card.dataset.sysId === target.substring(5)) {
            shouldShow = true;
        }

        // Hide or Show the physical card in the grid
        if (card.parentElement && card.parentElement.classList.contains('card-wrapper')) {
            card.parentElement.style.display = shouldShow ? 'flex' : 'none';
        } else {
            card.style.display = shouldShow ? 'flex' : 'none';
        }
    });

    // Update Accessibility Checker for the newly selected target
    updateAccessibilityChecker();
}

function applyStyle(property, value) {
    const target = targetCategory.value;

    // Save state
    if (!categoryStyles[target]) categoryStyles[target] = {};
    categoryStyles[target][property] = value;

    // Apply to DOM globally
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        let shouldApply = false;

        if (target === 'all') {
            // New Requirement: Backside cards are excluded from 'all' global styling
            shouldApply = !card.classList.contains('is-backside');
        } else if (target.startsWith('cat_') && card.dataset.category === target.substring(4)) {
            shouldApply = true;
        } else if (target.startsWith('card_') && card.dataset.sysId === target.substring(5)) {
            shouldApply = true;
        }

        if (shouldApply) {
            updateCSSCustomProperty(card, property, value);
        }
    });

    // Update the Accessibility Checker
    if (property === 'bg' || property === 'text') {
        updateAccessibilityChecker();
    }

    // Sub-propagation: If 'all' is modified, push it down to categories and cards so logic doesn't break
    if (target === 'all') {
        Object.keys(categoryStyles).forEach(key => {
            // Skip updating backsides from 'all' (either cat_Back_X or card_Back_Y)
            if (key !== 'all' && !key.includes('_Back_')) {
                categoryStyles[key][property] = value;
            }
        });
    } else if (target.startsWith('cat_')) {
        // If a Category is styled, push that style into any Single Card data structures belonging to that category
        const catName = target.substring(4);
        cards.forEach(card => {
            if (card.dataset.category === catName) {
                const cardKey = "card_" + card.dataset.sysId;
                if (categoryStyles[cardKey]) categoryStyles[cardKey][property] = value;
            }
        });
    }

    resetPresetButtons();
}

function hexToRgba(hex, opacity) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function updateCSSCustomProperty(cardDiv, propName, value) {
    if (propName === 'bg') cardDiv.style.setProperty('--dynamic-card-bg', value);
    if (propName === 'bgImage') {
        const bgLayer = cardDiv.querySelector('.card-bg-layer');
        if (bgLayer) bgLayer.style.backgroundImage = value;
    }
    if (propName === 'bgScale') cardDiv.style.setProperty('--dynamic-card-bg-size', `${value}%`);
    if (propName === 'bgPosX') cardDiv.style.setProperty('--dynamic-card-bg-pos-x', `${value}%`);
    if (propName === 'bgPosY') cardDiv.style.setProperty('--dynamic-card-bg-pos-y', `${value}%`);

    if (propName === 'fgScale') cardDiv.style.setProperty('--dynamic-card-fg-size', `${value}%`);
    if (propName === 'fgHeight') cardDiv.style.setProperty('--dynamic-card-fg-height', `${value}in`);
    if (propName === 'fgPosX') cardDiv.style.setProperty('--dynamic-card-fg-pos-x', `${value}%`);
    if (propName === 'fgPosY') cardDiv.style.setProperty('--dynamic-card-fg-pos-y', `${value}%`);
    if (propName === 'fgImage') {
        const fgLayer = cardDiv.querySelector('.card-image-placeholder');
        if (fgLayer) {
            fgLayer.style.backgroundImage = value;
            if (value !== 'none') {
                fgLayer.classList.add('has-image');
            } else {
                fgLayer.classList.remove('has-image');
            }
        }
    }

    if (propName === 'overlayColor' || propName === 'overlayOpacity') {
        const styles = categoryStyles["card_" + cardDiv.dataset.sysId] || categoryStyles["cat_" + cardDiv.dataset.category] || categoryStyles["all"];
        const hex = propName === 'overlayColor' ? value : (styles.overlayColor !== undefined ? styles.overlayColor : "#ffffff");
        const opacity = propName === 'overlayOpacity' ? value : (styles.overlayOpacity !== undefined ? styles.overlayOpacity : "0");
        const rgba = hexToRgba(hex, opacity);
        cardDiv.style.setProperty('--dynamic-card-overlay', rgba);
    }

    if (propName === 'text') cardDiv.style.setProperty('--dynamic-card-text', value);
    if (propName === 'redFilter') cardDiv.style.setProperty('--dynamic-card-red-text', value);
    if (propName === 'accent') cardDiv.style.setProperty('--dynamic-card-accent', value);
    if (propName === 'font') cardDiv.style.setProperty('--dynamic-card-font', value);
    if (propName === 'size') {
        // value is a multiplier from the slider (e.g. 0.8 to 1.5). Apply it to base 'rem'
        cardDiv.style.setProperty('--dynamic-card-size', `${value}rem`);
    }
    if (propName === 'wordBreak') {
        const breakType = value ? 'break-all' : 'normal';
        const hyphenType = value ? 'auto' : 'none';
        cardDiv.style.setProperty('--dynamic-card-break', breakType);
        cardDiv.style.setProperty('--dynamic-card-hyphens', hyphenType);
    }
    if (propName === 'showBuoy') {
        cardDiv.style.setProperty('--dynamic-card-buoy-display', value ? 'flex' : 'none');
    }
}

function applyStoredStyles(cardDiv, category, title) {
    const isBackside = category.startsWith('Back_');
    const baseGlobal = categoryStyles["all"] || {};
    const baseCat = categoryStyles["cat_" + category] || {};
    let baseCard = categoryStyles["card_" + title];

    // INFERENCE LOGIC: If this card has NO specific styling yet, infer its template from a sibling!
    const sysId = title; // In the new system, 'title' arg passed to applyStoredStyles is actually the sysId

    if (!baseCard && !isBackside && parsedCsvData && parsedCsvData.length > 0) {
        // Since `applyStoredStyles` runs before all cards are appended to the DOM, we cannot use document.querySelector.
        // Instead, we reconstruct the sysId iteration logic by scanning the CSV exactly as generateCards does.
        const siblings = [];
        const tempCounts = {};

        parsedCsvData.forEach(row => {
            const rType = row.Card_Type ? row.Card_Type.trim() : 'Uncategorized';
            const rFallback = row.Card_ID ? row.Card_ID.trim() : 'Untitled';
            const rTitle = row.Card_Title ? row.Card_Title.trim() : rFallback;

            let qty = parseInt(row.Qty, 10);
            if (isNaN(qty) || qty < 1) qty = 1;

            for (let q = 0; q < qty; q++) {
                if (!tempCounts[rTitle]) tempCounts[rTitle] = 0;
                tempCounts[rTitle]++;
                const cNum = tempCounts[rTitle];
                const generatedSysId = cNum > 1 ? `${rTitle}__copy${cNum}` : rTitle;

                if (rType === category) {
                    siblings.push(generatedSysId);
                }
            }
        });

        // Search backwards to preferentially inherit from the most recently adjacent sibling
        const reversedSiblings = [...siblings].reverse();

        let chosenSiblingStyle = null;
        let fallbackSiblingStyle = null;

        for (let sibSysId of reversedSiblings) {
            if (sibSysId !== sysId && categoryStyles["card_" + sibSysId]) {
                const sStyle = categoryStyles["card_" + sibSysId];

                // If a sibling has any dedicated card style stored, inherit from it!
                // We don't need to aggressively check if it's different from the global base anymore,
                // because merely having a `card_` key implies they clicked target and tweaked it.
                chosenSiblingStyle = sStyle;
                break;
            }
        }

        const styleToClone = chosenSiblingStyle || fallbackSiblingStyle;

        if (styleToClone) {
            // Clone the heavily-styled sibling so the new card inherits its exact layout
            baseCard = JSON.parse(JSON.stringify(styleToClone));

            // Clear the illustration so the user knows they need to upload a new one, but keep background/layout
            if (baseCard.fgImage) baseCard.fgImage = 'none';

            // Generate fresh IDs for custom texts so dragging them doesn't move them on the sibling card!
            if (baseCard.customTexts) {
                baseCard.customTexts.forEach(txt => {
                    txt.id = 'ctx_' + Math.random().toString(36).substr(2, 9) + Date.now();
                });
            }

            categoryStyles["card_" + sysId] = baseCard; // Persist it
        }
    }

    baseCard = baseCard || {};

    let styles;
    if (isBackside) {
        // Backsides do not inherit from 'all'. They start blank, inherit category, then card overrides.
        styles = { ...baseCat, ...baseCard };
    } else {
        // Frontsides inherit from 'all', then category, then card overrides.
        styles = { ...baseGlobal, ...baseCat, ...baseCard };
    }

    updateCSSCustomProperty(cardDiv, 'bg', styles.bg !== undefined ? styles.bg : '#ffffff');
    updateCSSCustomProperty(cardDiv, 'bgImage', styles.bgImage !== undefined ? styles.bgImage : 'none');
    updateCSSCustomProperty(cardDiv, 'bgScale', styles.bgScale !== undefined ? styles.bgScale : '100');
    updateCSSCustomProperty(cardDiv, 'bgPosX', styles.bgPosX !== undefined ? styles.bgPosX : '50');
    updateCSSCustomProperty(cardDiv, 'bgPosY', styles.bgPosY !== undefined ? styles.bgPosY : '50');
    updateCSSCustomProperty(cardDiv, 'fgImage', styles.fgImage !== undefined ? styles.fgImage : 'none');
    updateCSSCustomProperty(cardDiv, 'fgScale', styles.fgScale !== undefined ? styles.fgScale : '100');
    updateCSSCustomProperty(cardDiv, 'fgHeight', styles.fgHeight !== undefined ? styles.fgHeight : '1');
    updateCSSCustomProperty(cardDiv, 'fgPosX', styles.fgPosX !== undefined ? styles.fgPosX : '50');
    updateCSSCustomProperty(cardDiv, 'fgPosY', styles.fgPosY !== undefined ? styles.fgPosY : '50');
    updateCSSCustomProperty(cardDiv, 'overlayColor', styles.overlayColor !== undefined ? styles.overlayColor : '#ffffff');
    updateCSSCustomProperty(cardDiv, 'overlayOpacity', styles.overlayOpacity !== undefined ? styles.overlayOpacity : '0');
    updateCSSCustomProperty(cardDiv, 'text', styles.text !== undefined ? styles.text : '#111827');
    updateCSSCustomProperty(cardDiv, 'redFilter', styles.redFilter !== undefined ? styles.redFilter : '#ef4444');
    updateCSSCustomProperty(cardDiv, 'accent', styles.accent !== undefined ? styles.accent : '#1f2937');
    updateCSSCustomProperty(cardDiv, 'font', styles.font !== undefined ? styles.font : "'Inter', sans-serif");
    updateCSSCustomProperty(cardDiv, 'size', styles.size !== undefined ? styles.size : '1');
    updateCSSCustomProperty(cardDiv, 'wordBreak', styles.wordBreak !== undefined ? styles.wordBreak : false);
    updateCSSCustomProperty(cardDiv, 'showBuoy', (styles.showBuoy !== undefined) ? styles.showBuoy : true);

    // Handle Custom Texts
    const existingTexts = cardDiv.querySelectorAll('.custom-text-element');
    existingTexts.forEach(el => el.remove());

    const texts = styles.customTexts || [];
    texts.forEach(txt => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-text-element';
        wrapper.dataset.id = txt.id;
        wrapper.style.left = txt.x + '%';
        wrapper.style.top = txt.y + '%';

        if (txt.font && txt.font !== 'inherit') wrapper.style.fontFamily = txt.font;
        if (txt.size) wrapper.style.fontSize = txt.size + 'rem';
        if (txt.color) wrapper.style.color = txt.color;
        if (txt.bg) wrapper.style.backgroundColor = txt.bg;
        if (txt.bold) wrapper.style.fontWeight = 'bold';
        else wrapper.style.fontWeight = '600';

        const contentSpan = document.createElement('span');
        contentSpan.className = 'custom-text-content';
        contentSpan.innerText = txt.text;

        if (txt.width) contentSpan.style.width = txt.width;
        if (txt.height) contentSpan.style.height = txt.height;

        const ro = new ResizeObserver(() => {
            if (activeCtxId === txt.id && wrapper.classList.contains('is-editing')) {
                const newW = contentSpan.style.width;
                const newH = contentSpan.style.height;
                if (newW && newH) {
                    updateCustomTextDataStore(txt.id, { width: newW, height: newH });
                    syncCustomTextSizeUI(txt.id, newW, newH);
                }
            }
        });
        ro.observe(contentSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-delete-btn material-icons';
        deleteBtn.innerHTML = 'delete';
        // Prevent mousedown from propagating to the editable span so we don't blur immediately
        deleteBtn.onmousedown = (e) => e.preventDefault();

        wrapper.appendChild(contentSpan);
        wrapper.appendChild(deleteBtn);
        cardDiv.appendChild(wrapper);

        attachCustomTextEvents(wrapper, cardDiv, txt.id, contentSpan, deleteBtn);
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
}

function handleAddCustomText() {
    saveStateToHistory();
    const target = targetCategory.value;
    const newText = { id: 'ctx_' + Date.now(), text: 'New Text', x: 50, y: 50 };

    if (!categoryStyles[target]) categoryStyles[target] = JSON.parse(JSON.stringify(categoryStyles["all"]));
    if (!categoryStyles[target].customTexts) categoryStyles[target].customTexts = [];
    categoryStyles[target].customTexts.push(newText);

    // Sub-propagation
    if (target === 'all') {
        Object.keys(categoryStyles).forEach(key => {
            if (key !== 'all' && !key.includes('_Back_')) {
                if (!categoryStyles[key].customTexts) categoryStyles[key].customTexts = [];
                categoryStyles[key].customTexts.push({ ...newText });
            }
        });
    } else if (target.startsWith('cat_')) {
        const catName = target.substring(4);
        const cards = document.querySelectorAll('.game-card');
        cards.forEach(card => {
            if (card.dataset.category === catName) {
                const cardKey = "card_" + card.dataset.sysId;
                if (categoryStyles[cardKey]) {
                    if (!categoryStyles[cardKey].customTexts) categoryStyles[cardKey].customTexts = [];
                    if (!categoryStyles[cardKey].customTexts.find(t => t.id === newText.id)) {
                        categoryStyles[cardKey].customTexts.push({ ...newText });
                    }
                }
            }
        });
    }

    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        applyStoredStyles(card, card.dataset.category, card.dataset.sysId);
    });
}

function attachCustomTextEvents(wrapper, cardDiv, txtId, contentSpan, deleteBtn) {
    let isDragging = false;

    wrapper.addEventListener('mousedown', (e) => {
        saveStateToHistory();
        // Show properties on single click without entering typing mode
        if (activeCtxId !== txtId) {
            showCtxToolbar(wrapper, txtId);
        }

        // If we click the wrapper while editing, let it pass so it can blur or focus naturally
        if (wrapper.classList.contains('is-editing')) {
            e.stopPropagation();
            return;
        }

        isDragging = true;
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const cardRect = cardDiv.getBoundingClientRect();
        let newX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
        let newY = ((e.clientY - cardRect.top) / cardRect.height) * 100;

        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        wrapper.style.left = newX + '%';
        wrapper.style.top = newY + '%';

        syncCustomTextPosUI(txtId, newX, newY);
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const newX = parseFloat(wrapper.style.left);
        const newY = parseFloat(wrapper.style.top);
        updateCustomTextDataStore(txtId, { x: newX, y: newY });
    });

    wrapper.addEventListener('dblclick', (e) => {
        contentSpan.contentEditable = true;
        wrapper.classList.add('is-editing');
        contentSpan.focus();

        const range = document.createRange();
        range.selectNodeContents(contentSpan);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        showCtxToolbar(wrapper, txtId);
        e.stopPropagation();
    });

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCustomText(txtId);
        closeCtxEditor();
    });

    contentSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            closeCtxEditor();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeCtxEditor();
        }
    });
}

function updateCustomTextDataStore(id, updates) {
    const target = targetCategory.value;

    const applyMerge = (stylesObj) => {
        if (stylesObj && stylesObj.customTexts) {
            const txt = stylesObj.customTexts.find(t => t.id === id);
            if (txt) Object.assign(txt, updates);
        }
    };

    applyMerge(categoryStyles[target]);

    if (target === 'all') {
        Object.keys(categoryStyles).forEach(key => {
            if (key !== 'all' && !key.includes('_Back_')) applyMerge(categoryStyles[key]);
        });
    } else if (target.startsWith('cat_')) {
        const catName = target.substring(4);
        const cards = document.querySelectorAll('.game-card');
        cards.forEach(card => {
            if (card.dataset.category === catName) {
                applyMerge(categoryStyles["card_" + card.dataset.sysId]);
            }
        });
    }
}

function removeCustomText(id) {
    saveStateToHistory();
    const target = targetCategory.value;

    // Sub-propagation removal
    if (target === 'all') {
        Object.keys(categoryStyles).forEach(key => {
            if (categoryStyles[key].customTexts && key !== 'all' && !key.includes('_Back_')) {
                categoryStyles[key].customTexts = categoryStyles[key].customTexts.filter(t => t.id !== id);
            }
        });
        if (categoryStyles['all'].customTexts) {
            categoryStyles['all'].customTexts = categoryStyles['all'].customTexts.filter(t => t.id !== id);
        }
    } else if (target.startsWith('cat_')) {
        const catName = target.substring(4);
        const cards = document.querySelectorAll('.game-card');
        cards.forEach(card => {
            if (card.dataset.category === catName) {
                const cardKey = "card_" + card.dataset.sysId;
                if (categoryStyles[cardKey] && categoryStyles[cardKey].customTexts) {
                    categoryStyles[cardKey].customTexts = categoryStyles[cardKey].customTexts.filter(t => t.id !== id);
                }
            }
        });
        // Also remove from the category itself
        if (categoryStyles[target] && categoryStyles[target].customTexts) {
            categoryStyles[target].customTexts = categoryStyles[target].customTexts.filter(t => t.id !== id);
        }
    } else {
        // Just the single card
        if (categoryStyles[target] && categoryStyles[target].customTexts) {
            categoryStyles[target].customTexts = categoryStyles[target].customTexts.filter(t => t.id !== id);
        }
    }

    // Re-render all cards
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        applyStoredStyles(card, card.dataset.category, card.dataset.sysId);
    });
}

function syncCustomTextSizeUI(id, newW, newH) {
    const target = targetCategory.value;
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        let shouldSync = false;
        if (target === 'all') shouldSync = true;
        else if (target.startsWith('cat_') && card.dataset.category === target.substring(4)) shouldSync = true;
        else if (target.startsWith('card_') && card.dataset.sysId === target.substring(5)) shouldSync = true;

        if (shouldSync) {
            const el = card.querySelector(`.custom-text-element[data-id="${id}"]`);
            if (el) {
                const span = el.querySelector('.custom-text-content');
                if (span && span !== document.activeElement) {
                    span.style.width = newW;
                    span.style.height = newH;
                }
            }
        }
    });
}

function syncCustomTextPosUI(id, newX, newY) {
    const target = targetCategory.value;
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        let shouldSync = false;
        if (target === 'all') shouldSync = true;
        else if (target.startsWith('cat_') && card.dataset.category === target.substring(4)) shouldSync = true;
        else if (target.startsWith('card_') && card.dataset.sysId === target.substring(5)) shouldSync = true;

        if (shouldSync) {
            const el = card.querySelector(`.custom-text-element[data-id="${id}"]`);
            if (el) {
                el.style.left = newX + '%';
                el.style.top = newY + '%';
            }
        }
    });
}

/**
 * --- Custom Text Floating Toolbar Logic ---
 */
const customTextToolbar = document.getElementById('customTextToolbar');
const ctxFontSelect = document.getElementById('ctxFontSelect');
const ctxSizeInput = document.getElementById('ctxSizeInput');
const ctxBoldToggle = document.getElementById('ctxBoldToggle');
const ctxColorPicker = document.getElementById('ctxColorPicker');
const ctxBgPicker = document.getElementById('ctxBgPicker');
const ctxClearBgBtn = document.getElementById('ctxClearBgBtn');

let activeCtxId = null;
let activeCtxWrapper = null;

document.addEventListener('mousedown', (e) => {
    if (activeCtxWrapper && activeCtxWrapper.classList.contains('is-editing')) {
        if (!activeCtxWrapper.contains(e.target) && !customTextToolbar.contains(e.target)) {
            closeCtxEditor();
        }
    }
});

function closeCtxEditor() {
    if (!activeCtxWrapper) return;
    const contentSpan = activeCtxWrapper.querySelector('.custom-text-content');
    contentSpan.contentEditable = false;
    activeCtxWrapper.classList.remove('is-editing');

    customTextToolbar.style.display = 'none';

    const newText = contentSpan.textContent.trim();
    if (newText !== '') {
        syncCustomTextContentUI(activeCtxId, newText);
        updateCustomTextDataStore(activeCtxId, { text: newText });
    }

    activeCtxWrapper = null;
    activeCtxId = null;
}

function showCtxToolbar(wrapper, id) {
    activeCtxWrapper = wrapper;
    activeCtxId = id;

    const target = targetCategory.value;
    let txtData = null;

    const searchTarget = categoryStyles["card_" + wrapper.closest('.game-card').dataset.sysId] || categoryStyles[target] || categoryStyles["all"];
    if (searchTarget && searchTarget.customTexts) {
        txtData = searchTarget.customTexts.find(t => t.id === id);
    }

    if (txtData) {
        ctxFontSelect.value = txtData.font || 'inherit';
        ctxSizeInput.value = txtData.size || 1;
        ctxBoldToggle.checked = !!txtData.bold;
        ctxColorPicker.value = txtData.color || '#111827';
        // HTML Color inputs only support 6-character hex
        ctxBgPicker.value = (txtData.bg && txtData.bg !== 'transparent') ? txtData.bg : '#ffffff';
    }

    customTextToolbar.style.display = 'flex';
    customTextToolbar.style.flexDirection = 'column';
    customTextToolbar.parentElement.parentElement.open = true; // ensure accordion is open
}

// Bind history saves to raw interactions with the toolbar
ctxFontSelect.addEventListener('mousedown', saveStateToHistory);
ctxSizeInput.addEventListener('mousedown', saveStateToHistory);
ctxBoldToggle.addEventListener('mousedown', saveStateToHistory);
ctxColorPicker.addEventListener('mousedown', saveStateToHistory);
ctxBgPicker.addEventListener('mousedown', saveStateToHistory);
ctxClearBgBtn.addEventListener('mousedown', saveStateToHistory);

ctxFontSelect.addEventListener('change', () => {
    if (!activeCtxId) return;
    updateCustomTextDataStore(activeCtxId, { font: ctxFontSelect.value });
    activeCtxWrapper.style.fontFamily = ctxFontSelect.value === 'inherit' ? '' : ctxFontSelect.value;
});
ctxSizeInput.addEventListener('input', () => {
    if (!activeCtxId) return;
    updateCustomTextDataStore(activeCtxId, { size: ctxSizeInput.value });
    activeCtxWrapper.style.fontSize = ctxSizeInput.value + 'rem';
});
ctxBoldToggle.addEventListener('change', () => {
    if (!activeCtxId) return;
    updateCustomTextDataStore(activeCtxId, { bold: ctxBoldToggle.checked });
    activeCtxWrapper.style.fontWeight = ctxBoldToggle.checked ? 'bold' : '600';
});
ctxColorPicker.addEventListener('input', () => {
    if (!activeCtxId) return;
    updateCustomTextDataStore(activeCtxId, { color: ctxColorPicker.value });
    activeCtxWrapper.style.color = ctxColorPicker.value;
});
ctxBgPicker.addEventListener('input', () => {
    if (!activeCtxId) return;
    updateCustomTextDataStore(activeCtxId, { bg: ctxBgPicker.value });
    activeCtxWrapper.style.backgroundColor = ctxBgPicker.value;
});
ctxClearBgBtn.addEventListener('click', () => {
    if (!activeCtxId) return;
    updateCustomTextDataStore(activeCtxId, { bg: 'transparent' });
    activeCtxWrapper.style.backgroundColor = 'transparent';
});

function syncCustomTextContentUI(id, newText) {
    const target = targetCategory.value;
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        let shouldSync = false;
        if (target === 'all') shouldSync = true;
        else if (target.startsWith('cat_') && card.dataset.category === target.substring(4)) shouldSync = true;
        else if (target.startsWith('card_') && card.dataset.sysId === target.substring(5)) shouldSync = true;

        if (shouldSync) {
            const wrapper = card.querySelector(`.custom-text-element[data-id="${id}"]`);
            if (wrapper) {
                const contentNode = wrapper.querySelector('.custom-text-content');
                if (contentNode && contentNode !== document.activeElement) {
                    contentNode.innerText = newText;
                }
            }
        }
    });
}

/**
 * --- Accessibility Checker (Contrast "Middleware") ---
 */

// Convert HEX color to RGB object
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    // 3 digits
    if (hex.length === 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];
        // 6 digits
    } else if (hex.length === 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }
    return { r: +r, g: +g, b: +b };
}

// Darken an RGB color by a percentage (0 to 1) for print simulation
function darkenRgb(rgb, percent) {
    return {
        r: Math.max(0, Math.floor(rgb.r * (1 - percent))),
        g: Math.max(0, Math.floor(rgb.g * (1 - percent))),
        b: Math.max(0, Math.floor(rgb.b * (1 - percent)))
    };
}

// Calculate relative luminance for WCAG
function getLuminance(rgb) {
    const a = [rgb.r, rgb.g, rgb.b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate contrast ratio between two RGB colors
function getContrastRatio(rgb1, rgb2) {
    const lum1 = getLuminance(rgb1);
    const lum2 = getLuminance(rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function updateAccessibilityChecker() {
    if (!parsedCsvData || parsedCsvData.length === 0) return; // Wait until init

    const target = targetCategory.value;
    const styles = categoryStyles[target] || categoryStyles["all"];

    // Default fallback colors
    const bgColor = styles.bg || '#ffffff';
    const textColor = styles.text || '#111827';

    const bgRgb = hexToRgb(bgColor);
    const textRgb = hexToRgb(textColor);

    // Simulate print darkness: both colors print ~15% darker
    const darkenedBgRgb = darkenRgb(bgRgb, 0.15);
    const darkenedTextRgb = darkenRgb(textRgb, 0.15);

    const ratio = getContrastRatio(darkenedBgRgb, darkenedTextRgb);

    // Format ratio to 2 decimal places
    const formattedRatio = (Math.round(ratio * 100) / 100).toFixed(2);
    a11yRatio.textContent = formattedRatio + ':1';

    // Clear existing classes
    a11yChecker.classList.remove('a11y-pass', 'a11y-warn', 'a11y-fail');

    if (ratio >= 7) {
        a11yChecker.classList.add('a11y-pass');
        a11yIcon.textContent = 'check_circle';
        a11yStatus.textContent = 'Contrast: Excellent (AAA)';
    } else if (ratio >= 4.5) {
        a11yChecker.classList.add('a11y-warn');
        a11yIcon.textContent = 'info';
        a11yStatus.textContent = 'Contrast: Acceptable (AA)';
    } else {
        a11yChecker.classList.add('a11y-fail');
        a11yIcon.textContent = 'warning';
        a11yStatus.textContent = 'Contrast: Poor (Fails)';
    }
}

/**
 * --- Preset Management Logic ---
 */

const PRESETS_STORAGE_KEY = 'deckmaker_presets';

function getLocalPresets() {
    const data = localStorage.getItem(PRESETS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function saveLocalPresets(presets) {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
}

function populatePresetDropdown() {
    const presets = getLocalPresets();
    presetSelect.innerHTML = '<option value="">-- Select a Preset --</option>';

    Object.keys(presets).forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        presetSelect.appendChild(opt);
    });
}

function setPresetSavedState(type) {
    if (type === 'save') {
        savePresetBtn.textContent = "Saved!";
        savePresetBtn.classList.add('btn-saved');
    } else if (type === 'update') {
        updatePresetBtn.textContent = "Saved!";
        updatePresetBtn.classList.add('btn-saved');
    }
}

function resetPresetButtons() {
    savePresetBtn.textContent = "Save New...";
    savePresetBtn.classList.remove('btn-saved');
    updatePresetBtn.textContent = "Save";
    updatePresetBtn.classList.remove('btn-saved');
}

function handleSavePreset() {
    const name = prompt("Enter a name for this preset:");
    if (!name || name.trim() === '') return;

    const presets = getLocalPresets();
    presets[name.trim()] = {
        styles: JSON.parse(JSON.stringify(categoryStyles)),
        mappings: JSON.parse(JSON.stringify(backsideMappings)),
        deck: JSON.parse(JSON.stringify(parsedCsvData))
    };
    saveLocalPresets(presets);

    populatePresetDropdown();
    presetSelect.value = name.trim();

    // Enable Update/Delete buttons after saving a new valid preset
    updatePresetBtn.disabled = false;
    deletePresetBtn.disabled = false;

    setPresetSavedState('save');
}

function handleUpdatePreset() {
    const selected = presetSelect.value;
    if (!selected) return;

    const presets = getLocalPresets();
    presets[selected] = {
        styles: JSON.parse(JSON.stringify(categoryStyles)),
        mappings: JSON.parse(JSON.stringify(backsideMappings)),
        deck: JSON.parse(JSON.stringify(parsedCsvData))
    };
    saveLocalPresets(presets);

    setPresetSavedState('update');
}

function handleDeletePreset() {
    const selected = presetSelect.value;
    if (!selected) return;

    if (confirm(`Are you sure you want to delete preset "${selected}"?`)) {
        const presets = getLocalPresets();
        delete presets[selected];
        saveLocalPresets(presets);

        populatePresetDropdown();
        presetSelect.value = '';

        // Reset disabled states
        updatePresetBtn.disabled = true;
        deletePresetBtn.disabled = true;

        alert(`Preset "${selected}" deleted.`);
    }
}

function handleLoadPreset() {
    const selected = presetSelect.value;
    if (!selected) return;

    const presets = getLocalPresets();
    if (presets[selected]) {
        if (confirm(`Load preset "${selected}"? This will overwrite current styles.`)) {
            loadPresetData(presets[selected]);
        }
    }
}

function loadPresetData(data) {
    let shouldRegenerateDeck = false;

    if (data.styles) {
        // New save format
        categoryStyles = JSON.parse(JSON.stringify(data.styles));
        backsideMappings = data.mappings ? JSON.parse(JSON.stringify(data.mappings)) : {};
        if (data.deck && data.deck.length > 0) {
            parsedCsvData = JSON.parse(JSON.stringify(data.deck));
            shouldRegenerateDeck = true;
        }
    } else {
        // Legacy save format (backwards compatibility)
        categoryStyles = JSON.parse(JSON.stringify(data));
        backsideMappings = {};
    }

    if (shouldRegenerateDeck) {
        // Re-generate the entire grid from the saved state, which automatically invokes applyStoredStyles
        generateCards();
        document.getElementById('generateBtn').disabled = false;
    } else {
        // Re-apply all styles gracefully without wiping grid
        const cards = document.querySelectorAll('.game-card');
        cards.forEach(card => {
            applyStoredStyles(card, card.dataset.category, card.dataset.sysId);
        });
        updateControlsToMatchCategory();
    }
}

// Convert image URL to Base64
async function urlToBase64(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn(`Could not convert image ${url} to base64:`, e);
        return null;
    }
}

// Convert Base64 back to a Blob for upload
function base64ToBlob(base64Data) {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
}

// Export preset and bundle images as Base64
async function handleExportPreset() {
    exportPresetBtn.disabled = true;
    exportPresetBtn.textContent = "Exporting...";

    try {
        const exportData = {
            styles: JSON.parse(JSON.stringify(categoryStyles)),
            mappings: JSON.parse(JSON.stringify(backsideMappings)),
            deck: JSON.parse(JSON.stringify(parsedCsvData))
        };

        // Find all bgImage and fgImage values and convert to base64 if they are local uploads
        for (const targetKey in exportData.styles) {
            const style = exportData.styles[targetKey];
            if (style.bgImage && style.bgImage.includes('/uploads/')) {
                const urlMatch = style.bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    const base64 = await urlToBase64(urlMatch[1]);
                    if (base64) style.bgImageBase64 = base64;
                }
            }
            if (style.fgImage && style.fgImage.includes('/uploads/')) {
                const urlMatch = style.fgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    const base64 = await urlToBase64(urlMatch[1]);
                    if (base64) style.fgImageBase64 = base64;
                }
            }
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "deckmaker_preset.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } catch (err) {
        console.error("Export failed:", err);
        alert("Failed to export preset.");
    } finally {
        exportPresetBtn.disabled = false;
        exportPresetBtn.textContent = "Export JSON";
    }
}

// Import preset and re-upload base64 images
async function handleImportPreset(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Show a loading indicator since uploading takes time
            document.body.style.cursor = 'wait';

            // Scan for base64 images and upload them back to the server
            const uploadPromises = [];
            const urlMapping = {}; // Map old URLs to new URLs

            // Determine if new format or old format
            const stylesToProcess = importedData.styles ? importedData.styles : importedData;

            for (const targetKey in stylesToProcess) {
                const style = stylesToProcess[targetKey];

                if (style.bgImageBase64) {
                    const oldUrl = style.bgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
                    if (!urlMapping[oldUrl]) {
                        const blob = base64ToBlob(style.bgImageBase64);
                        const ext = blob.type.split('/')[1] || 'png';
                        const fileObj = new File([blob], `imported_${Date.now()}.${ext}`, { type: blob.type });

                        const formData = new FormData();
                        formData.append('image', fileObj);

                        const uploadPromise = fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        }).then(res => res.json()).then(data => {
                            if (data.url) urlMapping[oldUrl] = data.url;
                        });

                        uploadPromises.push(uploadPromise);
                    }
                }

                if (style.fgImageBase64) {
                    const oldUrl = style.fgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
                    if (!urlMapping[oldUrl]) {
                        const blob = base64ToBlob(style.fgImageBase64);
                        const ext = blob.type.split('/')[1] || 'png';
                        const fileObj = new File([blob], `imported_${Date.now()}.${ext}`, { type: blob.type });

                        const formData = new FormData();
                        formData.append('image', fileObj);

                        const uploadPromise = fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        }).then(res => res.json()).then(data => {
                            if (data.url) urlMapping[oldUrl] = data.url;
                        });

                        uploadPromises.push(uploadPromise);
                    }
                }
            }

            // Wait for all image uploads to finish
            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises);
            }

            // Update the imported data with the newly generated URLs
            for (const targetKey in stylesToProcess) {
                const style = stylesToProcess[targetKey];

                if (style.bgImageBase64) {
                    const oldUrl = style.bgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
                    if (urlMapping[oldUrl]) {
                        style.bgImage = `url("${urlMapping[oldUrl]}")`;
                    }
                    delete style.bgImageBase64;
                }

                if (style.fgImageBase64) {
                    const oldUrl = style.fgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
                    if (urlMapping[oldUrl]) {
                        style.fgImage = `url('${urlMapping[oldUrl]}')`; // Keep single quotes matching original standard 
                    }
                    delete style.fgImageBase64;
                }
            }

            loadPresetData(importedData);

            if (confirm("Preset imported successfully! Do you want to save this to your local browser presets?")) {
                const name = prompt("Enter a name for this preset:");
                if (name && name.trim() !== '') {
                    const presets = getLocalPresets();
                    presets[name.trim()] = {
                        styles: JSON.parse(JSON.stringify(stylesToProcess)),
                        mappings: importedData.mappings ? JSON.parse(JSON.stringify(importedData.mappings)) : {}
                    };
                    saveLocalPresets(presets);
                    populatePresetDropdown();
                    presetSelect.value = name.trim();
                    updatePresetBtn.disabled = false;
                    deletePresetBtn.disabled = false;
                }
            }

        } catch (err) {
            console.error("Import failed:", err);
            alert("Failed to read or parse the JSON file.");
        } finally {
            document.body.style.cursor = 'default';
            importPresetInput.value = ''; // Reset input
        }
    };
    reader.readAsText(file);
}

/**
 * --- Backside Mapping & Print Layout Logic ---
 */
function updateBacksideMapping() {
    mappingTargetSelect.innerHTML = '<option value="">-- Select Target --</option>';
    mappingBacksideSelect.innerHTML = '<option value="">-- None --</option>';
    mappingBacksideSelect.disabled = true;

    const frontCategories = Array.from(cardCategories);

    if (frontCategories.length === 0 || cardTitles.size === 0) {
        mappingSection.style.display = 'none';
        mappingDivider.style.display = 'none';
        return;
    }

    mappingSection.style.display = 'flex';
    mappingDivider.style.display = 'block';

    // Populate Targets (Categories)
    const catGroup = document.createElement('optgroup');
    catGroup.label = "By Category";
    frontCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = "cat_" + cat;
        opt.textContent = `Category: ${cat}`;
        catGroup.appendChild(opt);
    });
    mappingTargetSelect.appendChild(catGroup);

    // Populate Targets (Individual Cards)
    const cardGroup = document.createElement('optgroup');
    cardGroup.label = "Single Individual Cards";
    cardTitles.forEach(sysId => {
        const opt = document.createElement('option');
        opt.value = "card_" + sysId;

        const cardEl = document.querySelector(`.game-card[data-sys-id="${CSS.escape(sysId)}"]`);
        const baseTitle = cardEl ? cardEl.dataset.title : sysId;
        const match = sysId.match(/__copy(\d+)$/);

        if (match) {
            opt.textContent = `Card: ${baseTitle} (Copy ${match[1]})`;
        } else {
            opt.textContent = `Card: ${baseTitle}`;
        }

        cardGroup.appendChild(opt);
    });
    mappingTargetSelect.appendChild(cardGroup);

    // Populate Backsides
    cardTitles.forEach(sysId => {
        const opt = document.createElement('option');
        opt.value = sysId;

        const cardEl = document.querySelector(`.game-card[data-sys-id="${CSS.escape(sysId)}"]`);
        const baseTitle = cardEl ? cardEl.dataset.title : sysId;
        const match = sysId.match(/__copy(\d+)$/);

        if (match) {
            opt.textContent = `${baseTitle} (Copy ${match[1]})`;
        } else {
            opt.textContent = baseTitle;
        }

        mappingBacksideSelect.appendChild(opt);
    });
}

function generatePrintLayout() {
    const layout = document.getElementById('printLayout');
    layout.innerHTML = '';

    // 1. Gather all currently visible front cards from the grid in order
    const visibleCards = Array.from(document.querySelectorAll('#cardGrid .game-card:not(.is-backside)')).filter(c => {
        if (c.parentElement && c.parentElement.classList.contains('card-wrapper')) {
            return c.parentElement.style.display !== 'none';
        }
        return c.style.display !== 'none';
    });

    if (visibleCards.length === 0) {
        alert("No visible cards to print.");
        return;
    }

    // Determine if we need to do double sided printing based on whether any mappings exist
    const hasAnyMapping = Object.values(backsideMappings).some(v => v !== '');

    // 2. Chunk them into pages of 9
    for (let i = 0; i < visibleCards.length; i += 9) {
        const chunk = visibleCards.slice(i, i + 9);

        // --- Create Front Page ---
        const frontPage = document.createElement('div');
        frontPage.className = 'print-page';

        chunk.forEach(card => {
            const clonedCard = card.cloneNode(true);
            frontPage.appendChild(clonedCard);
        });

        // Pad the front page with empty cards if less than 9 to maintain grid structure
        while (frontPage.children.length < 9) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'game-card';
            emptyCard.style.visibility = 'hidden';
            frontPage.appendChild(emptyCard);
        }

        layout.appendChild(frontPage);

        // --- Create Back Page ---
        // We only generate a back page if mappings exist AND the chunk contains front cards
        const chunkHasFrontCards = chunk.some(c => !c.classList.contains('is-backside'));

        if (hasAnyMapping && chunkHasFrontCards) {
            const backPage = document.createElement('div');
            backPage.className = 'print-page';

            // Mirror logic for duplex alignment
            // Top row: 0 1 2 -> 2 1 0
            // Mid row: 3 4 5 -> 5 4 3
            // Bot row: 6 7 8 -> 8 7 6
            const mirrorIndices = [2, 1, 0, 5, 4, 3, 8, 7, 6];
            const backCardsArray = new Array(9).fill(null);

            chunk.forEach((frontCard, index) => {
                const cat = frontCard.dataset.category;
                const sysId = frontCard.dataset.sysId;
                const mappedBackSysId = backsideMappings["card_" + sysId] || backsideMappings["cat_" + cat];

                let backNodeToUse = null;
                if (mappedBackSysId) {
                    const existingBackCard = document.querySelector(`.game-card[data-sys-id="${CSS.escape(mappedBackSysId)}"]`);
                    if (existingBackCard) {
                        backNodeToUse = existingBackCard.cloneNode(true);
                        backNodeToUse.style.display = 'flex'; // Ensure it's not hidden
                    }
                }

                const mirrorIndex = mirrorIndices[index];
                backCardsArray[mirrorIndex] = backNodeToUse;
            });

            // Append back cards in mirrored order
            backCardsArray.forEach(bNode => {
                if (bNode) {
                    backPage.appendChild(bNode);
                } else {
                    const emptyCard = document.createElement('div');
                    emptyCard.className = 'game-card';
                    emptyCard.style.visibility = 'hidden';
                    backPage.appendChild(emptyCard);
                }
            });

            layout.appendChild(backPage);
        }
    }

    // Trigger native print flow
    window.print();
}

