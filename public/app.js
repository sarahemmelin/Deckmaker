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
// Styling Listeners
targetCategory.addEventListener('change', () => {
    updateControlsToMatchCategory();
    if (targetCategory.value === 'all') {
        backToAllBtn.style.display = 'none';
    } else {
        backToAllBtn.style.display = 'flex';
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

// Attach sync logic to the 4 color inputs
syncColorInput(bgColorPicker, bgColorText, 'bg');
syncColorInput(overlayColorPicker, overlayColorText, 'overlayColor');
syncColorInput(textColorPicker, textColorText, 'text');
syncColorInput(accentColorPicker, accentColorText, 'accent');

bgImageUpload.addEventListener('change', handleBgImageUpload);
removeBgImageBtn.addEventListener('click', () => {
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

fontFamilySelect.addEventListener('change', () => applyStyle('font', fontFamilySelect.value));
fontSizeSlider.addEventListener('input', () => applyStyle('size', fontSizeSlider.value));
wordBreakToggle.addEventListener('change', () => applyStyle('wordBreak', wordBreakToggle.checked));
showBuoyancyToggle.addEventListener('change', () => applyStyle('showBuoy', showBuoyancyToggle.checked));
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

    parsedCsvData.forEach(rowData => {
        // Track unique Card_Types for the Styling dropdown
        const type = rowData.Card_Type ? rowData.Card_Type.trim() : 'Uncategorized';
        // Fallback to Card_ID if Card_Title is empty, else Untitled
        const fallback = rowData.Card_ID ? rowData.Card_ID.trim() : 'Untitled';
        const title = rowData.Card_Title ? rowData.Card_Title.trim() : fallback;
        if (type) cardCategories.add(type);
        cardTitles.add(title);

        // Handle Quantity. Default is 1 if not specified or invalid.
        let qty = parseInt(rowData.Qty, 10);
        if (isNaN(qty) || qty < 1) qty = 1;

        for (let q = 0; q < qty; q++) {
            const cardEl = document.createElement('div');
            cardEl.className = 'game-card';
            if (type.startsWith('Back_')) {
                cardEl.classList.add('is-backside');
            }
            cardEl.dataset.category = type; // Critical for targeted styling
            cardEl.dataset.title = title;

            // Build Top Badges
            let badgesHTML = '';
            // We consistently inject the badge html if there's data, and let 'display: flex|none' 
            // from the CSS toggle it dynamically from the Styling Panel so sizing doesn't break.
            if (rowData.Buoy_Mod) badgesHTML += `<span class="stat-badge buoy-badge">Buoyancy: ${escapeHTML(rowData.Buoy_Mod)}</span>`;

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
                isImgDragging = true;
                hasDragged = false;
                startX = e.clientX;
                startY = e.clientY;

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
                    else if (tCategory.startsWith('card_') && cardEl.dataset.title === tCategory.substring(5)) shouldSave = true;

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
            imgPlaceholder.addEventListener('wheel', (e) => {
                if (!imgPlaceholder.classList.contains('has-image')) return;
                e.preventDefault();

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
                else if (tCategory.startsWith('card_') && cardEl.dataset.title === tCategory.substring(5)) shouldSave = true;

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
            applyStoredStyles(cardEl, type, title);

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

                wrapper.appendChild(label);
                wrapper.appendChild(cardEl);
                cardGrid.appendChild(wrapper);
            } else {
                cardGrid.appendChild(cardEl);
            }

            // Click-to-Select Card logic
            cardEl.addEventListener('click', (e) => {
                // Ignore clicks on images or custom texts so we don't interrupt uploads/drags
                if (e.target.closest('.card-image-placeholder') || e.target.closest('.custom-text-element')) return;

                // Select this exact card in the dropdown
                const exactCardOpt = Array.from(targetCategory.options).find(opt => opt.value === `card_${title}`);
                if (exactCardOpt) {
                    targetCategory.value = exactCardOpt.value;
                    // Procces the change to update UI sliders
                    targetCategory.dispatchEvent(new Event('change'));

                    // Scroll sidebar to top so user sees the newly expanded controls
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) sidebar.scrollTo({ top: 0, behavior: 'smooth' });
                }
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
                const targetTitle = cardEl.dataset.title;
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
function updateCategoryDropdown() {
    targetCategory.innerHTML = '<option value="all">All Cards</option>';

    // Group 1: Categories
    const catGroup = document.createElement('optgroup');
    catGroup.label = "By Category";
    cardCategories.forEach(cat => {
        if (!categoryStyles["cat_" + cat]) categoryStyles["cat_" + cat] = JSON.parse(JSON.stringify(categoryStyles["all"]));
        const opt = document.createElement('option');
        opt.value = "cat_" + cat;
        opt.textContent = `Category: ${cat}`;
        catGroup.appendChild(opt);
    });
    targetCategory.appendChild(catGroup);

    // Group 2: Single Cards
    const cardGroup = document.createElement('optgroup');
    cardGroup.label = "Single Individual Cards";
    cardTitles.forEach(title => {
        if (!categoryStyles["card_" + title]) categoryStyles["card_" + title] = JSON.parse(JSON.stringify(categoryStyles["all"]));
        const opt = document.createElement('option');
        opt.value = "card_" + title;
        opt.textContent = `Card: ${title}`;
        cardGroup.appendChild(opt);
    });
    targetCategory.appendChild(cardGroup);
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
        } else if (target.startsWith('card_') && card.dataset.title === target.substring(5)) {
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
        } else if (target.startsWith('card_') && card.dataset.title === target.substring(5)) {
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
                const cardKey = "card_" + card.dataset.title;
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
        const styles = categoryStyles["card_" + cardDiv.dataset.title] || categoryStyles["cat_" + cardDiv.dataset.category] || categoryStyles["all"];
        const hex = propName === 'overlayColor' ? value : (styles.overlayColor !== undefined ? styles.overlayColor : "#ffffff");
        const opacity = propName === 'overlayOpacity' ? value : (styles.overlayOpacity !== undefined ? styles.overlayOpacity : "0");
        const rgba = hexToRgba(hex, opacity);
        cardDiv.style.setProperty('--dynamic-card-overlay', rgba);
    }

    if (propName === 'text') cardDiv.style.setProperty('--dynamic-card-text', value);
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
    // Single Card settings take precedence, then Category, then globally 'all'
    let styles = categoryStyles["card_" + title] || categoryStyles["cat_" + category] || categoryStyles["all"];

    updateCSSCustomProperty(cardDiv, 'bg', styles.bg);
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
    updateCSSCustomProperty(cardDiv, 'text', styles.text);
    updateCSSCustomProperty(cardDiv, 'accent', styles.accent);
    updateCSSCustomProperty(cardDiv, 'font', styles.font);
    updateCSSCustomProperty(cardDiv, 'size', styles.size);
    updateCSSCustomProperty(cardDiv, 'wordBreak', styles.wordBreak);
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

        const contentSpan = document.createElement('span');
        contentSpan.className = 'custom-text-content';
        contentSpan.innerText = txt.text;

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
                const cardKey = "card_" + card.dataset.title;
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
        applyStoredStyles(card, card.dataset.category, card.dataset.title);
    });
}

function attachCustomTextEvents(wrapper, cardDiv, txtId, contentSpan, deleteBtn) {
    let isDragging = false;

    wrapper.addEventListener('mousedown', (e) => {
        if (wrapper.classList.contains('is-editing')) return;
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
        e.stopPropagation();
    });

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCustomText(txtId);
    });

    contentSpan.addEventListener('blur', () => {
        // slight timeout in case they clicked the delete button
        setTimeout(() => {
            if (!document.body.contains(wrapper)) return; // Already deleted

            contentSpan.contentEditable = false;
            wrapper.classList.remove('is-editing');
            const newText = contentSpan.textContent.trim();

            if (newText === '') {
                removeCustomText(txtId);
            } else {
                syncCustomTextContentUI(txtId, newText);
                updateCustomTextDataStore(txtId, { text: newText });
            }
        }, 100);
    });

    contentSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            contentSpan.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            contentSpan.blur();
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
                applyMerge(categoryStyles["card_" + card.dataset.title]);
            }
        });
    }
}

function removeCustomText(id) {
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
                const cardKey = "card_" + card.dataset.title;
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
        applyStoredStyles(card, card.dataset.category, card.dataset.title);
    });
}

