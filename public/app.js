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
const mechanicBgColorPicker = document.getElementById('mechanicBgColorPicker');
const mechanicBgColorText = document.getElementById('mechanicBgColorText');
const mechanicBgOpacitySlider = document.getElementById('mechanicBgOpacitySlider');
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
const AUTOSAVE_KEY = 'deckmaker_autosave';
const PRESETS_STORAGE_KEY = 'deckmaker_presets';

let parsedCsvData = [];
let cardCategories = new Set();
let cardTitles = new Set();
let titleCounts = {};
let activeImagePlaceholder = null;
let backsideMappings = {}; // Store Category -> Back Card Title Mappings
let savedScrollPos = 0;

// Stat Icons bindings
const statBuoyVisible = document.getElementById('statBuoyVisible');
const statBuoyIcon = document.getElementById('statBuoyIcon');
const statBuoySize = document.getElementById('statBuoySize');
const statBuoyColor = document.getElementById('statBuoyIconColor');
const statBuoyBgPicker = document.getElementById('statBuoyBgPicker');
const statBuoyBgOpacity = document.getElementById('statBuoyBgOpacity');
const statBuoyRadiusInput = document.getElementById('statBuoyRadiusInput');
const statBuoyBgResetBtn = document.getElementById('statBuoyBgResetBtn');

const statMinVisible = document.getElementById('statMinVisible');
const statMinIcon = document.getElementById('statMinIcon');
const statMinSize = document.getElementById('statMinSize');
const statMinColor = document.getElementById('statMinIconColor');

const statBioVisible = document.getElementById('statBioVisible');
const statBioIcon = document.getElementById('statBioIcon');
const statBioSize = document.getElementById('statBioSize');
const statBioColor = document.getElementById('statBioIconColor');

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
        hideIllustration: false,
        mechanicBgColor: "#000000",
        mechanicBgOpacity: "0.04",
        showBuoy: true,
        textGap: "0.06",
        // Buoyancy defaults
        buoyVisible: true,
        buoyIcon: "arrow_downward",
        buoySize: "1.1",
        buoyColor: "#ffffff",
        buoyBg: null,       // null = use accent color (CSS fallback)
        buoyBgOpacity: "1",
        buoyRadius: "2",
        // Mineral Pts defaults
        minVisible: true,
        minIcon: "diamond",
        minSize: "1.6",
        minColor: "#1f2937",
        // Bio Pts defaults
        bioVisible: true,
        bioIcon: "eco",
        bioSize: "1.6",
        bioColor: "#1f2937",
        customTexts: []
    }
};

// Map controls to their respective property names in `categoryStyles`
const simpleBindings = [
    { el: bgColorPicker, textEl: bgColorText, prop: 'bg' },
    { el: fgScaleSlider, prop: 'fgScale' },
    { el: fgHeightSlider, prop: 'fgHeight' },
    { el: fgPosXSlider, prop: 'fgPosX' },
    { el: fgPosYSlider, prop: 'fgPosY' },
    { el: bgScaleSlider, prop: 'bgScale' },
    { el: bgPosXSlider, prop: 'bgPosX' },
    { el: bgPosYSlider, prop: 'bgPosY' },
    { el: overlayOpacitySlider, prop: 'overlayOpacity' },
    { el: overlayColorPicker, prop: 'overlayColor' },
    { el: textColorPicker, textEl: textColorText, prop: 'text' },
    { el: accentColorPicker, textEl: accentColorText, prop: 'accent' },
    { el: fontSizeSlider, prop: 'size' },
    { el: showBuoyancyToggle, prop: 'showBuoy', type: 'checkbox' },
    { el: wordBreakToggle, prop: 'wordBreak', type: 'checkbox' },
    { el: document.getElementById('hideIllustrationToggle'), prop: 'hideIllustration', type: 'checkbox' },
    { el: mechanicBgColorPicker, textEl: mechanicBgColorText, prop: 'mechanicBgColor' },
    { el: mechanicBgOpacitySlider, prop: 'mechanicBgOpacity' },
    { el: document.getElementById('textGapSlider'), prop: 'textGap' },

    // New Stat Bindings
    { el: statBuoyVisible, prop: 'buoyVisible', type: 'checkbox' },
    { el: statBuoyIcon, prop: 'buoyIcon' },
    { el: statBuoySize, prop: 'buoySize' },
    { el: statBuoyColor, prop: 'buoyColor' },

    { el: statMinVisible, prop: 'minVisible', type: 'checkbox' },
    { el: statMinIcon, prop: 'minIcon' },
    { el: statMinSize, prop: 'minSize' },
    { el: statMinColor, prop: 'minColor' },

    { el: statBioVisible, prop: 'bioVisible', type: 'checkbox' },
    { el: statBioIcon, prop: 'bioIcon' },
    { el: statBioSize, prop: 'bioSize' },
    { el: statBioColor, prop: 'bioColor' }
];

// --- Event Listeners ---
csvFileInput.addEventListener('change', handleFileUpload);
generateBtn.addEventListener('click', generateCards);
printBtn.addEventListener('click', generatePrintLayout);

// Undo/Redo & Copy/Paste System
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 50;
let copiedStyles = null;

// Multi-select & element clipboard for custom elements
let selectedCtxIds = new Set();
let elementClipboard = null; // array of element data objects
let elementClipboardScope = null; // scope key the elements were copied FROM

// Illustration overflow check timer
let _illustrationCheckTimer = null;

function clearCtxSelection() {
    selectedCtxIds.clear();
    document.querySelectorAll('.custom-text-element.is-selected').forEach(el => el.classList.remove('is-selected'));
}

// The Auto-Save system ensures that if the user refreshes without explicitly saving a "Preset", their working deck isn't wiped out!

function triggerAutoSave() {
    if (!parsedCsvData || parsedCsvData.length === 0) return;
    const saveBlob = {
        deck: JSON.parse(JSON.stringify(parsedCsvData)),
        styles: JSON.parse(JSON.stringify(categoryStyles)),
        mappings: JSON.parse(JSON.stringify(backsideMappings))
    };
    try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveBlob));
    } catch (e) {
        console.warn("AutoSave failed (Likely Quota Exceeded):", e);
        // We don't alert loudly here because AutoSave happens constantly on every click/drag
    }
}

function saveStateToHistory() {
    undoStack.push(JSON.stringify(categoryStyles));
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = []; // Clear future redos when branching history
    triggerAutoSave();
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
    // Element copy/paste works even when sidebar inputs are focused
    if (e.ctrlKey && e.key.toLowerCase() === 'c' && selectedCtxIds.size > 0) {
        e.preventDefault();
        // Search ALL scopes — the element may live in a different scope than the current target
        const found = [];
        elementClipboardScope = null;
        for (const [key, scope] of Object.entries(categoryStyles)) {
            if (!scope.customTexts) continue;
            for (const t of scope.customTexts) {
                if (selectedCtxIds.has(t.id)) {
                    found.push(JSON.parse(JSON.stringify(t)));
                    // Record the most specific scope the copied elements live in
                    if (!elementClipboardScope || key.startsWith('card_')) elementClipboardScope = key;
                }
            }
        }
        elementClipboard = found;
        copiedStyles = null;
        return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'v' && elementClipboard && elementClipboard.length > 0) {
        e.preventDefault();
        saveStateToHistory();
        // Paste into: current target if it's a specific scope, otherwise fall back to the
        // scope the elements were copied from (avoids cascade-override invisibility on "all")
        const currentTarget = targetCategory.value;
        const target = (currentTarget !== 'all') ? currentTarget : (elementClipboardScope || currentTarget);
        if (!categoryStyles[target]) categoryStyles[target] = {};
        if (!categoryStyles[target].customTexts) {
            const effective = getEffectiveStyles(target);
            categoryStyles[target].customTexts = effective.customTexts
                ? JSON.parse(JSON.stringify(effective.customTexts))
                : [];
        }
        elementClipboard.forEach(el => {
            const copy = JSON.parse(JSON.stringify(el));
            copy.id = 'ctx_' + Date.now() + Math.random().toString(36).substring(2, 9);
            copy.x = Math.min(95, (copy.x || 50) + 2);
            copy.y = Math.min(95, (copy.y || 50) + 2);
            categoryStyles[target].customTexts.push(copy);
        });
        reapplyAllStyles();
        return;
    }

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
            elementClipboard = null;
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
                    txt.id = 'ctx_' + Math.random().toString(36).substring(2, 9) + Date.now();
                });
            }
            categoryStyles[target] = Object.assign({}, categoryStyles[target], newStyles);
            reapplyAllStyles();
        }
    }
    if (e.key === 'Escape') {
        clearCtxSelection();
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
    if (targetCategory.value === 'all') {
        if (backToAllBtn) backToAllBtn.style.display = 'none';
        // Restore scroll position
        if (savedScrollPos > 0) {
            // Need a slight timeout to let DOM render the grid before scrolling
            setTimeout(() => {
                window.scrollTo({ top: savedScrollPos, behavior: 'smooth' });
            }, 50);
        }
    } else {
        if (backToAllBtn) backToAllBtn.style.display = 'flex';
    }
    // Scroll sidebar to top so user sees the newly expanded controls
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.scrollTo({ top: 0, behavior: 'smooth' });
});

