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

// State
let currentSelection = null;
let selectedCuisines = {
    cuisine1: '',
    cuisine2: ''
};
let preferences = {
    servings: 4,
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
            button.textContent = cuisine;
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

        // Create and show recipe modal
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
                        <p>${sections.notes}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function parseRecipeSections(recipeText) {
    // Helper function to extract content between section markers
    const extractSection = (text, sectionName) => {
        const regex = new RegExp(`\\[${sectionName}\\]([\\s\\S]*?)(?=\\[|$)`);
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    };

    // Extract each section
    const sections = {
        title: extractSection(recipeText, 'RECIPE_TITLE'),
        description: extractSection(recipeText, 'RECIPE_DESCRIPTION'),
        info: extractSection(recipeText, 'RECIPE_INFO'),
        ingredients: extractSection(recipeText, 'INGREDIENTS')
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^-\s*/, '')),
        instructions: extractSection(recipeText, 'INSTRUCTIONS')
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '')),
        notes: extractSection(recipeText, 'NOTES')
    };

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