function syncCustomTextPosUI(id, newX, newY) {
    const target = targetCategory.value;
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        let shouldSync = false;
        if (target === 'all') shouldSync = true;
        else if (target.startsWith('cat_') && card.dataset.category === target.substring(4)) shouldSync = true;
        else if (target.startsWith('card_') && card.dataset.title === target.substring(5)) shouldSync = true;

        if (shouldSync) {
            const el = card.querySelector(`.custom-text-element[data-id="${id}"]`);
            if (el) {
                el.style.left = newX + '%';
                el.style.top = newY + '%';
            }
        }
    });
}

function syncCustomTextContentUI(id, newText) {
    const target = targetCategory.value;
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        let shouldSync = false;
        if (target === 'all') shouldSync = true;
        else if (target.startsWith('cat_') && card.dataset.category === target.substring(4)) shouldSync = true;
        else if (target.startsWith('card_') && card.dataset.title === target.substring(5)) shouldSync = true;

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
    presets[name.trim()] = JSON.parse(JSON.stringify(categoryStyles));
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
    presets[selected] = JSON.parse(JSON.stringify(categoryStyles));
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
    categoryStyles = JSON.parse(JSON.stringify(data));

    // Re-apply all styles
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        applyStoredStyles(card, card.dataset.category, card.dataset.title);
    });

    // Sync UI with 'all' settings by default or current targeted item
    updateControlsToMatchCategory();
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
        const exportData = JSON.parse(JSON.stringify(categoryStyles));

        // Find all bgImage and fgImage values and convert to base64 if they are local uploads
        for (const targetKey in exportData) {
            const style = exportData[targetKey];
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

            for (const targetKey in importedData) {
                const style = importedData[targetKey];

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
            for (const targetKey in importedData) {
                const style = importedData[targetKey];

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
                    presets[name.trim()] = JSON.parse(JSON.stringify(importedData));
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
    const allTitles = new Set();

    parsedCsvData.forEach(row => {
        const fallback = row.Card_ID ? row.Card_ID.trim() : 'Untitled';
        const title = row.Card_Title ? row.Card_Title.trim() : fallback;
        allTitles.add(title);
    });

    if (frontCategories.length === 0 || allTitles.size === 0) {
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
    allTitles.forEach(title => {
        const opt = document.createElement('option');
        opt.value = "card_" + title;
        opt.textContent = `Card: ${title}`;
        cardGroup.appendChild(opt);
    });
    mappingTargetSelect.appendChild(cardGroup);

    // Populate Backsides
    allTitles.forEach(bt => {
        const opt = document.createElement('option');
        opt.value = bt;
        opt.textContent = bt;
        mappingBacksideSelect.appendChild(opt);
    });
}

function generatePrintLayout() {
    const layout = document.getElementById('printLayout');
    layout.innerHTML = '';

    // 1. Gather all currently visible front cards from the grid in order
    const visibleCards = Array.from(document.querySelectorAll('#cardGrid .game-card')).filter(c => {
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
                const title = frontCard.dataset.title;
                const mappedBackTitle = backsideMappings["card_" + title] || backsideMappings["cat_" + cat];

                let backNodeToUse = null;
                if (mappedBackTitle) {
                    const existingBackCard = document.querySelector(`.game-card[data-title="${CSS.escape(mappedBackTitle)}"]`);
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