if (backToAllBtn) {
    backToAllBtn.addEventListener('click', () => {
        targetCategory.value = 'all';
        targetCategory.dispatchEvent(new Event('change'));
    });
}

// Color Picker Helpers
function syncColorInput(picker, textInput, propName) {
    if (!picker) return;

    picker.addEventListener('input', () => {
        applyStyle(propName, picker.value);
        if (textInput) textInput.value = picker.value;
    });

    picker.addEventListener('change', () => {
        saveStateToHistory();
    });

    if (textInput) {
        const handleTextChange = () => {
            let val = textInput.value.trim();
            if (val && !val.startsWith('#')) val = '#' + val;

            if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
                if (val.length === 4) {
                    val = '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
                }
                picker.value = val;
                applyStyle(propName, val);
                saveStateToHistory();
            } else if (textInput) {
                textInput.value = picker.value;
            }
        };

        textInput.addEventListener('change', handleTextChange);
        textInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleTextChange();
        });
        textInput.addEventListener('focus', saveStateToHistory);
    }
}

// Attach sync logic to the color inputs
syncColorInput(bgColorPicker, bgColorText, 'bg');
syncColorInput(overlayColorPicker, overlayColorText, 'overlayColor');
syncColorInput(textColorPicker, textColorText, 'text');
syncColorInput(accentColorPicker, accentColorText, 'accent');
syncColorInput(mechanicBgColorPicker, mechanicBgColorText, 'mechanicBgColor');

// Attach sync logic for stat color inputs
syncColorInput(statBuoyColor, document.getElementById('statBuoyColorText'), 'buoyColor');
syncColorInput(statMinColor, document.getElementById('statMinColorText'), 'minColor');
syncColorInput(statBioColor, document.getElementById('statBioColorText'), 'bioColor');

bgImageUpload.addEventListener('change', handleBgImageUpload);
removeBgImageBtn.addEventListener('click', () => {
    saveStateToHistory();
    applyStyle('bgImage', 'none');
    bgImageUpload.value = '';
});

// Dynamic Range Track Slider Background updates
function updateSliderBackground(slider) {
    if (!slider) return;
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value}%, #cbd5e1 ${value}%, #cbd5e1 100%)`;
    const display = slider.parentNode?.querySelector('.slider-value');
    if (display) display.textContent = parseFloat(slider.value).toFixed(2).replace(/\.?0+$/, '') || '0';
}

function bindSlider(slider, propertyName) {
    // Inject value display span if not already present
    if (!slider.parentNode.querySelector('.slider-value')) {
        const valueSpan = document.createElement('span');
        valueSpan.className = 'slider-value';
        slider.insertAdjacentElement('afterend', valueSpan);
    }
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
bindSlider(mechanicBgOpacitySlider, 'mechanicBgOpacity');
bindSlider(document.getElementById('textGapSlider'), 'textGap');

// Bind stat sliders
bindSlider(statBuoySize, 'buoySize');
bindSlider(statBuoyBgOpacity, 'buoyBgOpacity');
bindSlider(statMinSize, 'minSize');
bindSlider(statBioSize, 'bioSize');

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
document.getElementById('hideIllustrationToggle').addEventListener('change', (e) => { saveStateToHistory(); applyStyle('hideIllustration', e.target.checked); });
showBuoyancyToggle.addEventListener('change', () => { saveStateToHistory(); applyStyle('showBuoy', showBuoyancyToggle.checked); });
addCustomTextBtn.addEventListener('click', handleAddCustomText);
document.querySelectorAll('.icon-add-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAddCustomIcon(btn.dataset.icon));
});

// Bind stat icon selectors and checkboxes
statBuoyVisible.addEventListener('change', () => { saveStateToHistory(); applyStyle('buoyVisible', statBuoyVisible.checked); });
statBuoyIcon.addEventListener('change', () => { saveStateToHistory(); applyStyle('buoyIcon', statBuoyIcon.value); });
statBuoyBgPicker.addEventListener('input', () => { applyStyle('buoyBg', statBuoyBgPicker.value); });
statBuoyBgPicker.addEventListener('change', saveStateToHistory);
statBuoyBgOpacity.addEventListener('input', () => { applyStyle('buoyBgOpacity', statBuoyBgOpacity.value); updateSliderBackground(statBuoyBgOpacity); });
statBuoyBgOpacity.addEventListener('mousedown', saveStateToHistory);
statBuoyRadiusInput.addEventListener('input', () => { saveStateToHistory(); applyStyle('buoyRadius', statBuoyRadiusInput.value); });
statBuoyBgResetBtn.addEventListener('click', () => { saveStateToHistory(); applyStyle('buoyBg', null); statBuoyBgPicker.value = '#1f2937'; });

statMinVisible.addEventListener('change', () => { saveStateToHistory(); applyStyle('minVisible', statMinVisible.checked); });
statMinIcon.addEventListener('change', () => { saveStateToHistory(); applyStyle('minIcon', statMinIcon.value); });

statBioVisible.addEventListener('change', () => { saveStateToHistory(); applyStyle('bioVisible', statBioVisible.checked); });
statBioIcon.addEventListener('change', () => { saveStateToHistory(); applyStyle('bioIcon', statBioIcon.value); });


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

