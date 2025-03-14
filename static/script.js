// Cuisine data organized by regions
const cuisinesByRegion = {
    asian: [
        'Japanese', 'Korean', 'Chinese', 'Thai', 'Vietnamese', 
        'Indian', 'Malaysian', 'Indonesian', 'Filipino'
    ],
    european: [
        'Italian', 'French', 'Spanish', 'Greek', 'German',
        'Portuguese', 'Swedish', 'Hungarian', 'Polish'
    ],
    american: [
        'Mexican', 'Brazilian', 'Peruvian', 'Argentine',
        'Caribbean', 'Creole', 'Canadian', 'American'
    ],
    african: [
        'Ethiopian', 'Moroccan', 'Nigerian', 'Egyptian',
        'South African', 'Ghanaian', 'Senegalese'
    ],
    middleeastern: [
        'Lebanese', 'Turkish', 'Persian', 'Israeli',
        'Arabian', 'Armenian', 'Georgian'
    ],
    oceanic: [
        'Australian', 'Hawaiian', 'Polynesian',
        'New Zealand', 'Fijian', 'Samoan'
    ]
};
// Mapping cuisines to country flag URLs (ISO country codes)
const cuisineFlags = {
    'Japanese': 'https://flagcdn.com/w40/jp.png',
    'Korean': 'https://flagcdn.com/w40/kr.png',
    'Chinese': 'https://flagcdn.com/w40/cn.png',
    'Thai': 'https://flagcdn.com/w40/th.png',
    'Vietnamese': 'https://flagcdn.com/w40/vn.png',
    'Indian': 'https://flagcdn.com/w40/in.png',
    'Malaysian': 'https://flagcdn.com/w40/my.png',
    'Indonesian': 'https://flagcdn.com/w40/id.png',
    'Filipino': 'https://flagcdn.com/w40/ph.png',
    'Italian': 'https://flagcdn.com/w40/it.png',
    'French': 'https://flagcdn.com/w40/fr.png',
    'Spanish': 'https://flagcdn.com/w40/es.png',
    'Greek': 'https://flagcdn.com/w40/gr.png',
    'German': 'https://flagcdn.com/w40/de.png',
    'Portuguese': 'https://flagcdn.com/w40/pt.png',
    'Swedish': 'https://flagcdn.com/w40/se.png',
    'Hungarian': 'https://flagcdn.com/w40/hu.png',
    'Polish': 'https://flagcdn.com/w40/pl.png',
    'Mexican': 'https://flagcdn.com/w40/mx.png',
    'Brazilian': 'https://flagcdn.com/w40/br.png',
    'Peruvian': 'https://flagcdn.com/w40/pe.png',
    'Argentine': 'https://flagcdn.com/w40/ar.png',
    'Caribbean': 'https://flagcdn.com/w40/ht.png',  // Generic Caribbean flag (Haiti)
    'Creole': 'https://flagcdn.com/w40/gp.png',  // Guadeloupe as example
    'Canadian': 'https://flagcdn.com/w40/ca.png',
    'American': 'https://flagcdn.com/w40/us.png',
    'Ethiopian': 'https://flagcdn.com/w40/et.png',
    'Moroccan': 'https://flagcdn.com/w40/ma.png',
    'Nigerian': 'https://flagcdn.com/w40/ng.png',
    'Egyptian': 'https://flagcdn.com/w40/eg.png',
    'South African': 'https://flagcdn.com/w40/za.png',
    'Ghanaian': 'https://flagcdn.com/w40/gh.png',
    'Senegalese': 'https://flagcdn.com/w40/sn.png',
    'Lebanese': 'https://flagcdn.com/w40/lb.png',
    'Turkish': 'https://flagcdn.com/w40/tr.png',
    'Persian': 'https://flagcdn.com/w40/ir.png',
    'Israeli': 'https://flagcdn.com/w40/il.png',
    'Arabian': 'https://flagcdn.com/w40/sa.png',
    'Armenian': 'https://flagcdn.com/w40/am.png',
    'Georgian': 'https://flagcdn.com/w40/ge.png',
    'Australian': 'https://flagcdn.com/w40/au.png',
    'Hawaiian': 'https://flagcdn.com/w40/us-hi.png', // US Hawaii state flag
    'Polynesian': 'https://flagcdn.com/w40/pf.png',  // French Polynesia
    'New Zealand': 'https://flagcdn.com/w40/nz.png',
    'Fijian': 'https://flagcdn.com/w40/fj.png',
    'Samoan': 'https://flagcdn.com/w40/ws.png'
};

// State
let currentSelection = null;
let selectedCuisines = {
    cuisine1: '',
    cuisine2: ''
};
let preferences = {
    servings: 1,
    dietary: [],
    ingredients: []
};

// DOM Elements
const mainView = document.getElementById('main-view');
const selectionView = document.getElementById('selection-view');
const preferencesModal = document.getElementById('preferences-modal');
const createButton = document.getElementById('create-button');
const cuisine1Preview = document.getElementById('cuisine1-preview');
const cuisine2Preview = document.getElementById('cuisine2-preview');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeRegions();
    setupEventListeners();
});

function initializeRegions() {
    Object.entries(cuisinesByRegion).forEach(([region, cuisines]) => {
        const regionElement = document.querySelector(`[data-region="${region}"] .region-cuisines`);
        cuisines.forEach(cuisine => {
            const button = document.createElement('button');
            button.className = 'cuisine-option';

            // Create an image element for the flag
            const flagImg = document.createElement('img');
            flagImg.src = cuisineFlags[cuisine] || 'https://flagcdn.com/w40/un.png'; // Default flag if not found
            flagImg.alt = `${cuisine} Flag`;
            flagImg.className = 'cuisine-flag';

            // Create a span for the text
            const textSpan = document.createElement('span');
            textSpan.textContent = cuisine;

            // Append flag and text inside button
            button.appendChild(flagImg);
            button.appendChild(textSpan);

            // Add click event
            button.onclick = () => selectCuisine(cuisine);

            regionElement.appendChild(button);
        });
    });
}
function setupEventListeners() {
    // Cuisine preview clicks
    cuisine1Preview.addEventListener('click', () => startSelection(1));
    cuisine2Preview.addEventListener('click', () => startSelection(2));

    // Ingredient input handling
    const ingredientInput = document.getElementById('ingredient-input');
    ingredientInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addIngredient(e.target.value.trim());
            e.target.value = '';
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!selectionView.classList.contains('hidden')) {
                closeSelection();
            } else if (preferencesModal.classList.contains('visible')) {
                closePreferences();
            }
        }
    });
}

// Cuisine Selection Functions
function startSelection(number) {
    currentSelection = number;
    selectionView.classList.remove('hidden');
    mainView.style.opacity = '0';
    
    requestAnimationFrame(() => {
        selectionView.classList.add('visible');
        mainView.classList.add('hidden');
    });
}

function closeSelection() {
    selectionView.classList.remove('visible');
    mainView.classList.remove('hidden');
    
    setTimeout(() => {
        selectionView.classList.add('hidden');
        mainView.style.opacity = '1';
    }, 300);
}

function selectCuisine(cuisine) {
    const previewElement = currentSelection === 1 ? cuisine1Preview : cuisine2Preview;
    selectedCuisines[`cuisine${currentSelection}`] = cuisine;
    
    // Update preview
    previewElement.innerHTML = `<span class="selected-cuisine">${cuisine}</span>`;
    
    // Check if both cuisines are selected
    if (selectedCuisines.cuisine1 && selectedCuisines.cuisine2) {
        createButton.classList.remove('hidden');
        setTimeout(() => createButton.classList.add('visible'), 50);
    }
    
    closeSelection();
}

// Preferences Modal Functions
function showPreferences() {
    preferencesModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        preferencesModal.classList.add('visible');
    });
}

function closePreferences() {
    preferencesModal.classList.remove('visible');
    setTimeout(() => {
        preferencesModal.classList.add('hidden');
    }, 300);
}

function adjustServings(change) {
    preferences.servings = Math.max(1, Math.min(12, preferences.servings + change));
    document.getElementById('servings-display').textContent = preferences.servings;
}

function addIngredient(ingredient) {
    if (!ingredient || preferences.ingredients.includes(ingredient)) return;
    
    preferences.ingredients.push(ingredient);
    renderIngredientTags();
}