// Add Blank Custom Card Listener
const addBlankCardBtn = document.getElementById('addBlankCardBtn');
addBlankCardBtn.addEventListener('click', () => {
    // Determine the next available Blank Custom count to prevent ID collisions
    let blankCount = 1;
    if (parsedCsvData) {
        blankCount = parsedCsvData.filter(row => row.Card_Title && row.Card_Title.startsWith('Blank Custom')).length + 1;
    } else {
        parsedCsvData = []; // Initialize if no CSV was ever loaded
    }

    const blankRow = {
        Card_Title: `Blank Custom ${blankCount}`,
        Card_Type: 'Blank',
        Qty: '1'
    };

    parsedCsvData.push(blankRow);

    // Save history so they can undo adding the card
    saveStateToHistory();

    // Rerender the deck to show the new card
    generateCards();

    // Auto-save the deck structure to localStorage
    triggerAutoSave();
});


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
            if (rowData.Buoy_Mod) {
                badgesHTML += `<div class="stat-badge buoy-badge" style="display: flex; align-items: center; gap: 4px;">
                    <span class="material-icons" style="font-size: 1.1em;">arrow_downward</span> 
                    <span>${escapeHTML(rowData.Buoy_Mod)}</span>
                </div>`;
            }

            // Add Action Buttons explicitly
            const actionBtnsHTML = `
                <div class="card-action-btns">
                    <button class="duplicate-card-btn material-icons" title="Duplicate this Card" data-index="${parsedCsvData.indexOf(rowData)}">content_copy</button>
                    <button class="delete-card-btn material-icons" title="Delete this Card" data-index="${parsedCsvData.indexOf(rowData)}">delete</button>
                </div>
            `;

            // Build Points HTML (Body)
            let pointsHTML = '';
            if (rowData.Min_Pts || rowData.Bio_Pts) {
                pointsHTML = `<div class="card-points" style="margin: 0.05in 0; font-weight: 600; font-size: 0.6rem; color: var(--dynamic-card-accent); display: flex; align-items: center; gap: 0.15in;">`;
                if (rowData.Min_Pts) {
                    pointsHTML += `<span class="stat-min" style="display: flex; align-items: center; gap: 2px;">
                        <span class="material-icons">diamond</span>
                        ${escapeHTML(rowData.Min_Pts)}
                    </span>`;
                }
                if (rowData.Bio_Pts) {
                    pointsHTML += `<span class="stat-bio" style="display: flex; align-items: center; gap: 2px;">
                        <span class="material-icons">eco</span>
                        ${escapeHTML(rowData.Bio_Pts)}
                    </span>`;
                }
                pointsHTML += `</div>`;
            }

            // Blank cards render with just bg/overlay layers, action buttons, and image placeholder
            if (type === 'Blank') {
                cardEl.innerHTML = `
                    <div class="card-bg-layer"></div>
                    <div class="card-overlay-layer"></div>
                    ${actionBtnsHTML}
                    <div class="card-image-placeholder">Click to add illustration</div>
                `;
            } else {
                cardEl.innerHTML = `
                    <div class="card-bg-layer"></div>
                    <div class="card-overlay-layer"></div>
                    ${actionBtnsHTML}
                    <div class="card-type-banner"></div>
                    <div class="card-header">
                        <h3 class="card-title">${escapeHTML(title)}</h3>
                        <div class="card-stats">${badgesHTML}</div>
                    </div>
                    
                    <div class="card-image-placeholder">Click to add illustration</div>
                    
                    <div class="card-body">
                        ${rowData.Standard_Text ? `<div class="card-standard-text">${parseCardText(rowData.Standard_Text)}</div>` : ''}
                        ${pointsHTML}
                        ${rowData.Red_Filter_Text ? `<div class="card-red-text">${parseCardText(rowData.Red_Filter_Text)}</div>` : ''}
                        ${rowData.Mechanic_Action ? `<div class="card-mechanic">${parseCardText(rowData.Mechanic_Action)}</div>` : ''}
                        ${rowData.Flavor_Text ? `<div class="card-flavor">${parseCardText(rowData.Flavor_Text)}</div>` : ''}
                    </div>
                    ${rowData.Card_ID ? `<div class="card-id-footer">${escapeHTML(rowData.Card_ID)}</div>` : ''}
                `;
            }

            // Attach click/drag/scroll listener for Image (only on non-blank cards)
            const imgPlaceholder = cardEl.querySelector('.card-image-placeholder');

            if (imgPlaceholder) {
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
            } // end if (imgPlaceholder)


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
                // Handle Delete Card Click
                if (e.target.classList.contains('delete-card-btn')) {
                    const rowIdx = parseInt(e.target.dataset.index, 10);
                    if (!isNaN(rowIdx)) {
                        saveStateToHistory(); // Allows Ctrl+Z to recover an accidental delete
                        parsedCsvData.splice(rowIdx, 1);
                        setTimeout(() => {
                            generateCards();
                            triggerAutoSave();
                        }, 10);
                        return;
                    }
                }

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
                        setTimeout(() => {
                            generateCards();
                            triggerAutoSave();
                        }, 10);
                        return;
                    }
                }

                // Ignore clicks on images or custom texts so we don't interrupt uploads/drags
                if (e.target.closest('.card-image-placeholder') || e.target.closest('.custom-text-element')) return;

                // Clicking the card background clears any element multi-selection
                clearCtxSelection();

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

        // Create the dropdown option directly without pre-initializing a permanent categoryStyles override
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

function getEffectiveStyles(target, knownCategory) {
    const baseGlobal = categoryStyles["all"] || {};
    if (target === 'all') return baseGlobal;

    if (target.startsWith('cat_')) {
        const catName = target.substring(4);
        const isBackside = catName.startsWith('Back_');
        const baseCat = categoryStyles[target] || {};
        if (isBackside) return { ...baseCat };
        return { ...baseGlobal, ...baseCat };
    }

    if (target.startsWith('card_')) {
        const sysId = target.substring(5);
        // Use knownCategory if provided (avoids DOM query when card isn't in DOM yet)
        let catName = knownCategory || null;
        if (!catName) {
            const cardEl = document.querySelector(`.game-card[data-sys-id="${CSS.escape(sysId)}"]`);
            catName = cardEl ? cardEl.dataset.category : null;
        }
        const isBackside = catName ? catName.startsWith('Back_') : false;

        const baseCat = catName ? (categoryStyles["cat_" + catName] || {}) : {};
        const baseCard = categoryStyles[target] || {};

        if (isBackside) return { ...baseCat, ...baseCard };
        return { ...baseGlobal, ...baseCat, ...baseCard };
    }
    return baseGlobal;
}