function removeIngredient(ingredient) {
    preferences.ingredients = preferences.ingredients.filter(i => i !== ingredient);
    renderIngredientTags();
}

function renderIngredientTags() {
    const container = document.getElementById('ingredients-tags');
    container.innerHTML = '';
    
    preferences.ingredients.forEach(ingredient => {
        const tag = document.createElement('div');
        tag.className = 'ingredient-tag';
        tag.innerHTML = `
            ${ingredient}
            <button class="remove-tag" onclick="removeIngredient('${ingredient}')">×</button>
        `;
        container.appendChild(tag);
    });
}



async function generateRecipe() {
    // Show loading state
    const generateButton = document.querySelector('.modal-footer .create-btn');
    const originalButtonText = generateButton.innerHTML;
    generateButton.innerHTML = `<span class="btn-text">GENERATING...</span><span class="btn-icon">⏳</span>`;
    generateButton.disabled = true;

    // Show the skeleton loader immediately
    const temp_modal = showRecipeModal_temp({ title: '', description: '', info: '', ingredients: [], instructions: [] }, null);
    
    try {
        // Get dietary restrictions
        const dietaryInputs = document.querySelectorAll('input[name="dietary"]:checked');
        preferences.dietary = Array.from(dietaryInputs).map(input => input.value);
        
        // Prepare recipe request data
        const requestData = {
            cuisine1: selectedCuisines.cuisine1,
            cuisine2: selectedCuisines.cuisine2,
            servings: preferences.servings,
            dietary: preferences.dietary,
            ingredients: preferences.ingredients
        };

        // Make API request
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Close preferences modal
        closePreferences();
        
        //document.body.appendChild(modal);
        //console.log(document.children);
        closeRecipeModal(temp_modal);
        //modal.remove();
        // Replace skeleton with actual data
        showRecipeModal(data.recipe, data.image);
        

    } catch (error) {
        console.error('Error generating recipe:', error);
        alert('Failed to generate recipe. Please try again.');
    } finally {
        // Restore button state
        generateButton.innerHTML = originalButtonText;
        generateButton.disabled = false;
    }
}