function updateControlsToMatchCategory() {
    const target = targetCategory.value;
    const styles = getEffectiveStyles(target);

    // 1. Sync the UI controls if we have stored styles for this target
    if (styles) {
        if (bgColorPicker) bgColorPicker.value = styles.bg;
        if (bgColorText) bgColorText.value = styles.bg;
        if (bgImageUpload && (!styles.bgImage || styles.bgImage === 'none')) {
            bgImageUpload.value = '';
        }
        if (bgScaleSlider) bgScaleSlider.value = styles.bgScale !== undefined ? styles.bgScale : "100";
        if (bgPosXSlider) bgPosXSlider.value = styles.bgPosX !== undefined ? styles.bgPosX : "50";
        if (bgPosYSlider) bgPosYSlider.value = styles.bgPosY !== undefined ? styles.bgPosY : "50";
        if (fgScaleSlider) fgScaleSlider.value = styles.fgScale !== undefined ? styles.fgScale : "100";
        if (fgHeightSlider) fgHeightSlider.value = styles.fgHeight !== undefined ? styles.fgHeight : "1";
        if (fgPosXSlider) fgPosXSlider.value = styles.fgPosX !== undefined ? styles.fgPosX : "50";
        if (fgPosYSlider) fgPosYSlider.value = styles.fgPosY !== undefined ? styles.fgPosY : "50";
        if (overlayColorPicker) overlayColorPicker.value = styles.overlayColor !== undefined ? styles.overlayColor : "#ffffff";
        if (overlayColorText) overlayColorText.value = styles.overlayColor !== undefined ? styles.overlayColor : "#ffffff";
        if (overlayOpacitySlider) overlayOpacitySlider.value = styles.overlayOpacity !== undefined ? styles.overlayOpacity : "0";
        if (textColorPicker) textColorPicker.value = styles.text;
        if (textColorText) textColorText.value = styles.text;
        if (accentColorPicker) accentColorPicker.value = styles.accent;
        if (accentColorText) accentColorText.value = styles.accent;

        // Sync Typography Controls
        if (fontFamilySelect) fontFamilySelect.value = styles.font;
        if (fontSizeSlider) fontSizeSlider.value = styles.size;
        if (wordBreakToggle) wordBreakToggle.checked = styles.wordBreak;
        const hideIllustrationToggleEl = document.getElementById('hideIllustrationToggle');
        if (hideIllustrationToggleEl) hideIllustrationToggleEl.checked = styles.hideIllustration !== undefined ? styles.hideIllustration : false;
        if (showBuoyancyToggle) showBuoyancyToggle.checked = (styles.showBuoy !== undefined) ? styles.showBuoy : true;
        const textGapSliderEl = document.getElementById('textGapSlider');
        if (textGapSliderEl) { textGapSliderEl.value = styles.textGap !== undefined ? styles.textGap : "0.06"; updateSliderBackground(textGapSliderEl); }
        if (mechanicBgColorPicker) { const c = styles.mechanicBgColor || '#000000'; mechanicBgColorPicker.value = c; if (mechanicBgColorText) mechanicBgColorText.value = c; }
        if (mechanicBgOpacitySlider) { mechanicBgOpacitySlider.value = styles.mechanicBgOpacity !== undefined ? styles.mechanicBgOpacity : '0.04'; updateSliderBackground(mechanicBgOpacitySlider); }

        // Stat Icons
        if (statBuoyVisible) statBuoyVisible.checked = (styles.buoyVisible !== undefined) ? styles.buoyVisible : true;
        if (statBuoyIcon) statBuoyIcon.value = styles.buoyIcon || 'arrow_downward';
        if (statBuoySize) statBuoySize.value = styles.buoySize || '1.1';
        if (statBuoyColor) statBuoyColor.value = styles.buoyColor || '#ffffff';
        if (document.getElementById('statBuoyColorText')) document.getElementById('statBuoyColorText').value = styles.buoyColor || '#ffffff';
        if (statBuoyBgPicker) statBuoyBgPicker.value = styles.buoyBg || '#1f2937';
        if (statBuoyBgOpacity) { statBuoyBgOpacity.value = styles.buoyBgOpacity !== undefined ? styles.buoyBgOpacity : '1'; updateSliderBackground(statBuoyBgOpacity); }
        if (statBuoyRadiusInput) statBuoyRadiusInput.value = styles.buoyRadius !== undefined ? styles.buoyRadius : '2';

        if (statMinVisible) statMinVisible.checked = (styles.minVisible !== undefined) ? styles.minVisible : true;
        if (statMinIcon) statMinIcon.value = styles.minIcon || 'diamond';
        if (statMinSize) statMinSize.value = styles.minSize || '1.6';
        if (statMinColor) statMinColor.value = styles.minColor || '#1f2937';
        if (document.getElementById('statMinColorText')) document.getElementById('statMinColorText').value = styles.minColor || '#1f2937';

        if (statBioVisible) statBioVisible.checked = (styles.bioVisible !== undefined) ? styles.bioVisible : true;
        if (statBioIcon) statBioIcon.value = styles.bioIcon || 'eco';
        if (statBioSize) statBioSize.value = styles.bioSize || '1.6';
        if (statBioColor) statBioColor.value = styles.bioColor || '#1f2937';
        if (document.getElementById('statBioColorText')) document.getElementById('statBioColorText').value = styles.bioColor || '#1f2937';

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
        updateSliderBackground(statBuoySize);
        updateSliderBackground(statMinSize);
        updateSliderBackground(statBioSize);
        updateSliderBackground(document.getElementById('textGapSlider'));
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
    if (!hex || typeof hex !== 'string') return `rgba(0, 0, 0, ${opacity})`;
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
    if (propName === 'hideIllustration') {
        cardDiv.classList.toggle('hide-illustration-manual', !!value);
    }
    if (propName === 'showBuoy') {
        cardDiv.style.setProperty('--dynamic-card-buoy-display', value ? 'flex' : 'none');
    }
    if (propName === 'textGap') {
        cardDiv.style.setProperty('--card-text-gap', `${value}in`);
    }
    if (propName === 'mechanicBgColor') {
        cardDiv.dataset.mechanicBgColor = value;
        const opacity = cardDiv.dataset.mechanicBgOpacity ?? '0.04';
        const rgb = hexToRgb(value);
        if (rgb) cardDiv.style.setProperty('--card-mechanic-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
    }
    if (propName === 'mechanicBgOpacity') {
        cardDiv.dataset.mechanicBgOpacity = value;
        const hex = cardDiv.dataset.mechanicBgColor ?? '#000000';
        const rgb = hexToRgb(hex);
        if (rgb) cardDiv.style.setProperty('--card-mechanic-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${value})`);
    }

    // Stat properties
    if (propName === 'buoyVisible') cardDiv.style.setProperty('--stat-buoy-display', value ? 'flex' : 'none');
    if (propName === 'buoyIcon') {
        const buoyIconEl = cardDiv.querySelector('.buoy-badge .material-icons');
        if (buoyIconEl) buoyIconEl.textContent = value;
    }
    if (propName === 'buoySize') cardDiv.style.setProperty('--stat-buoy-size', `${value}em`);
    if (propName === 'buoyColor') cardDiv.style.setProperty('--stat-buoy-color', value);
    if (propName === 'buoyBg') {
        if (!value) {
            cardDiv.style.removeProperty('--stat-buoy-bg');
            cardDiv.dataset.buoyBg = '';
        } else {
            cardDiv.dataset.buoyBg = value;
            const opacity = cardDiv.dataset.buoyBgOpacity ?? '1';
            const rgb = hexToRgb(value);
            if (rgb) cardDiv.style.setProperty('--stat-buoy-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
        }
    }
    if (propName === 'buoyBgOpacity') {
        cardDiv.dataset.buoyBgOpacity = value;
        const hex = cardDiv.dataset.buoyBg;
        if (hex) {
            const rgb = hexToRgb(hex);
            if (rgb) cardDiv.style.setProperty('--stat-buoy-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${value})`);
        }
    }
    if (propName === 'buoyRadius') cardDiv.style.setProperty('--stat-buoy-radius', `${value}px`);

    if (propName === 'minVisible') cardDiv.style.setProperty('--stat-min-display', value ? 'flex' : 'none');
    if (propName === 'minIcon') {
        const minIconEl = cardDiv.querySelector('.stat-min .material-icons');
        if (minIconEl) minIconEl.textContent = value;
    }
    if (propName === 'minSize') cardDiv.style.setProperty('--stat-min-size', `${value}em`);
    if (propName === 'minColor') cardDiv.style.setProperty('--stat-min-color', value);

    if (propName === 'bioVisible') cardDiv.style.setProperty('--stat-bio-display', value ? 'flex' : 'none');
    if (propName === 'bioIcon') {
        const bioIconEl = cardDiv.querySelector('.stat-bio .material-icons');
        if (bioIconEl) bioIconEl.textContent = value;
    }
    if (propName === 'bioSize') cardDiv.style.setProperty('--stat-bio-size', `${value}em`);
    if (propName === 'bioColor') cardDiv.style.setProperty('--stat-bio-color', value);
}

function applyStoredStyles(cardDiv, category, title) {
    const sysId = title;

    // INFERENCE LOGIC: Check siblings if we have NO specific styling yet
    // Backside cards manage their own copies via the JSON preset — skip inference entirely.
    const isBackside = category.startsWith('Back_');
    if (!categoryStyles["card_" + sysId] && !isBackside && parsedCsvData && parsedCsvData.length > 0) {
        // Frontside cards with no stored styles: use sibling inference
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

            const reversedSiblings = [...siblings].reverse();
            let chosenSiblingStyle = null;

            for (let sibSysId of reversedSiblings) {
                if (sibSysId !== sysId && categoryStyles["card_" + sibSysId]) {
                    chosenSiblingStyle = categoryStyles["card_" + sibSysId];
                    break;
                }
            }

            if (chosenSiblingStyle) {
                const baseCard = JSON.parse(JSON.stringify(chosenSiblingStyle));
                if (baseCard.fgImage) baseCard.fgImage = 'none';
                if (baseCard.customTexts) {
                    baseCard.customTexts.forEach(txt => {
                        txt.id = 'ctx_' + Math.random().toString(36).substr(2, 9) + Date.now();
                    });
                }
                categoryStyles["card_" + sysId] = baseCard;
            }
    }

    const styles = getEffectiveStyles("card_" + sysId, category);

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
    updateCSSCustomProperty(cardDiv, 'hideIllustration', styles.hideIllustration !== undefined ? styles.hideIllustration : false);
    updateCSSCustomProperty(cardDiv, 'mechanicBgColor', styles.mechanicBgColor !== undefined ? styles.mechanicBgColor : '#000000');
    updateCSSCustomProperty(cardDiv, 'mechanicBgOpacity', styles.mechanicBgOpacity !== undefined ? styles.mechanicBgOpacity : '0.04');
    updateCSSCustomProperty(cardDiv, 'showBuoy', (styles.showBuoy !== undefined) ? styles.showBuoy : true);
    updateCSSCustomProperty(cardDiv, 'buoyBg', styles.buoyBg || null);
    updateCSSCustomProperty(cardDiv, 'buoyBgOpacity', styles.buoyBgOpacity !== undefined ? styles.buoyBgOpacity : '1');
    updateCSSCustomProperty(cardDiv, 'buoyRadius', styles.buoyRadius !== undefined ? styles.buoyRadius : '2');

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
        if (txt.bold) wrapper.style.fontWeight = 'bold';
        else wrapper.style.fontWeight = '600';
        if (txt.boxWidth) wrapper.style.width = txt.boxWidth + 'px';
        if (txt.boxHeight) wrapper.style.height = txt.boxHeight + 'px';

        const backdropDiv = document.createElement('div');
        backdropDiv.className = 'custom-backdrop';
        if (txt.bg && txt.bg !== 'transparent') {
            const rgb = hexToRgb(txt.bg);
            const opacity = txt.bgOpacity !== undefined ? txt.bgOpacity : 1;
            backdropDiv.style.backgroundColor = rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})` : txt.bg;
        }
        if (txt.borderRadius) backdropDiv.style.borderRadius = txt.borderRadius + 'px';
        wrapper.appendChild(backdropDiv);

        const contentSpan = document.createElement('span');
        if (txt.type === 'icon') {
            contentSpan.className = 'material-icons custom-icon-content';
            contentSpan.textContent = txt.text;
            if (txt.stroke) contentSpan.style.webkitTextStroke = txt.stroke + 'px currentColor';
        } else {
            contentSpan.className = 'custom-text-content';
            contentSpan.innerText = txt.text;
        }

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

    scheduleIllustrationCheck();
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
}

/**
 * Parses a lightweight markdown-like syntax from CSV text fields into card HTML.
 *
 * Per-line tokens:
 *   ## Heading / ###Heading / ####Heading  → h2 / h3 / h4 (space after # is optional)
 *   - item  or  * item                     → unordered bullet list
 *   1. item  or  1) item                   → ordered numbered list
 *   ---                                    → thin horizontal rule
 *   [gap:0.1in]                            → explicit spacer of any CSS size
 *   (blank line)                           → paragraph gap (--card-text-gap)
 *   anything else                          → plain text span
 *
 * Inline tokens (applied within any text):
 *   **bold**   → <strong>
 *   *italic*   → <em>  (single asterisk, not adjacent to another *)
 *
 * All text is HTML-escaped before inline tokens are applied — no injection risk.
 */

// Applies **bold** and *italic* to an already-HTML-escaped string.
function applyInline(escaped) {
    return escaped
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
}

function parseCardText(str) {
    if (!str) return '';

    const lines = str.split('\n');
    const result = [];
    let listBuffer = [];
    let listType = null; // 'ul' or 'ol'
    let olCounter = 1; // tracks the running number for ordered lists across blank-line gaps

    const flushList = (resetOl = false) => {
        if (listBuffer.length > 0) {
            if (listType === 'ol') {
                result.push(`<ol class="card-text-list" start="${olCounter}">${listBuffer.map(i => `<li>${i}</li>`).join('')}</ol>`);
                olCounter += listBuffer.length;
            } else {
                result.push(`<ul class="card-text-list">${listBuffer.map(i => `<li>${i}</li>`).join('')}</ul>`);
            }
            listBuffer = [];
            listType = null;
        }
        if (resetOl) olCounter = 1;
    };

    const inline = str => applyInline(escapeHTML(str));

    lines.forEach(rawLine => {
        const trimmed = rawLine.trim();

        if (trimmed === '') {
            flushList(); // blank line preserves olCounter so gaps between items don't reset numbering
            result.push('<div class="card-text-gap"></div>');
        } else if (trimmed === '---') {
            flushList(true);
            result.push('<hr class="card-text-divider">');
        } else if (/^\[gap:[^\]]+\]$/.test(trimmed)) {
            flushList(); // gap tag also preserves numbering
            const size = escapeHTML(trimmed.match(/^\[gap:([^\]]+)\]$/)[1]);
            result.push(`<div class="card-text-gap" style="height:${size}"></div>`);
        } else if (/^####/.test(trimmed)) {
            flushList(true);
            result.push(`<span class="card-text-h4">${inline(trimmed.replace(/^####\s*/, ''))}</span>`);
        } else if (/^###/.test(trimmed)) {
            flushList(true);
            result.push(`<span class="card-text-h3">${inline(trimmed.replace(/^###\s*/, ''))}</span>`);
        } else if (/^##/.test(trimmed)) {
            flushList(true);
            result.push(`<span class="card-text-h2">${inline(trimmed.replace(/^##\s*/, ''))}</span>`);
        } else if (/^[-*] /.test(trimmed)) {
            if (listType === 'ol') flushList(true);
            listType = 'ul';
            listBuffer.push(inline(trimmed.slice(2)));
        } else if (/^\d+[.)]\s/.test(trimmed)) {
            if (listType === 'ul') flushList(true);
            listType = 'ol';
            listBuffer.push(inline(trimmed.replace(/^\d+[.)]\s/, '')));
        } else {
            flushList(true);
            result.push(`<span class="card-text-p">${inline(rawLine)}</span>`);
        }
    });

    flushList();
    return result.join('');
}

// --- Illustration overflow detection ---
// When a card's body text exceeds the available space (after the fixed-height
// illustration), we hide the illustration so the body can expand to fill the card.

function scheduleIllustrationCheck() {
    clearTimeout(_illustrationCheckTimer);
    _illustrationCheckTimer = setTimeout(() => {
        document.querySelectorAll('.game-card').forEach(checkIllustrationOverflow);
    }, 60);
}

function checkIllustrationOverflow(cardDiv) {
    const body = cardDiv.querySelector('.card-body');
    if (!body) return; // blank / backside cards have no body

    // Reset first so we measure with the illustration present
    cardDiv.classList.remove('no-illustration');

    // If body content is taller than its container, the illustration is crowding it out
    if (body.scrollHeight > body.clientHeight + 1) {
        cardDiv.classList.add('no-illustration');
    }
}

function handleAddCustomText() {
    saveStateToHistory();
    const target = targetCategory.value;
    const newText = { id: 'ctx_' + Date.now(), text: 'New Text', x: 50, y: 50 };

    if (!categoryStyles[target]) {
        categoryStyles[target] = {};
    }
    if (!categoryStyles[target].customTexts) {
        // Copy inherited texts uniquely for this layer so we don't accidentally edit the parent's array
        const effective = getEffectiveStyles(target);
        categoryStyles[target].customTexts = effective.customTexts ? JSON.parse(JSON.stringify(effective.customTexts)) : [];
        // Ensure new IDs for cloned templates
        categoryStyles[target].customTexts.forEach(txt => {
            txt.id = 'ctx_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
        });
    }
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

function handleAddCustomIcon(iconName) {
    saveStateToHistory();
    const target = targetCategory.value;
    const newIcon = { id: 'ctx_' + Date.now(), text: iconName, type: 'icon', x: 50, y: 50 };

    if (!categoryStyles[target]) categoryStyles[target] = {};
    if (!categoryStyles[target].customTexts) {
        const effective = getEffectiveStyles(target);
        categoryStyles[target].customTexts = effective.customTexts ? JSON.parse(JSON.stringify(effective.customTexts)) : [];
        categoryStyles[target].customTexts.forEach(t => {
            t.id = 'ctx_' + Date.now().toString() + Math.random().toString(36).substring(2, 11);
        });
    }
    categoryStyles[target].customTexts.push(newIcon);

    if (target === 'all') {
        Object.keys(categoryStyles).forEach(key => {
            if (key !== 'all' && !key.includes('_Back_')) {
                if (!categoryStyles[key].customTexts) categoryStyles[key].customTexts = [];
                categoryStyles[key].customTexts.push({ ...newIcon });
            }
        });
    } else if (target.startsWith('cat_')) {
        const catName = target.substring(4);
        document.querySelectorAll('.game-card').forEach(card => {
            if (card.dataset.category === catName) {
                const cardKey = 'card_' + card.dataset.sysId;
                if (categoryStyles[cardKey]) {
                    if (!categoryStyles[cardKey].customTexts) categoryStyles[cardKey].customTexts = [];
                    if (!categoryStyles[cardKey].customTexts.find(t => t.id === newIcon.id)) {
                        categoryStyles[cardKey].customTexts.push({ ...newIcon });
                    }
                }
            }
        });
    }

    document.querySelectorAll('.game-card').forEach(card => {
        applyStoredStyles(card, card.dataset.category, card.dataset.sysId);
    });
}

function attachCustomTextEvents(wrapper, cardDiv, txtId, contentSpan, deleteBtn) {
    let isDragging = false;

    wrapper.addEventListener('mousedown', (e) => {
        // Shift+click: toggle this element in the multi-selection
        if (e.shiftKey) {
            e.stopPropagation();
            if (selectedCtxIds.has(txtId)) {
                selectedCtxIds.delete(txtId);
                wrapper.classList.remove('is-selected');
            } else {
                selectedCtxIds.add(txtId);
                wrapper.classList.add('is-selected');
            }
            return;
        }

        // Regular click: clear multi-selection, select just this one
        clearCtxSelection();
        selectedCtxIds.add(txtId);
        wrapper.classList.add('is-selected');

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

        // Design guides — lazily inject once per card, then show/snap near center
        const SNAP_THRESHOLD = 2.5;
        const SHOW_THRESHOLD = 5;

        let guideH = cardDiv.querySelector('.design-guide-h');
        let guideV = cardDiv.querySelector('.design-guide-v');
        if (!guideH) {
            guideH = document.createElement('div');
            guideH.className = 'design-guide design-guide-h';
            cardDiv.appendChild(guideH);
        }
        if (!guideV) {
            guideV = document.createElement('div');
            guideV.className = 'design-guide design-guide-v';
            cardDiv.appendChild(guideV);
        }

        if (Math.abs(newY - 50) <= SNAP_THRESHOLD) {
            newY = 50;
            guideH.classList.add('is-visible');
        } else {
            guideH.classList.toggle('is-visible', Math.abs(newY - 50) <= SHOW_THRESHOLD);
        }

        if (Math.abs(newX - 50) <= SNAP_THRESHOLD) {
            newX = 50;
            guideV.classList.add('is-visible');
        } else {
            guideV.classList.toggle('is-visible', Math.abs(newX - 50) <= SHOW_THRESHOLD);
        }

        wrapper.style.left = newX + '%';
        wrapper.style.top = newY + '%';

        syncCustomTextPosUI(txtId, newX, newY);
    });

    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;

        // Hide design guides
        cardDiv.querySelectorAll('.design-guide').forEach(g => g.classList.remove('is-visible'));

        const newX = parseFloat(wrapper.style.left);
        const newY = parseFloat(wrapper.style.top);
        updateCustomTextDataStore(txtId, { x: newX, y: newY });
    });

    wrapper.addEventListener('dblclick', (e) => {
        if (contentSpan.classList.contains('custom-icon-content')) return;
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

    if (!categoryStyles[target]) categoryStyles[target] = {};

    let ownsText = categoryStyles[target].customTexts && categoryStyles[target].customTexts.some(t => t.id === id);
    if (!ownsText) {
        const effective = getEffectiveStyles(target);
        categoryStyles[target].customTexts = effective.customTexts ? JSON.parse(JSON.stringify(effective.customTexts)) : [];
    }

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

    if (!categoryStyles[target]) categoryStyles[target] = {};

    let ownsText = categoryStyles[target].customTexts && categoryStyles[target].customTexts.some(t => t.id === id);
    if (!ownsText) {
        const effective = getEffectiveStyles(target);
        categoryStyles[target].customTexts = effective.customTexts ? JSON.parse(JSON.stringify(effective.customTexts)) : [];
    }

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
        if (categoryStyles[target].customTexts) {
            categoryStyles[target].customTexts = categoryStyles[target].customTexts.filter(t => t.id !== id);
        }
    } else {
        // Just the single card
        if (categoryStyles[target].customTexts) {
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
const ctxBgOpacitySlider = document.getElementById('ctxBgOpacitySlider');
const ctxClearBgBtn = document.getElementById('ctxClearBgBtn');
const ctxBorderRadiusInput = document.getElementById('ctxBorderRadiusInput');
const ctxBoxWidthInput = document.getElementById('ctxBoxWidthInput');
const ctxBoxHeightInput = document.getElementById('ctxBoxHeightInput');
const ctxStrokeInput = document.getElementById('ctxStrokeInput');
const ctxTextOnlyFields = document.getElementById('ctxTextOnlyFields');
const ctxIconOnlyFields = document.getElementById('ctxIconOnlyFields');

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

    const isIcon = !!wrapper.querySelector('.custom-icon-content');
    ctxTextOnlyFields.style.display = isIcon ? 'none' : '';
    ctxIconOnlyFields.style.display = isIcon ? '' : 'none';

    if (txtData) {
        ctxFontSelect.value = txtData.font || 'inherit';
        ctxSizeInput.value = txtData.size || 1;
        ctxBoldToggle.checked = !!txtData.bold;
        ctxColorPicker.value = txtData.color || '#111827';
        // HTML Color inputs only support 6-character hex
        ctxBgPicker.value = (txtData.bg && txtData.bg !== 'transparent') ? txtData.bg : '#ffffff';
        ctxBgOpacitySlider.value = txtData.bgOpacity !== undefined ? txtData.bgOpacity : (txtData.bg && txtData.bg !== 'transparent' ? 1 : 0);
        updateSliderBackground(ctxBgOpacitySlider);
        ctxBorderRadiusInput.value = txtData.borderRadius || 0;
        ctxBoxWidthInput.value = txtData.boxWidth || '';
        ctxBoxHeightInput.value = txtData.boxHeight || '';
        ctxStrokeInput.value = txtData.stroke || 0;
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
    const opacity = ctxBgOpacitySlider.value;
    updateCustomTextDataStore(activeCtxId, { bg: ctxBgPicker.value, bgOpacity: opacity });
    const rgb = hexToRgb(ctxBgPicker.value);
    const backdrop = activeCtxWrapper.querySelector('.custom-backdrop');
    if (backdrop) backdrop.style.backgroundColor = rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})` : ctxBgPicker.value;
});
ctxBgOpacitySlider.addEventListener('mousedown', saveStateToHistory);
ctxBgOpacitySlider.addEventListener('input', () => {
    if (!activeCtxId) return;
    const opacity = ctxBgOpacitySlider.value;
    updateCustomTextDataStore(activeCtxId, { bgOpacity: opacity });
    const rgb = hexToRgb(ctxBgPicker.value);
    const backdrop = activeCtxWrapper.querySelector('.custom-backdrop');
    if (backdrop) backdrop.style.backgroundColor = rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})` : '';
    updateSliderBackground(ctxBgOpacitySlider);
});
ctxClearBgBtn.addEventListener('click', () => {
    if (!activeCtxId) return;
    updateCustomTextDataStore(activeCtxId, { bg: 'transparent', bgOpacity: 0 });
    ctxBgOpacitySlider.value = 0;
    updateSliderBackground(ctxBgOpacitySlider);
    const backdrop = activeCtxWrapper.querySelector('.custom-backdrop');
    if (backdrop) backdrop.style.backgroundColor = '';
});
ctxBorderRadiusInput.addEventListener('mousedown', saveStateToHistory);
ctxBorderRadiusInput.addEventListener('input', () => {
    if (!activeCtxId) return;
    const r = ctxBorderRadiusInput.value + 'px';
    updateCustomTextDataStore(activeCtxId, { borderRadius: ctxBorderRadiusInput.value });
    const backdrop = activeCtxWrapper.querySelector('.custom-backdrop');
    if (backdrop) backdrop.style.borderRadius = r;
});
ctxStrokeInput.addEventListener('mousedown', saveStateToHistory);
ctxStrokeInput.addEventListener('input', () => {
    if (!activeCtxId) return;
    updateCustomTextDataStore(activeCtxId, { stroke: ctxStrokeInput.value });
    const iconSpan = activeCtxWrapper.querySelector('.custom-icon-content');
    if (iconSpan) iconSpan.style.webkitTextStroke = ctxStrokeInput.value + 'px currentColor';
});
ctxBoxWidthInput.addEventListener('mousedown', saveStateToHistory);
ctxBoxWidthInput.addEventListener('input', () => {
    if (!activeCtxId) return;
    const val = ctxBoxWidthInput.value;
    updateCustomTextDataStore(activeCtxId, { boxWidth: val });
    activeCtxWrapper.style.width = val ? val + 'px' : '';
});
ctxBoxHeightInput.addEventListener('mousedown', saveStateToHistory);
ctxBoxHeightInput.addEventListener('input', () => {
    if (!activeCtxId) return;
    const val = ctxBoxHeightInput.value;
    updateCustomTextDataStore(activeCtxId, { boxHeight: val });
    activeCtxWrapper.style.height = val ? val + 'px' : '';
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

// Helper to convert hex to RGB
function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
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
    if (!a11yChecker || !a11yRatio || !a11yIcon || !a11yStatus) return; // Safety check for DOM elements

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

function getLocalPresets() {
    const data = localStorage.getItem(PRESETS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function saveLocalPresets(presets) {
    try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
        return true;
    } catch (e) {
        console.error("Local Storage Save Failed:", e);
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            alert("Error: Browser storage limit exceeded! This usually happens if you've uploaded very large background images. Please use the 'Export JSON' button instead to safely save your deck to your computer.");
        } else {
            alert("Failed to save preset to local browser storage.");
        }
        return false;
    }
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

/**
 * Build a fully-resolved styles map for persisting/exporting.
 * Instead of exporting the sparse `categoryStyles` (which only contains explicit overrides),
 * we walk every known card and category and resolve their FULL effective style via getEffectiveStyles.
 * This ensures duplicate cards and backside templates that inherit styles are correctly captured.
 */
function resolveStylesForExport() {
    const resolved = {};

    // Always include the global base
    resolved['all'] = JSON.parse(JSON.stringify(categoryStyles['all'] || {}));

    // Resolve every category
    cardCategories.forEach(cat => {
        const key = 'cat_' + cat;
        resolved[key] = JSON.parse(JSON.stringify(getEffectiveStyles(key)));
    });

    // Resolve every individual card
    cardTitles.forEach(sysId => {
        const key = 'card_' + sysId;
        resolved[key] = JSON.parse(JSON.stringify(getEffectiveStyles(key)));
    });

    return resolved;
}

function handleSavePreset() {
    const name = prompt("Enter a name for this preset:");
    if (!name || name.trim() === '') return;

    const presets = getLocalPresets();
    presets[name.trim()] = {
        styles: resolveStylesForExport(),
        mappings: JSON.parse(JSON.stringify(backsideMappings)),
        deck: JSON.parse(JSON.stringify(parsedCsvData))
    };

    const success = saveLocalPresets(presets);
    if (!success) {
        resetPresetButtons();
        return;
    }

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
        styles: resolveStylesForExport(),
        mappings: JSON.parse(JSON.stringify(backsideMappings)),
        deck: JSON.parse(JSON.stringify(parsedCsvData))
    };

    const success = saveLocalPresets(presets);
    if (!success) return;

    setPresetSavedState('update');
}

function handleDeletePreset() {
    const selected = presetSelect.value;
    if (!selected) return;

    if (confirm(`Are you sure you want to delete preset "${selected}"?`)) {
        const presets = getLocalPresets();
        delete presets[selected];
        const success = saveLocalPresets(presets);

        if (success) {
            populatePresetDropdown();
            presetSelect.value = '';

            // Reset disabled states
            updatePresetBtn.disabled = true;
            deletePresetBtn.disabled = true;

            alert(`Preset "${selected}" deleted.`);
        }
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
    let shouldMergeDeck = false;
    let shouldOverwriteDeck = false;

    if (data.styles) {
        // New save format
        categoryStyles = JSON.parse(JSON.stringify(data.styles));
        backsideMappings = data.mappings ? JSON.parse(JSON.stringify(data.mappings)) : {};
        if (data.deck && data.deck.length > 0) {
            if (parsedCsvData && parsedCsvData.length > 0) {
                if (confirm("This preset contains your saved deck layout (duplicates, blank cards, background cards, custom images, custom text).\n\n✅ OK  → RECOMMENDED: Restore full deck layout and refresh text from your current CSV\n\n❌ Cancel → DESTRUCTIVE: Apply styles only using the raw CSV — your duplicates, blank cards, and background cards will all be LOST")) {
                    shouldMergeDeck = true;
                }
            } else {
                shouldOverwriteDeck = true;
            }
        }
    } else {
        // Legacy save format (backwards compatibility)
        categoryStyles = JSON.parse(JSON.stringify(data));
        backsideMappings = {};
    }

    if (shouldMergeDeck && data.deck) {
        const oldDeck = JSON.parse(JSON.stringify(data.deck));

        // Build a lookup of the freshly parsed CSV data.
        // Key = Card_Title if non-empty, else Card_ID — handles backside cards that
        // have no title but have unique IDs (BEP-001, BMP-001, etc.)
        const deckKey = row => ((row.Card_Title || '').trim() || (row.Card_ID || '').trim());
        const freshCsvDict = {};
        if (parsedCsvData) {
            parsedCsvData.forEach(row => {
                freshCsvDict[deckKey(row)] = row;
            });
        }

        const mergedDeck = [];
        const mergedKeys = new Set();

        // 1. Iterate through the old structural deck (which holds manual duplicates!)
        oldDeck.forEach(oldRow => {
            const key = deckKey(oldRow);
            mergedKeys.add(key);
            const freshData = freshCsvDict[key];

            if (freshData) {
                // Merge: Keep the old structural properties (Qty) but overwrite with the fresh textual data
                // This means the user's manual duplicates are preserved, but they get the updated text!
                const mergedRow = { ...freshData, Qty: oldRow.Qty };
                mergedDeck.push(mergedRow);
            } else {
                // If the card no longer exists in the CSV, just keep the old one entirely so we don't break the layout
                mergedDeck.push(oldRow);
            }
        });

        // 2. Append brand new cards from the CSV that were NOT in the old deck
        let brandNewCards = [];
        if (parsedCsvData) {
            brandNewCards = parsedCsvData.filter(row => !mergedKeys.has(deckKey(row)));
        }

        parsedCsvData = [...mergedDeck, ...brandNewCards];
    } else if (shouldOverwriteDeck && data.deck) {
        parsedCsvData = JSON.parse(JSON.stringify(data.deck));
    }

    if (parsedCsvData && parsedCsvData.length > 0) {
        // ALWAYS re-generate the grid to reliably rebuild `cardTitles` and `updateCategoryDropdown()`
        // This ensures whether we kept the CSV or overwrote it, the DOM perfectly matches `categoryStyles` 
        // and we don't end up with un-targetable "single view" cards.
        generateCards();
        document.getElementById('generateBtn').disabled = false;
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
            styles: resolveStylesForExport(),
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
            if (style.customTexts) {
                for (const txt of style.customTexts) {
                    if (txt.bg && txt.bg.includes('/uploads/')) {
                        const urlMatch = txt.bg.match(/url\(['"]?([^'"]+)['"]?\)/);
                        if (urlMatch && urlMatch[1]) {
                            const base64 = await urlToBase64(urlMatch[1]);
                            if (base64) txt.bgBase64 = base64;
                        }
                    }
                }
            }
        }

        const jsonString = JSON.stringify(exportData, null, 2);

        if (window.showSaveFilePicker) {
            try {
                // Use modern File System Access API to explicitly prompt for a save location
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'deckmaker_preset.json',
                    types: [{
                        description: 'JSON Data',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await fileHandle.createWritable();
                await writable.write(jsonString);
                await writable.close();
            } catch (err) {
                // Usually an AbortError if the user simply closed the dialog without saving
                if (err.name !== 'AbortError') {
                    console.error("Save file picker failed:", err);
                    alert("Failed to save via file picker.");
                }
            }
        } else {
            // Fallback for browsers that don't support showSaveFilePicker (Firefox occasionally, or non-secure contexts)
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "deckmaker_preset.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
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
            const stylesToProcess = importedData.styles ? importedData.styles : importedData;

            // Decide how to handle the saved deck structure.
            // Always merge if JSON has a deck — this restores duplicates, blank cards, etc.
            // No confirm needed: if you imported a preset JSON, you always want the full layout back.
            let shouldMergeDeck = false;
            let shouldOverwriteDeck = false;

            if (importedData.deck && importedData.deck.length > 0) {
                if (parsedCsvData && parsedCsvData.length > 0) {
                    shouldMergeDeck = true;
                } else {
                    shouldOverwriteDeck = true;
                }
            }

            // ── STEP 1: Ask about saving to local presets ──
            // Wait briefly so the file picker fully closes and the browser restores
            // window focus — otherwise Chrome auto-dismisses confirm() dialogs.
            await new Promise(resolve => setTimeout(resolve, 500));

            // Decide if user wants to save to local presets
            let saveToLocal = false;
            let localPresetName = null;
            saveToLocal = confirm("Also save this preset to your local browser presets for quick access?");
            if (saveToLocal) {
                localPresetName = prompt("Enter a name for this preset:");
                if (!localPresetName || localPresetName.trim() === '') saveToLocal = false;
            }

            // ── STEP 2: Now do the async image uploads ──
            document.body.style.cursor = 'wait';

            const uploadPromises = [];
            const urlMapping = {};

            for (const targetKey in stylesToProcess) {
                const style = stylesToProcess[targetKey];

                if (style.bgImageBase64) {
                    const oldUrl = style.bgImage ? style.bgImage.replace(/^url\(['"']?/, '').replace(/['"']?\)$/, '') : '';
                    if (oldUrl && !urlMapping[oldUrl]) {
                        const blob = base64ToBlob(style.bgImageBase64);
                        const ext = blob.type.split('/')[1] || 'png';
                        const fileObj = new File([blob], `imported_${Date.now()}.${ext}`, { type: blob.type });
                        const formData = new FormData();
                        formData.append('image', fileObj);
                        uploadPromises.push(
                            fetch('/api/upload', { method: 'POST', body: formData })
                                .then(res => res.json())
                                .then(data => { if (data.url) urlMapping[oldUrl] = data.url; })
                        );
                    }
                }

                if (style.fgImageBase64) {
                    const oldUrl = style.fgImage ? style.fgImage.replace(/^url\(['"']?/, '').replace(/['"']?\)$/, '') : '';
                    if (oldUrl && !urlMapping[oldUrl]) {
                        const blob = base64ToBlob(style.fgImageBase64);
                        const ext = blob.type.split('/')[1] || 'png';
                        const fileObj = new File([blob], `imported_${Date.now()}.${ext}`, { type: blob.type });
                        const formData = new FormData();
                        formData.append('image', fileObj);
                        uploadPromises.push(
                            fetch('/api/upload', { method: 'POST', body: formData })
                                .then(res => res.json())
                                .then(data => { if (data.url) urlMapping[oldUrl] = data.url; })
                        );
                    }
                }

                if (style.customTexts) {
                    for (const txt of style.customTexts) {
                        if (txt.bgBase64) {
                            const oldUrl = txt.bg ? txt.bg.replace(/^url\(['"']?/, '').replace(/['"']?\)$/, '') : '';
                            if (oldUrl && !urlMapping[oldUrl]) {
                                const blob = base64ToBlob(txt.bgBase64);
                                const ext = blob.type.split('/')[1] || 'png';
                                const fileObj = new File([blob], `imported_${Date.now()}.${ext}`, { type: blob.type });
                                const formData = new FormData();
                                formData.append('image', fileObj);
                                uploadPromises.push(
                                    fetch('/api/upload', { method: 'POST', body: formData })
                                        .then(res => res.json())
                                        .then(data => { if (data.url) urlMapping[oldUrl] = data.url; })
                                );
                            }
                        }
                    }
                }
            }

            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises);
            }

            // ── STEP 3: Rewrite image URLs with newly uploaded versions ──
            for (const targetKey in stylesToProcess) {
                const style = stylesToProcess[targetKey];

                if (style.bgImageBase64) {
                    const oldUrl = style.bgImage ? style.bgImage.replace(/^url\(['"']?/, '').replace(/['"']?\)$/, '') : '';
                    if (urlMapping[oldUrl]) style.bgImage = `url("${urlMapping[oldUrl]}")`;
                    delete style.bgImageBase64;
                }

                if (style.fgImageBase64) {
                    const oldUrl = style.fgImage ? style.fgImage.replace(/^url\(['"']?/, '').replace(/['"']?\)$/, '') : '';
                    if (urlMapping[oldUrl]) style.fgImage = `url("${urlMapping[oldUrl]}")`;
                    delete style.fgImageBase64;
                }

                if (style.customTexts) {
                    for (const txt of style.customTexts) {
                        if (txt.bgBase64) {
                            const oldUrl = txt.bg ? txt.bg.replace(/^url\(['"']?/, '').replace(/['"']?\)$/, '') : '';
                            if (urlMapping[oldUrl]) txt.bg = `url("${urlMapping[oldUrl]}")`;
                            delete txt.bgBase64;
                        }
                    }
                }
            }

            // Log any images that couldn't be restored (stale /uploads/ URLs with no base64)
            const missingImages = [];
            for (const targetKey in stylesToProcess) {
                const style = stylesToProcess[targetKey];
                if (style.bgImage && style.bgImage.includes('/uploads/')) missingImages.push(`${targetKey}: bgImage`);
                if (style.fgImage && style.fgImage.includes('/uploads/')) missingImages.push(`${targetKey}: fgImage`);
            }
            if (missingImages.length > 0) {
                console.warn('Import: stale /uploads/ URLs (no base64 embedded, re-export needed):', missingImages);
            }

            // ── STEP 4: Apply everything ──
            // Always apply styles and mappings from the import.
            categoryStyles = JSON.parse(JSON.stringify(stylesToProcess));
            backsideMappings = importedData.mappings ? JSON.parse(JSON.stringify(importedData.mappings)) : {};

            if (shouldMergeDeck && importedData.deck) {
                // Merge: preserve preset's deck structure (duplicates, blank cards) while
                // pulling fresh text/data from the current CSV for matching titles.
                // Key = Card_Title if non-empty, else Card_ID — handles backside cards that
                // have no title but have unique IDs (BEP-001, BMP-001, etc.)
                const deckKey = row => ((row.Card_Title || '').trim() || (row.Card_ID || '').trim());
                const freshCsvDict = {};
                if (parsedCsvData) parsedCsvData.forEach(row => { freshCsvDict[deckKey(row)] = row; });

                const mergedDeck = [];
                const mergedKeys = new Set();
                importedData.deck.forEach(oldRow => {
                    const key = deckKey(oldRow);
                    mergedKeys.add(key);
                    const freshData = freshCsvDict[key];
                    // Blank cards and cards not in current CSV fall back to the saved row as-is
                    mergedDeck.push(freshData ? { ...freshData, Qty: oldRow.Qty } : oldRow);
                });

                // Append brand-new CSV cards not present in the saved deck
                if (parsedCsvData) {
                    parsedCsvData.filter(row => !mergedKeys.has(deckKey(row))).forEach(row => mergedDeck.push(row));
                }

                parsedCsvData = mergedDeck;
            } else if (shouldOverwriteDeck && importedData.deck) {
                // No current CSV — restore the preset's deck exactly as saved
                // (includes duplicates and blank cards)
                parsedCsvData = JSON.parse(JSON.stringify(importedData.deck));
            }
            // If neither (user cancelled) — parsedCsvData is unchanged; only styles were applied.

            if (parsedCsvData && parsedCsvData.length > 0) {
                generateCards();
                document.getElementById('generateBtn').disabled = false;
                printBtn.disabled = false;
            }

            // ── STEP 5: Save to local presets if user chose to ──
            if (saveToLocal && localPresetName) {
                const presets = getLocalPresets();
                presets[localPresetName.trim()] = {
                    styles: JSON.parse(JSON.stringify(stylesToProcess)),
                    mappings: importedData.mappings ? JSON.parse(JSON.stringify(importedData.mappings)) : {},
                    deck: importedData.deck ? JSON.parse(JSON.stringify(importedData.deck)) : (parsedCsvData ? JSON.parse(JSON.stringify(parsedCsvData)) : [])
                };
                saveLocalPresets(presets);
                populatePresetDropdown();
                presetSelect.value = localPresetName.trim();
                deletePresetBtn.disabled = false;
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

// --- Auto-Restore Check on Boot ---
document.addEventListener('DOMContentLoaded', () => {
    populatePresetDropdown();

    const savedState = localStorage.getItem(AUTOSAVE_KEY);
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            if (parsed.deck && parsed.deck.length > 0) {
                // Restore previous working session
                parsedCsvData = parsed.deck;
                categoryStyles = parsed.styles || categoryStyles;
                backsideMappings = parsed.mappings || backsideMappings;

                // Sync UI
                document.getElementById('fileStatus').textContent = "Restored previous working session.";
                document.getElementById('generateBtn').disabled = false;

                generateCards(); // Boot the board
            }
        } catch (e) {
            console.error("Failed to restore autosave:", e);
        }
    }
});