function showRecipeModal(recipeHtml, imageData) {
    // Parse recipe sections
    const sections = parseRecipeSections(recipeHtml);
    
    // Create recipe modal
    const modal = document.createElement('div');
    modal.className = 'modal visible recipe-modal';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeRecipeModal(this.parentElement)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="recipe-title">${sections.title}</h2>
                <button class="close-btn" onclick="closeRecipeModal(this.closest('.modal'))">×</button>
            </div>
            
            ${imageData ? `
                <div class="recipe-image-container">
                    <img src="${imageData}" alt="${sections.title}" class="recipe-image">
                </div>
            ` : ''}
            
            <div class="modal-body">
                <div class="recipe-description">
                    ${sections.description}
                </div>
                
                <div class="recipe-info">
                    ${sections.info}
                </div>
                
                <div class="recipe-ingredients">
                    <h3 class="recipe-section-title">Ingredients</h3>
                    <ul class="ingredients-list">
                        ${sections.ingredients.map(ingredient => 
                            `<li>${ingredient}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="recipe-instructions">
                    <h3 class="recipe-section-title">Instructions</h3>
                    <ol class="instructions-list">
                        ${sections.instructions.map(instruction => 
                            `<li>${instruction}</li>`
                        ).join('')}
                    </ol>
                </div>
                
                ${sections.notes ? `
                    <div class="recipe-notes">
                        <h3 class="recipe-section-title">Notes</h3>
                        <div class="recipe-description">${sections.notes}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function showRecipeModal_temp(recipeHtml, imageData) {
    // Create recipe modal
    const modal = document.createElement('div');
    modal.className = 'modal visible recipe-modal';

    // Initial skeleton loading effect
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeRecipeModal(this.parentElement)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <button class="close-btn" onclick="closeRecipeModal(this.closest('.modal'))">×</button>
            </div>
            <div class="modal-body">
                <div class="skeleton-box skeleton-image"></div>
            </div>

            <div class="modal-body">
                <div class="recipe-description skeleton-box skeleton-text"></div>

                <div class="recipe-info skeleton-box skeleton-text"></div>

                <div class="recipe-ingredients">
                    <h3 class="skeleton-box skeleton-text"></h3>
                    <div class="skeleton-box skeleton-image-list"></div>
                </div>

                <div class="recipe-instructions">
                    <h3 class="skeleton-box skeleton-text"></h3>
                    <div class="skeleton-box skeleton-image-list"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    //console.log(document.children);
    // After a short delay, replace skeletons with actual data
    // setTimeout(() => {
    //     modal.querySelector('.recipe-title').innerHTML = recipeHtml.title;
    //     modal.querySelector('.recipe-description').innerHTML = recipeHtml.description;
    //     modal.querySelector('.recipe-info').innerHTML = recipeHtml.info;
        
    //     if (imageData) {
    //         const imageContainer = modal.querySelector('.recipe-image-container');
    //         imageContainer.innerHTML = `<img src="${imageData}" alt="${recipeHtml.title}" class="recipe-image">`;
    //     }

    //     // Replace ingredients
    //     const ingredientsList = modal.querySelector('.ingredients-list');
    //     ingredientsList.innerHTML = recipeHtml.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');

    //     // Replace instructions
    //     const instructionsList = modal.querySelector('.instructions-list');
    //     instructionsList.innerHTML = recipeHtml.instructions.map(instruction => `<li>${instruction}</li>`).join('');

    //     // Remove skeleton classes
    //     modal.querySelectorAll('.skeleton-box').forEach(el => el.classList.remove('skeleton-box', 'skeleton-text', 'skeleton-image'));

    // }, 15000); // Simulated delay to make the loading effect noticeable

    return modal;
}


function parseRecipeSections(recipeText) {
    function extractSection(text, section) {
        const regex = new RegExp(`\\[${section}\\](.*?)(?=\\[|$)`, 's'); // 's' allows multi-line matching
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    }
    // Extract each section
    // const sections = {
    //     title: extractSection(recipeText, 'RECIPE_TITLE'),
    //     description: extractSection(recipeText, 'RECIPE_DESCRIPTION'),
    //     info: extractSection(recipeText, 'RECIPE_INFO'),
    //     ingredients: extractSection(recipeText, 'INGREDIENTS')
    //         .split('\n')
    //         .filter(line => line.trim())
    //         .map(line => line.replace(/^-\s*/, '')),
    //     instructions: extractSection(recipeText, 'INSTRUCTIONS')
    //         .split('\n')
    //         .filter(line => line.trim())
    //         .map(line => line.replace(/^\d+\.\s*/, '')),
    //     notes: extractSection(recipeText, 'NOTES')
    // };
    function cleanText(text) {
        if (!text || typeof text !== 'string') return null;
        const cleaned = text.replace(/<[^>]*>/g, '').trim(); // Removes all HTML tags
        return cleaned.length > 0 ? cleaned : null;
    }
    
    // Function to clean an array: Removes empty lines and trims content
    function cleanArray(arr) {
        return arr
            .map(line => line.replace(/<[^>]*>/g, '').trim()) // Remove HTML tags
            .filter(line => line.length > 0); // Remove empty lines
    }
    
    const sections = {
        title: cleanText(extractSection(recipeText, 'RECIPE_TITLE')),
        description: cleanText(extractSection(recipeText, 'RECIPE_DESCRIPTION')),
        info: cleanText(extractSection(recipeText, 'RECIPE_INFO')),
        ingredients: cleanArray(extractSection(recipeText, 'INGREDIENTS')
            .split('\n')
            .map(line => line.replace(/^-\s*/, '').trim())),  // Remove leading dashes and trim spaces
        instructions: cleanArray(extractSection(recipeText, 'INSTRUCTIONS')
            .split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').trim())), // Remove numbered prefixes and trim
        notes: cleanText(extractSection(recipeText, 'NOTES'))
    };
    

    /**
     * Function to clean empty or invalid text values.
     * Returns null if the text is empty or just whitespace.
     */
    


    return sections;
}

function closeRecipeModal(modal) {
    modal.classList.remove('visible');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// Animation helper function
function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.classList.remove('hidden');
    
    requestAnimationFrame(() => {
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = 1;
    });
}

function fadeOut(element, duration = 300) {
    element.style.opacity = 0;
    
    setTimeout(() => {
        element.classList.add('hidden');
    }, duration);
}