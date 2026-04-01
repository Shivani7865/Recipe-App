// ===== DOM ELEMENTS =====
const searchBox = document.querySelector('.searchBox');
const searchForm = document.getElementById('searchForm');
const recipeContainer = document.querySelector('.recipe-container');
const recipeDetailsContent = document.querySelector('.recipe-details-content');
const recipeCloseBtn = document.getElementById('recipeCloseBtn');
const recipeOverlay = document.getElementById('recipeOverlay');
const navLinks = document.querySelectorAll('.nav-link');
const navLinksContainer = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const modalClose = document.getElementById('modalClose');
const loginFormEl = document.getElementById('loginForm');
const signupFormEl = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const loginSubmit = document.getElementById('loginSubmit');
const signupSubmit = document.getElementById('signupSubmit');
const userGreeting = document.getElementById('userGreeting');
const greetingText = document.getElementById('greetingText');
const toastEl = document.getElementById('toast');

// ===== TOAST =====
function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(function() { toastEl.classList.remove('show'); }, 3000);
}

// ===== AUTH (localStorage) =====
function getUsers() {
    try { return JSON.parse(localStorage.getItem('recipeAppUsers') || '[]'); }
    catch(e) { return []; }
}

function saveUsers(users) {
    localStorage.setItem('recipeAppUsers', JSON.stringify(users));
}

function getCurrentUser() {
    try {
        var data = localStorage.getItem('recipeAppCurrentUser');
        return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
}

function setCurrentUser(user) {
    localStorage.setItem('recipeAppCurrentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('recipeAppCurrentUser');
}

function updateAuthUI() {
    var user = getCurrentUser();
    if (user) {
        loginBtn.style.display = 'none';
        userGreeting.style.display = 'flex';
        greetingText.textContent = 'Hi, ' + user.name + '!';
    } else {
        loginBtn.style.display = '';
        userGreeting.style.display = 'none';
        greetingText.textContent = '';
    }
}

// Login handler
loginSubmit.addEventListener('click', function() {
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    if (!email || !password) { showToast('Please fill in all fields'); return; }
    var users = getUsers();
    var user = users.find(function(u) { return u.email === email && u.password === password; });
    if (!user) { showToast('Invalid email or password'); return; }
    setCurrentUser(user);
    updateAuthUI();
    closeAuthModal();
    showToast('Welcome back, ' + user.name + '!');
    renderFavourites();
});

// Signup handler
signupSubmit.addEventListener('click', function() {
    var name = document.getElementById('signupName').value.trim();
    var email = document.getElementById('signupEmail').value.trim();
    var password = document.getElementById('signupPassword').value;
    if (!name || !email || !password) { showToast('Please fill in all fields'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters'); return; }
    var users = getUsers();
    if (users.some(function(u) { return u.email === email; })) {
        showToast('Email already registered'); return;
    }
    var newUser = { name: name, email: email, password: password, favourites: [] };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    updateAuthUI();
    closeAuthModal();
    showToast('Account created! Welcome, ' + name + '!');
});

// Logout handler
logoutBtn.addEventListener('click', function() {
    clearCurrentUser();
    updateAuthUI();
    showToast('Logged out successfully');
    renderFavourites();
});

// Modal controls
function openAuthModal() {
    authModal.classList.add('show');
    loginFormEl.style.display = '';
    signupFormEl.style.display = 'none';
}

function closeAuthModal() {
    authModal.classList.remove('show');
    var inputs = document.querySelectorAll('.auth-form input');
    for (var i = 0; i < inputs.length; i++) { inputs[i].value = ''; }
}

loginBtn.addEventListener('click', openAuthModal);
modalClose.addEventListener('click', closeAuthModal);
authModal.addEventListener('click', function(e) {
    if (e.target === authModal) closeAuthModal();
});
showSignup.addEventListener('click', function(e) {
    e.preventDefault();
    loginFormEl.style.display = 'none';
    signupFormEl.style.display = '';
});
showLogin.addEventListener('click', function(e) {
    e.preventDefault();
    signupFormEl.style.display = 'none';
    loginFormEl.style.display = '';
});

// ===== NAVIGATION =====
hamburger.addEventListener('click', function() {
    navLinksContainer.classList.toggle('open');
});

navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        var section = link.dataset.section;
        navLinks.forEach(function(l) { l.classList.remove('active'); });
        link.classList.add('active');
        navLinksContainer.classList.remove('open');

        var heroEl = document.getElementById('home');
        var recipesEl = document.getElementById('recipes');
        var favouritesEl = document.getElementById('favourites');
        var historyEl = document.getElementById('history');

        if (section === 'home') {
            heroEl.style.display = '';
            recipesEl.style.display = '';
            favouritesEl.style.display = 'none';
            historyEl.style.display = 'none';
            heroEl.scrollIntoView({ behavior: 'smooth' });
        } else if (section === 'recipes') {
            heroEl.style.display = 'none';
            recipesEl.style.display = '';
            favouritesEl.style.display = 'none';
            historyEl.style.display = 'none';
            recipesEl.scrollIntoView({ behavior: 'smooth' });
        } else if (section === 'favourites') {
            heroEl.style.display = 'none';
            recipesEl.style.display = 'none';
            favouritesEl.style.display = '';
            historyEl.style.display = 'none';
            renderFavourites();
            favouritesEl.scrollIntoView({ behavior: 'smooth' });
        } else if (section === 'history') {
            heroEl.style.display = 'none';
            recipesEl.style.display = 'none';
            favouritesEl.style.display = 'none';
            historyEl.style.display = '';
            renderHistory();
            historyEl.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== FAVOURITES =====
function getFavourites() {
    var user = getCurrentUser();
    if (!user) {
        try { return JSON.parse(localStorage.getItem('guestFavourites') || '[]'); }
        catch(e) { return []; }
    }
    var users = getUsers();
    var found = users.find(function(u) { return u.email === user.email; });
    return found ? (found.favourites || []) : [];
}

function saveFavourite(meal) {
    var user = getCurrentUser();
    var mealData = {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strArea: meal.strArea,
        strCategory: meal.strCategory
    };

    if (!user) {
        var favs = [];
        try { favs = JSON.parse(localStorage.getItem('guestFavourites') || '[]'); } catch(e) {}
        if (favs.some(function(f) { return f.idMeal === meal.idMeal; })) {
            favs = favs.filter(function(f) { return f.idMeal !== meal.idMeal; });
            localStorage.setItem('guestFavourites', JSON.stringify(favs));
            showToast('Removed from favourites');
        } else {
            favs.push(mealData);
            localStorage.setItem('guestFavourites', JSON.stringify(favs));
            showToast('Added to favourites!');
        }
    } else {
        var users = getUsers();
        var found = users.find(function(u) { return u.email === user.email; });
        if (!found.favourites) found.favourites = [];
        if (found.favourites.some(function(f) { return f.idMeal === meal.idMeal; })) {
            found.favourites = found.favourites.filter(function(f) { return f.idMeal !== meal.idMeal; });
            showToast('Removed from favourites');
        } else {
            found.favourites.push(mealData);
            showToast('Added to favourites!');
        }
        saveUsers(users);
        setCurrentUser(found);
    }
}

function isFavourite(mealId) {
    return getFavourites().some(function(f) { return f.idMeal === mealId; });
}

function renderFavourites() {
    var container = document.querySelector('.favourites-container');
    if (!container) return;
    var favs = getFavourites();
    if (favs.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-regular fa-heart empty-icon"></i><h2>No favourites yet</h2><p>Click the heart icon on any recipe to save it here.</p></div>';
        return;
    }
    container.innerHTML = '';
    favs.forEach(function(meal) {
        container.appendChild(createRecipeCard(meal, true));
    });
}

// ===== RECIPE CARDS =====
function createRecipeCard(meal, isFavCard) {
    var recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe');

    var favActive = isFavourite(meal.idMeal) ? 'active' : '';
    var favIcon = isFavourite(meal.idMeal) ? 'fa-solid' : 'fa-regular';

    recipeDiv.innerHTML =
        '<div class="recipe-img-wrapper">' +
            '<img src="' + meal.strMealThumb + '" alt="' + (meal.strMeal || '') + '">' +
            '<button class="fav-btn ' + favActive + '" data-id="' + meal.idMeal + '">' +
                '<i class="' + favIcon + ' fa-heart"></i>' +
            '</button>' +
            '<button class="share-card-btn" title="Share">' +
                '<i class="fa-solid fa-share-nodes"></i>' +
            '</button>' +
        '</div>' +
        '<div class="share-dropdown" style="display:none;">' +
            '<a class="share-option share-whatsapp" data-platform="whatsapp"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>' +
            '<a class="share-option share-twitter" data-platform="twitter"><i class="fa-brands fa-x-twitter"></i> X / Twitter</a>' +
            '<a class="share-option share-facebook" data-platform="facebook"><i class="fa-brands fa-facebook-f"></i> Facebook</a>' +
            '<a class="share-option share-telegram" data-platform="telegram"><i class="fa-brands fa-telegram"></i> Telegram</a>' +
            '<a class="share-option share-instagram" data-platform="instagram"><i class="fa-brands fa-instagram"></i> Instagram</a>' +
            '<a class="share-option share-copy" data-platform="copy"><i class="fa-solid fa-copy"></i> Copy Link</a>' +
        '</div>' +
        '<div class="recipe-info">' +
            '<h3>' + meal.strMeal + '</h3>' +
            '<div class="recipe-tags">' +
                (meal.strArea ? '<span class="tag tag-area"><i class="fa-solid fa-earth-americas"></i> ' + meal.strArea + '</span>' : '') +
                (meal.strCategory ? '<span class="tag tag-category"><i class="fa-solid fa-tag"></i> ' + meal.strCategory + '</span>' : '') +
            '</div>' +
            '<div class="recipe-actions">' +
                '<button class="view-recipe-btn"><i class="fa-solid fa-book-open"></i> View Recipe <i class="fa-solid fa-arrow-right"></i></button>' +
            '</div>' +
        '</div>';

    var favBtn = recipeDiv.querySelector('.fav-btn');
    favBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        saveFavourite(meal);
        favBtn.classList.toggle('active');
        var icon = favBtn.querySelector('i');
        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');
        if (isFavCard) renderFavourites();
    });

    var viewBtn = recipeDiv.querySelector('.view-recipe-btn');
    viewBtn.addEventListener('click', function() {
        if (meal.strInstructions) {
            openRecipePopup(meal);
        } else {
            fetchAndShowMeal(meal.idMeal);
        }
    });

    // Share dropdown toggle
    var shareCardBtn = recipeDiv.querySelector('.share-card-btn');
    var shareDropdown = recipeDiv.querySelector('.share-dropdown');
    shareCardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Close all other open dropdowns
        document.querySelectorAll('.share-dropdown').forEach(function(d) {
            if (d !== shareDropdown) d.style.display = 'none';
        });
        shareDropdown.style.display = shareDropdown.style.display === 'none' ? 'flex' : 'none';
    });

    // Share option clicks
    shareDropdown.querySelectorAll('.share-option').forEach(function(opt) {
        opt.addEventListener('click', function(e) {
            e.stopPropagation();
            shareMeal(meal, opt.dataset.platform);
            shareDropdown.style.display = 'none';
        });
    });

    return recipeDiv;
}

function fetchAndShowMeal(id) {
    // Check if it's a local fallback recipe
    if (typeof id === 'string' && id.indexOf('local_') === 0) {
        var localMeal = localIndianRecipes.find(function(r) { return r.idMeal === id; });
        if (localMeal) {
            openRecipePopup(localMeal);
            return;
        }
    }
    // Check if it's a DummyJSON recipe
    if (typeof id === 'string' && id.indexOf('dj_') === 0) {
        var djId = id.replace('dj_', '');
        fetch('https://dummyjson.com/recipes/' + djId)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data && data.id) {
                    openRecipePopup(normalizeDummyJsonRecipe(data));
                }
            })
            .catch(function() {
                showToast('Failed to load recipe details');
            });
        return;
    }
    // TheMealDB lookup
    fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.meals && data.meals.length > 0) {
                openRecipePopup(data.meals[0]);
            }
        })
        .catch(function() {
            showToast('Failed to load recipe details');
        });
}

function fetchRecipes(query) {
    recipeContainer.innerHTML =
        '<div class="loading-state">' +
            '<div class="loading-spinner"></div>' +
            '<p>Searching for "' + query + '"...</p>' +
        '</div>';

    // Get local fallback matches
    var localMatches = searchLocalRecipes(query);
    // Get expanded search terms for better API coverage
    var searchTerms = getExpandedSearchTerms(query);
    // Detect if query matches a cuisine keyword
    var cuisineMatch = detectCuisine(query);

    // Build API fetch promises
    var apiPromises = [];

    // 1. TheMealDB primary search
    apiPromises.push(
        fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(query))
            .then(function(res) { return res.json(); })
            .then(function(data) { return (data.meals || []).map(function(m) { m._source = 'mealdb'; return m; }); })
            .catch(function() { return []; })
    );

    // 2. DummyJSON search (searches name, tags, ingredients)
    apiPromises.push(searchDummyJson(query));

    // 3. If cuisine detected, fetch by area from TheMealDB
    if (cuisineMatch) {
        apiPromises.push(
            fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=' + encodeURIComponent(cuisineMatch))
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    return (data.meals || []).map(function(m) {
                        m.strArea = cuisineMatch;
                        m._isBasic = true;
                        m._source = 'mealdb';
                        return m;
                    });
                })
                .catch(function() { return []; })
        );
    }

    // 4. Search expanded terms on TheMealDB (for aliases like "dal" -> "dal fry")
    searchTerms.forEach(function(term) {
        if (term !== query.toLowerCase().trim()) {
            apiPromises.push(
                fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(term))
                    .then(function(res) { return res.json(); })
                    .then(function(data) { return (data.meals || []).map(function(m) { m._source = 'mealdb'; return m; }); })
                    .catch(function() { return []; })
            );
        }
    });

    // 5. Also search DummyJSON Indian tag if cuisine is Indian
    if (cuisineMatch === 'Indian') {
        apiPromises.push(
            fetchAndCacheIndianRecipes().then(function() {
                return indianRecipeCache.dummyjson.concat(indianRecipeCache.mealdb);
            })
        );
    }

    Promise.all(apiPromises).then(function(resultArrays) {
        var seen = {};
        var merged = [];

        // Helper to add unique meals
        function addUnique(meals) {
            meals.forEach(function(m) {
                if (!seen[m.idMeal]) {
                    seen[m.idMeal] = true;
                    merged.push(m);
                }
            });
        }

        // Priority: API results first (they have images), then local fallback
        resultArrays.forEach(function(meals) { addUnique(meals); });
        addUnique(localMatches);

        displaySearchResults(query, merged, cuisineMatch);
    }).catch(function(error) {
        // If all APIs fail, still show local results
        if (localMatches.length > 0) {
            displaySearchResults(query, localMatches, cuisineMatch);
        } else {
            recipeContainer.innerHTML =
                '<div class="empty-state">' +
                    '<i class="fa-solid fa-triangle-exclamation empty-icon"></i>' +
                    '<h2>Failed to fetch recipes</h2>' +
                    '<p>Please check your internet connection and try again.</p>' +
                '</div>';
        }
        console.error('Error:', error);
    });
}

// ===== MULTI-API RECIPE ENGINE =====
// APIs used:
// 1. TheMealDB (primary) - www.themealdb.com/api/json/v1/1/
// 2. DummyJSON (secondary) - dummyjson.com/recipes/
// 3. Local fallback (only for dishes missing from both APIs)

// --- Cache for API-fetched Indian recipes ---
var indianRecipeCache = { mealdb: [], dummyjson: [], loaded: false };

function fetchAndCacheIndianRecipes() {
    if (indianRecipeCache.loaded) return Promise.resolve();
    return Promise.all([
        fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                indianRecipeCache.mealdb = (data.meals || []).map(function(m) {
                    m.strArea = 'Indian';
                    m._isBasic = true;
                    m._source = 'mealdb';
                    return m;
                });
            })
            .catch(function() { indianRecipeCache.mealdb = []; }),
        fetch('https://dummyjson.com/recipes/tag/Indian')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                indianRecipeCache.dummyjson = (data.recipes || []).map(normalizeDummyJsonRecipe);
            })
            .catch(function() { indianRecipeCache.dummyjson = []; })
    ]).then(function() { indianRecipeCache.loaded = true; });
}

// Convert DummyJSON recipe format to TheMealDB-compatible format
function normalizeDummyJsonRecipe(r) {
    var meal = {
        idMeal: 'dj_' + r.id,
        strMeal: r.name,
        strMealThumb: r.image,
        strArea: r.cuisine || 'Indian',
        strCategory: (r.tags && r.tags[0]) || 'Main course',
        strInstructions: (r.instructions || []).join('\n\n'),
        strYoutube: '',
        _source: 'dummyjson',
        _djRating: r.rating,
        _djPrepTime: r.prepTimeMinutes,
        _djCookTime: r.cookTimeMinutes,
        _djServings: r.servings,
        _djDifficulty: r.difficulty,
        _djCalories: r.caloriesPerServing
    };
    // Map ingredients
    if (r.ingredients) {
        for (var i = 0; i < r.ingredients.length && i < 20; i++) {
            meal['strIngredient' + (i + 1)] = r.ingredients[i];
            meal['strMeasure' + (i + 1)] = '';
        }
    }
    return meal;
}

// Search DummyJSON API
function searchDummyJson(query) {
    return fetch('https://dummyjson.com/recipes/search?q=' + encodeURIComponent(query) + '&limit=20')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            return (data.recipes || []).map(normalizeDummyJsonRecipe);
        })
        .catch(function() { return []; });
}

// Search TheMealDB by ingredient (finds recipes containing that ingredient)
function searchMealDbByIngredient(ingredient) {
    return fetch('https://www.themealdb.com/api/json/v1/1/filter.php?i=' + encodeURIComponent(ingredient))
        .then(function(res) { return res.json(); })
        .then(function(data) {
            return (data.meals || []).map(function(m) {
                m._isBasic = true;
                m._source = 'mealdb';
                return m;
            });
        })
        .catch(function() { return []; });
}

// --- Local fallback placeholder image ---
function getLocalRecipeImage(name) {
    var colors = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#e91e63','#ff5722','#795548'];
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    var color = colors[Math.abs(hash) % colors.length];
    var initials = name.split(' ').map(function(w){return w[0]}).join('').substring(0,2).toUpperCase();
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='" + encodeURIComponent(color) + "'/%3E%3Ctext x='200' y='130' font-family='Arial,sans-serif' font-size='72' fill='white' text-anchor='middle' font-weight='bold'%3E" + encodeURIComponent(initials) + "%3C/text%3E%3Ctext x='200' y='180' font-family='Arial,sans-serif' font-size='18' fill='rgba(255,255,255,0.9)' text-anchor='middle'%3E" + encodeURIComponent(name) + "%3C/text%3E%3Ctext x='200' y='220' font-family='Arial,sans-serif' font-size='36' text-anchor='middle'%3E🍛%3C/text%3E%3C/svg%3E";
}

// --- Local fallback recipes (only for dishes not available in ANY API) ---
var localIndianRecipes = [
    {
        idMeal: 'local_idli', strMeal: 'Soft Idli', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Soft Idli'),
        strInstructions: 'Soak urad dal for 4 hours and rice for 6 hours separately. Grind urad dal to fluffy smooth batter. Grind rice to slightly coarse batter.\n\nMix both batters, add salt and let it ferment overnight in a warm place until doubled in volume.\n\nGrease idli moulds with oil. Pour batter into moulds. Steam for 10-12 minutes.\n\nServe hot with sambar and coconut chutney.',
        strIngredient1: 'Rice', strMeasure1: '4 cups', strIngredient2: 'Urad Dal', strMeasure2: '1 cup',
        strIngredient3: 'Fenugreek Seeds', strMeasure3: '1 tsp', strIngredient4: 'Salt', strMeasure4: 'To taste',
        strIngredient5: '', strMeasure5: '', strYoutube: ''
    },
    {
        idMeal: 'local_sambhar', strMeal: 'Sambhar', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Sambhar'),
        strInstructions: 'Cook toor dal with turmeric until soft. Cut vegetables (drumstick, carrot, potato, brinjal, onion). Cook vegetables with tamarind water, salt, sambhar powder until tender.\n\nAdd cooked dal to vegetables, bring to boil. For tempering: heat oil, add mustard seeds, fenugreek seeds, dried red chillies, curry leaves, asafoetida. Pour over sambhar.\n\nServe hot with idli, dosa, or rice.',
        strIngredient1: 'Toor Dal', strMeasure1: '1 cup', strIngredient2: 'Tamarind', strMeasure2: 'Lemon sized',
        strIngredient3: 'Sambhar Powder', strMeasure3: '2 tbsp', strIngredient4: 'Mixed Vegetables', strMeasure4: '2 cups',
        strIngredient5: 'Mustard Seeds', strMeasure5: '1 tsp', strIngredient6: 'Curry Leaves', strMeasure6: '10',
        strIngredient7: 'Turmeric', strMeasure7: '1/2 tsp', strIngredient8: 'Salt', strMeasure8: 'To taste',
        strIngredient9: '', strMeasure9: '', strYoutube: ''
    },
    {
        idMeal: 'local_dal_tadka', strMeal: 'Dal Tadka', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Dal Tadka'),
        strInstructions: 'Wash toor dal, pressure cook with turmeric, salt and water for 3-4 whistles. Mash well.\n\nFor tadka: Heat ghee, add cumin seeds, mustard seeds, dried red chillies, garlic, green chillies, onion. Saute until golden. Add tomatoes, red chilli powder, coriander powder.\n\nPour tadka over dal. Garnish with coriander and ghee. Serve with rice or roti.',
        strIngredient1: 'Toor Dal', strMeasure1: '1 cup', strIngredient2: 'Ghee', strMeasure2: '3 tbsp',
        strIngredient3: 'Cumin Seeds', strMeasure3: '1 tsp', strIngredient4: 'Garlic', strMeasure4: '4 cloves',
        strIngredient5: 'Onion', strMeasure5: '1', strIngredient6: 'Tomato', strMeasure6: '2',
        strIngredient7: 'Red Chilli Powder', strMeasure7: '1 tsp', strIngredient8: 'Turmeric', strMeasure8: '1/2 tsp',
        strIngredient9: 'Salt', strMeasure9: 'To taste', strIngredient10: '', strMeasure10: '', strYoutube: ''
    },
    {
        idMeal: 'local_dal_chawal', strMeal: 'Dal Chawal', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Dal Chawal'),
        strInstructions: 'Wash moong dal, pressure cook with turmeric and salt for 3 whistles. Mash well.\n\nFor tadka: Heat ghee, add cumin, garlic, green chillies, onions. Fry golden. Add tomatoes, chilli powder. Pour into dal.\n\nFor Rice: Wash basmati rice, soak 20 min. Boil with salt and whole spices. Cook until done.\n\nServe dal over rice with lemon, pickle and papad.',
        strIngredient1: 'Moong Dal', strMeasure1: '1 cup', strIngredient2: 'Basmati Rice', strMeasure2: '1.5 cups',
        strIngredient3: 'Ghee', strMeasure3: '2 tbsp', strIngredient4: 'Cumin Seeds', strMeasure4: '1 tsp',
        strIngredient5: 'Onion', strMeasure5: '1', strIngredient6: 'Tomato', strMeasure6: '1',
        strIngredient7: 'Turmeric', strMeasure7: '1/2 tsp', strIngredient8: 'Salt', strMeasure8: 'To taste',
        strIngredient9: '', strMeasure9: '', strYoutube: ''
    },
    {
        idMeal: 'local_chole_bhature', strMeal: 'Chole Bhature', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Chole Bhature'),
        strInstructions: 'Soak chickpeas overnight. Pressure cook with tea bag and salt for 5-6 whistles.\n\nHeat oil, add cumin, bay leaf, onions, ginger-garlic paste. Add tomato puree, chole masala, amchur, garam masala. Add chickpeas, simmer 20 min.\n\nFor Bhature: Mix maida, yogurt, sugar, salt, baking soda. Knead, rest 2 hours. Roll oval, deep fry till puffed.\n\nServe with onion rings and green chutney.',
        strIngredient1: 'Chickpeas', strMeasure1: '1.5 cups', strIngredient2: 'Maida', strMeasure2: '2 cups',
        strIngredient3: 'Onion', strMeasure3: '2', strIngredient4: 'Chole Masala', strMeasure4: '2 tbsp',
        strIngredient5: 'Yogurt', strMeasure5: '2 tbsp', strIngredient6: 'Garam Masala', strMeasure6: '1 tsp',
        strIngredient7: 'Oil', strMeasure7: 'For frying', strIngredient8: 'Salt', strMeasure8: 'To taste',
        strIngredient9: '', strMeasure9: '', strYoutube: ''
    },
    {
        idMeal: 'local_rajma_chawal', strMeal: 'Rajma Chawal', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Rajma Chawal'),
        strInstructions: 'Soak rajma overnight. Pressure cook for 6-7 whistles till soft.\n\nHeat oil, add cumin, onions, ginger-garlic paste. Add tomatoes, red chilli powder, coriander powder, garam masala. Add cooked rajma, simmer 20-25 min.\n\nServe over steamed basmati rice with onion salad and pickle.',
        strIngredient1: 'Rajma', strMeasure1: '1.5 cups', strIngredient2: 'Basmati Rice', strMeasure2: '2 cups',
        strIngredient3: 'Onion', strMeasure3: '2', strIngredient4: 'Tomato', strMeasure4: '3',
        strIngredient5: 'Garam Masala', strMeasure5: '1 tsp', strIngredient6: 'Cumin Seeds', strMeasure6: '1 tsp',
        strIngredient7: 'Salt', strMeasure7: 'To taste', strIngredient8: '', strMeasure8: '', strYoutube: ''
    },
    {
        idMeal: 'local_poha', strMeal: 'Poha', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Poha'),
        strInstructions: 'Wash flattened rice, drain, add salt and turmeric.\n\nHeat oil, add mustard seeds, curry leaves, green chillies, peanuts. Add onions, saute. Add poha, cook 3-4 min on low.\n\nAdd sugar, lemon juice. Garnish with coriander and sev.',
        strIngredient1: 'Flattened Rice', strMeasure1: '2 cups', strIngredient2: 'Onion', strMeasure2: '1',
        strIngredient3: 'Peanuts', strMeasure3: '2 tbsp', strIngredient4: 'Mustard Seeds', strMeasure4: '1 tsp',
        strIngredient5: 'Curry Leaves', strMeasure5: '8', strIngredient6: 'Turmeric', strMeasure6: '1/4 tsp',
        strIngredient7: 'Lemon Juice', strMeasure7: '1 tbsp', strIngredient8: 'Salt', strMeasure8: 'To taste',
        strIngredient9: '', strMeasure9: '', strYoutube: ''
    },
    {
        idMeal: 'local_upma', strMeal: 'Rava Upma', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Rava Upma'),
        strInstructions: 'Dry roast rava till golden. Heat oil, add mustard seeds, urad dal, chana dal, curry leaves, cashews, green chillies.\n\nAdd onions, saute. Add water and salt, bring to boil. Add rava slowly stirring continuously.\n\nCook 3-4 min, add lemon juice and ghee. Serve hot.',
        strIngredient1: 'Rava (Semolina)', strMeasure1: '1 cup', strIngredient2: 'Onion', strMeasure2: '1',
        strIngredient3: 'Mustard Seeds', strMeasure3: '1 tsp', strIngredient4: 'Curry Leaves', strMeasure4: '8',
        strIngredient5: 'Cashews', strMeasure5: '6', strIngredient6: 'Ghee', strMeasure6: '1 tbsp',
        strIngredient7: 'Salt', strMeasure7: 'To taste', strIngredient8: '', strMeasure8: '', strYoutube: ''
    },
    {
        idMeal: 'local_pav_bhaji', strMeal: 'Pav Bhaji', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Pav Bhaji'),
        strInstructions: 'Pressure cook potatoes, cauliflower, peas, carrots. Mash well.\n\nHeat butter, add onions, ginger-garlic paste, capsicum, tomatoes, pav bhaji masala, red chilli powder. Add mashed vegetables, simmer 10-15 min.\n\nToast pav with butter. Serve bhaji with butter, onion, coriander.',
        strIngredient1: 'Potato', strMeasure1: '4', strIngredient2: 'Cauliflower', strMeasure2: '1/2',
        strIngredient3: 'Pav Bhaji Masala', strMeasure3: '3 tbsp', strIngredient4: 'Butter', strMeasure4: '5 tbsp',
        strIngredient5: 'Pav Buns', strMeasure5: '8', strIngredient6: 'Onion', strMeasure6: '2',
        strIngredient7: 'Tomato', strMeasure7: '3', strIngredient8: 'Salt', strMeasure8: 'To taste',
        strIngredient9: '', strMeasure9: '', strYoutube: ''
    },
    {
        idMeal: 'local_vada', strMeal: 'Medu Vada', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Medu Vada'),
        strInstructions: 'Soak urad dal 4 hours. Grind to thick fluffy batter. Add salt, green chillies, curry leaves, ginger, pepper.\n\nShape into donuts. Deep fry on medium heat till golden (3-4 min). Serve with coconut chutney and sambar.',
        strIngredient1: 'Urad Dal', strMeasure1: '1 cup', strIngredient2: 'Green Chillies', strMeasure2: '2',
        strIngredient3: 'Curry Leaves', strMeasure3: '8', strIngredient4: 'Black Pepper', strMeasure4: '1/2 tsp',
        strIngredient5: 'Oil', strMeasure5: 'For frying', strIngredient6: 'Salt', strMeasure6: 'To taste',
        strIngredient7: '', strMeasure7: '', strYoutube: ''
    },
    {
        idMeal: 'local_rasam', strMeal: 'Rasam', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Rasam'),
        strInstructions: 'Cook toor dal till soft. Extract tamarind juice. Mix with dal water, tomatoes, rasam powder, turmeric, salt. Boil and simmer 10 min.\n\nTemper with mustard seeds, cumin, dried red chillies, curry leaves. Serve with rice.',
        strIngredient1: 'Toor Dal', strMeasure1: '1/4 cup', strIngredient2: 'Tamarind', strMeasure2: 'Small ball',
        strIngredient3: 'Rasam Powder', strMeasure3: '1.5 tbsp', strIngredient4: 'Tomato', strMeasure4: '2',
        strIngredient5: 'Mustard Seeds', strMeasure5: '1 tsp', strIngredient6: 'Curry Leaves', strMeasure6: '8',
        strIngredient7: 'Salt', strMeasure7: 'To taste', strIngredient8: '', strMeasure8: '', strYoutube: ''
    },
    {
        idMeal: 'local_aloo_paratha', strMeal: 'Aloo Paratha', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Aloo Paratha'),
        strInstructions: 'Knead wheat flour dough, rest 20 min. Boil-mash potatoes, mix with green chillies, coriander, cumin powder, amchur, salt.\n\nStuff dough balls with filling, roll flat. Cook on tawa with ghee/butter till golden. Serve with yogurt and pickle.',
        strIngredient1: 'Wheat Flour', strMeasure1: '2 cups', strIngredient2: 'Potato', strMeasure2: '3',
        strIngredient3: 'Green Chillies', strMeasure3: '2', strIngredient4: 'Cumin Powder', strMeasure4: '1 tsp',
        strIngredient5: 'Ghee', strMeasure5: 'For cooking', strIngredient6: 'Salt', strMeasure6: 'To taste',
        strIngredient7: '', strMeasure7: '', strYoutube: ''
    },
    {
        idMeal: 'local_uttapam', strMeal: 'Uttapam', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Uttapam'),
        strInstructions: 'Use fermented dosa batter. Pour on hot tawa, spread thick. Top with onions, tomatoes, green chillies, capsicum.\n\nDrizzle oil, cover and cook 2-3 min. Flip, cook 1-2 min. Serve with chutney and sambar.',
        strIngredient1: 'Dosa Batter', strMeasure1: '2 cups', strIngredient2: 'Onion', strMeasure2: '1',
        strIngredient3: 'Tomato', strMeasure3: '1', strIngredient4: 'Green Chillies', strMeasure4: '2',
        strIngredient5: 'Oil', strMeasure5: 'For cooking', strIngredient6: 'Salt', strMeasure6: 'To taste',
        strIngredient7: '', strMeasure7: '', strYoutube: ''
    },
    {
        idMeal: 'local_dhokla', strMeal: 'Dhokla', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Dhokla'),
        strInstructions: 'Mix besan, rava, turmeric, sugar, salt, lemon juice with water. Add eno/baking soda before steaming.\n\nSteam 15-20 min. Temper with mustard seeds, curry leaves, green chillies. Pour over dhokla. Garnish with coriander. Serve with green chutney.',
        strIngredient1: 'Besan', strMeasure1: '1 cup', strIngredient2: 'Rava', strMeasure2: '2 tbsp',
        strIngredient3: 'Eno/Baking Soda', strMeasure3: '1 tsp', strIngredient4: 'Mustard Seeds', strMeasure4: '1 tsp',
        strIngredient5: 'Curry Leaves', strMeasure5: '8', strIngredient6: 'Lemon Juice', strMeasure6: '1 tbsp',
        strIngredient7: 'Salt', strMeasure7: 'To taste', strIngredient8: '', strMeasure8: '', strYoutube: ''
    },
    {
        idMeal: 'local_kadhi', strMeal: 'Kadhi Pakora', strArea: 'Indian', strCategory: 'Vegetarian',
        strMealThumb: getLocalRecipeImage('Kadhi Pakora'),
        strInstructions: 'Mix besan + yogurt + turmeric + water (no lumps). Make small onion pakoras, deep fry.\n\nTemper with cumin, mustard seeds, red chillies, curry leaves. Add besan-yogurt mix, stir on medium heat till boils. Simmer 15-20 min. Add pakoras. Serve with rice.',
        strIngredient1: 'Besan', strMeasure1: '1/2 cup', strIngredient2: 'Yogurt', strMeasure2: '1 cup',
        strIngredient3: 'Onion', strMeasure3: '1', strIngredient4: 'Cumin Seeds', strMeasure4: '1 tsp',
        strIngredient5: 'Turmeric', strMeasure5: '1/2 tsp', strIngredient6: 'Ghee', strMeasure6: '2 tbsp',
        strIngredient7: 'Salt', strMeasure7: 'To taste', strIngredient8: '', strMeasure8: '', strYoutube: ''
    },
    {
        idMeal: 'local_mutton_curry', strMeal: 'Mutton Curry', strArea: 'Indian', strCategory: 'Lamb',
        strMealThumb: getLocalRecipeImage('Mutton Curry'),
        strInstructions: 'Marinate mutton with yogurt, turmeric, chilli powder, salt for 1 hour.\n\nHeat ghee, add whole spices. Fry onions till deep golden. Add ginger-garlic paste, tomatoes, dry spice powders. Fry mutton on high heat. Pressure cook 5-6 whistles.\n\nGarnish with coriander. Serve with naan or rice.',
        strIngredient1: 'Mutton', strMeasure1: '500g', strIngredient2: 'Onion', strMeasure2: '3',
        strIngredient3: 'Tomato', strMeasure3: '3', strIngredient4: 'Yogurt', strMeasure4: '1/2 cup',
        strIngredient5: 'Ginger Garlic Paste', strMeasure5: '2 tbsp', strIngredient6: 'Garam Masala', strMeasure6: '1.5 tsp',
        strIngredient7: 'Ghee', strMeasure7: '3 tbsp', strIngredient8: 'Salt', strMeasure8: 'To taste',
        strIngredient9: '', strMeasure9: '', strYoutube: ''
    },
    {
        idMeal: 'local_gulab_jamun', strMeal: 'Gulab Jamun', strArea: 'Indian', strCategory: 'Dessert',
        strMealThumb: getLocalRecipeImage('Gulab Jamun'),
        strInstructions: 'Make sugar syrup with cardamom, saffron, rose water. Boil to one-string consistency.\n\nMix khoya, maida, baking soda, cardamom. Knead soft dough with milk. Make smooth balls (no cracks).\n\nFry on very low heat till deep brown (6-8 min). Soak in warm syrup 2 hours. Serve warm with pistachios.',
        strIngredient1: 'Khoya', strMeasure1: '1 cup', strIngredient2: 'Maida', strMeasure2: '2 tbsp',
        strIngredient3: 'Sugar', strMeasure3: '1.5 cups', strIngredient4: 'Cardamom', strMeasure4: '1/2 tsp',
        strIngredient5: 'Rose Water', strMeasure5: '1 tsp', strIngredient6: 'Ghee', strMeasure6: 'For frying',
        strIngredient7: '', strMeasure7: '', strYoutube: ''
    },
    {
        idMeal: 'local_jalebi', strMeal: 'Jalebi', strArea: 'Indian', strCategory: 'Dessert',
        strMealThumb: getLocalRecipeImage('Jalebi'),
        strInstructions: 'Mix maida, corn flour, yogurt with water to pancake batter. Ferment 8-12 hours.\n\nMake sugar syrup with cardamom, saffron, lemon juice. Squeeze batter into hot oil in spiral shapes. Fry till golden and crispy.\n\nDip hot jalebis in warm syrup 30 seconds. Serve immediately.',
        strIngredient1: 'Maida', strMeasure1: '1 cup', strIngredient2: 'Sugar', strMeasure2: '1.5 cups',
        strIngredient3: 'Yogurt', strMeasure3: '1 tbsp', strIngredient4: 'Saffron', strMeasure4: 'Few strands',
        strIngredient5: 'Oil', strMeasure5: 'For frying', strIngredient6: '', strMeasure6: '', strYoutube: ''
    },
    {
        idMeal: 'local_halwa', strMeal: 'Gajar Ka Halwa', strArea: 'Indian', strCategory: 'Dessert',
        strMealThumb: getLocalRecipeImage('Gajar Ka Halwa'),
        strInstructions: 'Grate carrots. Cook in ghee 5 min. Add milk, cook on medium heat till absorbed (25-30 min).\n\nAdd sugar, cook till moisture evaporates. Add cardamom, almonds, cashews, raisins. Serve warm garnished with pistachios.',
        strIngredient1: 'Carrots', strMeasure1: '500g', strIngredient2: 'Milk', strMeasure2: '500ml',
        strIngredient3: 'Sugar', strMeasure3: '3/4 cup', strIngredient4: 'Ghee', strMeasure4: '4 tbsp',
        strIngredient5: 'Cardamom', strMeasure5: '1/2 tsp', strIngredient6: 'Dry Fruits', strMeasure6: 'For garnish',
        strIngredient7: '', strMeasure7: '', strYoutube: ''
    }
];

// Search alias map for local + API keyword expansion
var searchAliasMap = {
    'dosa': ['dosa', 'masala dosa'], 'masala dosa': ['dosa'],
    'idli': ['idli', 'idly'], 'idly': ['idli'],
    'sambhar': ['sambhar', 'sambar'], 'sambar': ['sambhar', 'sambar'],
    'dal': ['dal', 'daal', 'dal fry', 'dal tadka', 'dal makhani', 'dal chawal', 'kidney bean'],
    'daal': ['dal', 'daal', 'dal fry'], 'dal tadka': ['dal tadka', 'dal fry'],
    'dal makhani': ['dal makhani'], 'chawal': ['chawal', 'rice', 'biryani', 'pulao'],
    'paneer': ['paneer', 'matar paneer', 'palak paneer', 'cottage cheese'],
    'palak': ['palak', 'spinach', 'saag'], 'saag': ['saag', 'spinach', 'palak'],
    'chicken': ['chicken', 'murgh', 'poultry'], 'murgh': ['chicken', 'butter chicken', 'murgh'],
    'butter chicken': ['butter chicken', 'murgh makhani'],
    'biryani': ['biryani', 'lamb biryani'], 'mutton': ['mutton', 'lamb', 'gosht'],
    'gosht': ['mutton', 'lamb', 'gosht'], 'lamb': ['lamb', 'mutton', 'gosht'],
    'chole': ['chole', 'chana', 'chickpea'], 'chana': ['chana', 'chole', 'chickpea'],
    'rajma': ['rajma', 'kidney bean'], 'aloo': ['aloo', 'potato'],
    'gobi': ['gobi', 'cauliflower'], 'paratha': ['paratha', 'aloo paratha'],
    'samosa': ['samosa'], 'pakora': ['pakora', 'bhajiya'],
    'poha': ['poha'], 'upma': ['upma', 'rava upma'],
    'pav bhaji': ['pav bhaji'], 'vada': ['vada', 'medu vada'],
    'rasam': ['rasam'], 'uttapam': ['uttapam'], 'dhokla': ['dhokla'],
    'kadhi': ['kadhi', 'kadi'], 'tandoori': ['tandoori'],
    'tikka': ['tikka'], 'kebab': ['kebab', 'chapli kebab'],
    'korma': ['korma'], 'vindaloo': ['vindaloo'],
    'rogan josh': ['rogan josh', 'lamb rogan'],
    'gulab jamun': ['gulab jamun'], 'kheer': ['kheer'],
    'jalebi': ['jalebi'], 'halwa': ['halwa', 'gajar'],
    'keema': ['keema', 'aloo keema'], 'karahi': ['karahi', 'chicken karahi'],
    'lassi': ['lassi', 'mango lassi'], 'naan': ['naan'], 'roti': ['roti'],
    'egg curry': ['egg'], 'anda': ['egg'], 'fish curry': ['fish', 'recheado'],
    'machhi': ['fish'], 'pulao': ['pulao', 'pulav'],
    'bhature': ['bhature', 'chole bhature']
};

// Search local fallback recipes by query
function searchLocalRecipes(query) {
    var q = query.toLowerCase().trim();
    var results = [];

    localIndianRecipes.forEach(function(recipe) {
        var name = recipe.strMeal.toLowerCase();
        var qWords = q.split(/\s+/);
        var matched = qWords.some(function(w) {
            return w.length >= 2 && name.indexOf(w) !== -1;
        });
        if (matched || name.indexOf(q) !== -1 || q.indexOf(name) !== -1) {
            results.push(recipe);
        }
    });

    return results;
}

// Get expanded search terms from alias map
function getExpandedSearchTerms(query) {
    var q = query.toLowerCase().trim();
    var terms = [q];
    var keys = Object.keys(searchAliasMap);
    for (var i = 0; i < keys.length; i++) {
        if (q.indexOf(keys[i]) !== -1 || keys[i].indexOf(q) !== -1) {
            var aliases = searchAliasMap[keys[i]];
            for (var j = 0; j < aliases.length; j++) {
                if (terms.indexOf(aliases[j]) === -1) terms.push(aliases[j]);
            }
        }
    }
    return terms;
}

// Cuisine keyword detection
var cuisineKeywords = {
    'indian': 'Indian', 'north indian': 'Indian', 'south indian': 'Indian',
    'hindi': 'Indian', 'desi': 'Indian', 'punjabi': 'Indian', 'mughlai': 'Indian',
    'tandoori': 'Indian', 'masala': 'Indian', 'curry': 'Indian',
    'biryani': 'Indian', 'paneer': 'Indian', 'dal': 'Indian', 'daal': 'Indian',
    'naan': 'Indian', 'roti': 'Indian', 'chapati': 'Indian', 'paratha': 'Indian',
    'dosa': 'Indian', 'idli': 'Indian', 'samosa': 'Indian', 'pakora': 'Indian',
    'tikka': 'Indian', 'kebab': 'Indian', 'korma': 'Indian', 'vindaloo': 'Indian',
    'rogan josh': 'Indian', 'butter chicken': 'Indian', 'chicken tikka': 'Indian',
    'palak': 'Indian', 'saag': 'Indian', 'chole': 'Indian', 'rajma': 'Indian',
    'rasam': 'Indian', 'sambhar': 'Indian', 'uttapam': 'Indian', 'vada': 'Indian',
    'dhokla': 'Indian', 'puri': 'Indian', 'kulcha': 'Indian', 'bhaji': 'Indian',
    'chutney': 'Indian', 'raita': 'Indian', 'gulab jamun': 'Indian', 'kheer': 'Indian',
    'ladoo': 'Indian', 'jalebi': 'Indian', 'halwa': 'Indian', 'pulao': 'Indian',
    'upma': 'Indian', 'poha': 'Indian', 'pav bhaji': 'Indian', 'bhatura': 'Indian',
    'chawal': 'Indian', 'rice': 'Indian', 'mutton': 'Indian', 'gosht': 'Indian',
    'chicken curry': 'Indian', 'aloo': 'Indian', 'gobi': 'Indian', 'kadhi': 'Indian',
    'anda': 'Indian', 'machhi': 'Indian', 'machli': 'Indian', 'fish curry': 'Indian',
    'egg curry': 'Indian', 'idly': 'Indian', 'sambar': 'Indian', 'dal tadka': 'Indian',
    'daal tadka': 'Indian', 'dal makhani': 'Indian', 'chana': 'Indian',
    'rajma chawal': 'Indian', 'dal chawal': 'Indian', 'bhature': 'Indian',
    'pulav': 'Indian', 'rogan': 'Indian', 'murgh': 'Indian', 'bhajiya': 'Indian',
    'shahi': 'Indian', 'malai': 'Indian', 'kofta': 'Indian', 'seekh': 'Indian',
    'nihari': 'Indian', 'nawabi': 'Indian', 'dum': 'Indian', 'handi': 'Indian',
    'tawa': 'Indian', 'karahi': 'Indian', 'bhuna': 'Indian', 'keema': 'Indian',
    'italian': 'Italian', 'italia': 'Italian',
    'pasta': 'Italian', 'pizza': 'Italian', 'lasagna': 'Italian', 'risotto': 'Italian',
    'ravioli': 'Italian', 'gnocchi': 'Italian', 'bruschetta': 'Italian', 'tiramisu': 'Italian',
    'chinese': 'Chinese', 'china': 'Chinese',
    'noodles': 'Chinese', 'dim sum': 'Chinese', 'wonton': 'Chinese', 'fried rice': 'Chinese',
    'manchurian': 'Chinese', 'chow mein': 'Chinese', 'spring roll': 'Chinese',
    'mexican': 'Mexican', 'mexico': 'Mexican',
    'japanese': 'Japanese', 'japan': 'Japanese',
    'thai': 'Thai', 'thailand': 'Thai',
    'french': 'French', 'france': 'French',
    'american': 'American', 'usa': 'American',
    'british': 'British', 'english': 'British',
    'greek': 'Greek', 'greece': 'Greek',
    'spanish': 'Spanish', 'spain': 'Spanish',
    'turkish': 'Turkish', 'turkey food': 'Turkish',
    'moroccan': 'Moroccan', 'morocco': 'Moroccan',
    'malaysian': 'Malaysian', 'malaysia': 'Malaysian',
    'vietnamese': 'Vietnamese', 'vietnam': 'Vietnamese',
    'filipino': 'Filipino', 'philippines': 'Filipino',
    'korean': 'Korean', 'korea': 'Korean',
    'egyptian': 'Egyptian', 'egypt': 'Egyptian',
    'canadian': 'Canadian', 'canada': 'Canadian',
    'jamaican': 'Jamaican', 'jamaica': 'Jamaican',
    'russian': 'Russian', 'russia': 'Russian',
    'polish': 'Polish', 'poland': 'Polish',
    'dutch': 'Dutch', 'netherlands': 'Dutch',
    'irish': 'Irish', 'ireland': 'Irish',
    'tunisian': 'Tunisian', 'tunisia': 'Tunisian',
    'croatian': 'Croatian', 'croatia': 'Croatian',
    'portuguese': 'Portuguese', 'portugal': 'Portuguese'
};

function detectCuisine(query) {
    var q = query.toLowerCase().trim();
    // Check exact match first, then partial
    if (cuisineKeywords[q]) return cuisineKeywords[q];
    // Check if query contains a cuisine keyword
    var keys = Object.keys(cuisineKeywords);
    for (var i = 0; i < keys.length; i++) {
        if (q.indexOf(keys[i]) !== -1) return cuisineKeywords[keys[i]];
    }
    return null;
}

function displaySearchResults(query, meals, cuisineLabel) {
    recipeContainer.innerHTML = '';

    // Remove old results header if any
    var oldHeader = document.querySelector('.results-header');
    if (oldHeader) oldHeader.remove();
    var oldInlineSearch = document.querySelector('.inline-search');
    if (oldInlineSearch) oldInlineSearch.remove();

    if (!meals || meals.length === 0) {
        recipeContainer.innerHTML =
            '<div class="empty-state">' +
                '<i class="fa-solid fa-face-sad-tear empty-icon"></i>' +
                '<h2>No recipes found for "' + query + '"</h2>' +
                '<p>Try searching for something else like "biryani", "paneer", "pasta", or "chicken".</p>' +
            '</div>';
        allFetchedMeals = [];
        filterBar.style.display = 'none';
        return;
    }

    // Add inline search bar
    var inlineSearch = document.createElement('div');
    inlineSearch.className = 'inline-search';
    inlineSearch.innerHTML =
        '<form class="search-wrapper" id="inlineSearchForm">' +
            '<i class="fa-solid fa-magnifying-glass search-icon"></i>' +
            '<input type="text" placeholder="Search again..." class="searchBox" id="inlineSearchBox" value="' + query + '">' +
            '<button type="submit" class="searchBtn"><i class="fa-solid fa-arrow-right"></i></button>' +
        '</form>';
    recipeContainer.parentElement.insertBefore(inlineSearch, recipeContainer);

    // Inline search handler
    var inlineForm = document.getElementById('inlineSearchForm');
    inlineForm.addEventListener('submit', function(ev) {
        ev.preventDefault();
        var q = document.getElementById('inlineSearchBox').value.trim();
        if (q) { searchBox.value = q; fetchRecipes(q); }
    });

    // Add results header
    var headerText = cuisineLabel
        ? cuisineLabel + ' Cuisine <span>(' + meals.length + ' recipe' + (meals.length > 1 ? 's' : '') + ')</span>'
        : 'Results for <span>"' + query + '"</span>';
    var header = document.createElement('div');
    header.className = 'results-header';
    header.innerHTML =
        '<h2>' + headerText + '</h2>' +
        '<span class="results-count"><i class="fa-solid fa-bowl-food"></i> ' + meals.length + ' recipe' + (meals.length > 1 ? 's' : '') + ' found</span>';
    recipeContainer.parentElement.insertBefore(header, recipeContainer);

    meals.forEach(function(meal) {
        recipeContainer.appendChild(createRecipeCard(meal, false));
    });

    // Store meals and show filter bar
    allFetchedMeals = meals;
    populateFilters(meals);
    filterBar.style.display = 'flex';

    document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
}

// Fetch all recipes from a specific cuisine area
function fetchRecipesByArea(area) {
    searchBox.value = area;
    document.getElementById('home').style.display = 'none';
    document.getElementById('recipes').style.display = '';
    document.getElementById('favourites').style.display = 'none';
    document.getElementById('history').style.display = 'none';
    navLinks.forEach(function(l) { l.classList.remove('active'); });
    document.querySelector('[data-section="recipes"]').classList.add('active');

    recipeContainer.innerHTML =
        '<div class="loading-state">' +
            '<div class="loading-spinner"></div>' +
            '<p>Loading ' + area + ' recipes...</p>' +
        '</div>';

    fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=' + encodeURIComponent(area))
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var meals = data.meals || [];
            meals.forEach(function(m) {
                m.strArea = area;
                m._isBasic = true;
            });
            displaySearchResults(area, meals, area);
        })
        .catch(function(error) {
            recipeContainer.innerHTML =
                '<div class="empty-state">' +
                    '<i class="fa-solid fa-triangle-exclamation empty-icon"></i>' +
                    '<h2>Failed to fetch ' + area + ' recipes</h2>' +
                    '<p>Please check your internet connection and try again.</p>' +
                '</div>';
            console.error('Error:', error);
        });
}

// Cuisine chip click handlers
document.querySelectorAll('.cuisine-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
        fetchRecipesByArea(chip.dataset.area);
    });
});

// ===== INGREDIENTS =====
function fetchIngredients(meal) {
    var html = '';
    for (var i = 1; i <= 20; i++) {
        var ingredient = meal['strIngredient' + i];
        var measure = meal['strMeasure' + i];
        if (ingredient && ingredient.trim() !== '') {
            html += '<li>' + (measure ? measure.trim() + ' ' : '') + ingredient.trim() + '</li>';
        }
    }
    return html;
}

// ===== SHARE =====
function getShareUrl(meal) {
    return 'https://www.themealdb.com/meal/' + meal.idMeal;
}

function shareMeal(meal, platform) {
    var url = getShareUrl(meal);
    var text = 'Check out this recipe: ' + meal.strMeal + ' 🍽️';
    var encodedText = encodeURIComponent(text);
    var encodedUrl = encodeURIComponent(url);

    switch (platform) {
        case 'whatsapp':
            window.open('https://wa.me/?text=' + encodedText + '%20' + encodedUrl, '_blank');
            break;
        case 'twitter':
            window.open('https://twitter.com/intent/tweet?text=' + encodedText + '&url=' + encodedUrl, '_blank');
            break;
        case 'facebook':
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl, '_blank');
            break;
        case 'telegram':
            window.open('https://t.me/share/url?url=' + encodedUrl + '&text=' + encodedText, '_blank');
            break;
        case 'instagram':
            // Instagram doesn't have a direct share URL, copy text instead
            navigator.clipboard.writeText(text + ' ' + url).then(function() {
                showToast('Link copied! Paste it in your Instagram story or DM');
            });
            return;
        case 'copy':
            navigator.clipboard.writeText(text + ' ' + url).then(function() {
                showToast('Link copied to clipboard!');
            });
            return;
    }
    showToast('Opening ' + platform + '...');
}

// Close share dropdowns when clicking outside
document.addEventListener('click', function() {
    document.querySelectorAll('.share-dropdown').forEach(function(d) {
        d.style.display = 'none';
    });
});

// ===== RECIPE POPUP =====
function addToHistory(meal) {
    var historyKey = 'recipeAppHistory';
    var history = [];
    try { history = JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch(e) {}
    // Remove if already exists (to move it to top)
    history = history.filter(function(h) { return h.idMeal !== meal.idMeal; });
    var mealData = {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strArea: meal.strArea,
        strCategory: meal.strCategory,
        viewedAt: new Date().toISOString()
    };
    history.unshift(mealData);
    // Keep max 30 items
    if (history.length > 30) history = history.slice(0, 30);
    localStorage.setItem(historyKey, JSON.stringify(history));
}

function getHistory() {
    try { return JSON.parse(localStorage.getItem('recipeAppHistory') || '[]'); }
    catch(e) { return []; }
}

function clearHistory() {
    localStorage.removeItem('recipeAppHistory');
    renderHistory();
    showToast('History cleared');
}

function renderHistory() {
    var container = document.querySelector('.history-container');
    if (!container) return;
    var history = getHistory();
    if (history.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-clock-rotate-left empty-icon"></i><h2>No history yet</h2><p>Recipes you view will appear here.</p></div>';
        return;
    }
    container.innerHTML = '';
    history.forEach(function(meal) {
        var card = createRecipeCard(meal, false);
        var timeAgo = getTimeAgo(meal.viewedAt);
        var badge = document.createElement('div');
        badge.className = 'history-badge';
        badge.innerHTML = '<i class="fa-regular fa-clock"></i> ' + timeAgo;
        card.querySelector('.recipe-info').insertBefore(badge, card.querySelector('.recipe-info').firstChild);
        container.appendChild(card);
    });
}

function getTimeAgo(dateStr) {
    var now = new Date();
    var then = new Date(dateStr);
    var diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return then.toLocaleDateString();
}

// Clear history button
var clearHistoryBtn = document.getElementById('clearHistoryBtn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearHistory);
}

function openRecipePopup(meal) {
    var content =
        '<h2 class="recipeName">' + meal.strMeal + '</h2>';

    // Show extra metadata from DummyJSON if available
    if (meal._djRating || meal._djPrepTime || meal._djCalories) {
        content += '<div class="recipe-meta-bar">';
        if (meal._djRating) content += '<span class="meta-chip"><i class="fa-solid fa-star" style="color:#f1c40f"></i> ' + meal._djRating + '</span>';
        if (meal._djDifficulty) content += '<span class="meta-chip"><i class="fa-solid fa-gauge"></i> ' + meal._djDifficulty + '</span>';
        if (meal._djPrepTime) content += '<span class="meta-chip"><i class="fa-regular fa-clock"></i> Prep: ' + meal._djPrepTime + 'min</span>';
        if (meal._djCookTime) content += '<span class="meta-chip"><i class="fa-solid fa-fire-burner"></i> Cook: ' + meal._djCookTime + 'min</span>';
        if (meal._djServings) content += '<span class="meta-chip"><i class="fa-solid fa-bowl-food"></i> Serves: ' + meal._djServings + '</span>';
        if (meal._djCalories) content += '<span class="meta-chip"><i class="fa-solid fa-bolt"></i> ' + meal._djCalories + ' cal</span>';
        content += '</div>';
    }

    content +=
        '<h3><i class="fa-solid fa-basket-shopping"></i> Ingredients</h3>' +
        '<ul class="ingredientList">' + fetchIngredients(meal) + '</ul>' +
        '<h3><i class="fa-solid fa-list-check"></i> Instructions</h3>' +
        '<p class="recipeInstructions">' + meal.strInstructions + '</p>';

    if (meal.strYoutube) {
        content += '<a href="' + meal.strYoutube + '" target="_blank" rel="noopener noreferrer" class="recipe-video-link">' +
            '<i class="fa-brands fa-youtube"></i> Watch Video Tutorial</a>';
    }

    content += '<div class="share-section">' +
        '<h3><i class="fa-solid fa-share-nodes"></i> Share this Recipe</h3>' +
        '<div class="share-bar">' +
            '<button class="share-btn share-whatsapp" data-platform="whatsapp"><i class="fa-brands fa-whatsapp"></i></button>' +
            '<button class="share-btn share-twitter" data-platform="twitter"><i class="fa-brands fa-x-twitter"></i></button>' +
            '<button class="share-btn share-facebook" data-platform="facebook"><i class="fa-brands fa-facebook-f"></i></button>' +
            '<button class="share-btn share-telegram" data-platform="telegram"><i class="fa-brands fa-telegram"></i></button>' +
            '<button class="share-btn share-instagram" data-platform="instagram"><i class="fa-brands fa-instagram"></i></button>' +
            '<button class="share-btn share-copy" data-platform="copy"><i class="fa-solid fa-link"></i></button>' +
        '</div>' +
    '</div>';

    // Add Best Restaurants Near You
    content += getRestaurantsHTML(meal.strArea || '');

    recipeDetailsContent.innerHTML = content;

    // Attach share button listeners in popup
    recipeDetailsContent.querySelectorAll('.share-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            shareMeal(meal, btn.dataset.platform);
        });
    });
    recipeOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    addToHistory(meal);
}

function closeRecipePopup() {
    recipeOverlay.classList.remove('show');
    document.body.style.overflow = '';
}

recipeCloseBtn.addEventListener('click', closeRecipePopup);
recipeOverlay.addEventListener('click', function(e) {
    if (e.target === recipeOverlay) closeRecipePopup();
});

// Escape key closes popups
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeRecipePopup();
        closeAuthModal();
    }
});

// ===== SEARCH =====
var autocompleteEl = document.getElementById('searchAutocomplete');
var autocompleteTimer = null;
var activeAutoIndex = -1;

function showAutocomplete(meals) {
    if (!meals || meals.length === 0) {
        autocompleteEl.style.display = 'none';
        return;
    }
    var items = meals.slice(0, 6);
    autocompleteEl.innerHTML = '';
    items.forEach(function(meal, idx) {
        var div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.dataset.index = idx;
        div.innerHTML =
            '<img src="' + meal.strMealThumb + '/preview" alt="">' +
            '<div class="autocomplete-item-info">' +
                '<span>' + meal.strMeal + '</span>' +
                '<small>' + (meal.strArea || '') + (meal.strArea && meal.strCategory ? ' · ' : '') + (meal.strCategory || '') + '</small>' +
            '</div>' +
            '<i class="fa-solid fa-arrow-right" style="color:#555;font-size:0.8rem;"></i>';
        div.addEventListener('click', function() {
            searchBox.value = meal.strMeal;
            autocompleteEl.style.display = 'none';
            activeAutoIndex = -1;
            searchForm.dispatchEvent(new Event('submit'));
        });
        autocompleteEl.appendChild(div);
    });
    var hintDiv = document.createElement('div');
    hintDiv.className = 'autocomplete-hint';
    hintDiv.textContent = 'Press Enter to search or click a suggestion';
    autocompleteEl.appendChild(hintDiv);
    autocompleteEl.style.display = 'block';
    activeAutoIndex = -1;
}

function highlightAutoItem(index) {
    var items = autocompleteEl.querySelectorAll('.autocomplete-item');
    items.forEach(function(item) { item.classList.remove('active'); });
    if (index >= 0 && index < items.length) {
        items[index].classList.add('active');
    }
}

searchBox.addEventListener('input', function() {
    var query = searchBox.value.trim();
    if (query.length < 2) {
        autocompleteEl.style.display = 'none';
        return;
    }
    clearTimeout(autocompleteTimer);
    autocompleteTimer = setTimeout(function() {
        // Search local recipes for instant suggestions
        var localResults = searchLocalRecipes(query);

        // Fetch from both TheMealDB and DummyJSON for autocomplete
        Promise.all([
            fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(query))
                .then(function(res) { return res.json(); })
                .then(function(data) { return data.meals || []; })
                .catch(function() { return []; }),
            searchDummyJson(query)
        ]).then(function(results) {
            if (searchBox.value.trim().length >= 2) {
                var mealdbResults = results[0];
                var djResults = results[1];
                // Merge: local + MealDB + DummyJSON (deduped)
                var seen = {};
                var merged = [];
                localResults.forEach(function(m) { seen[m.idMeal] = true; merged.push(m); });
                mealdbResults.forEach(function(m) {
                    if (!seen[m.idMeal]) { seen[m.idMeal] = true; merged.push(m); }
                });
                djResults.forEach(function(m) {
                    if (!seen[m.idMeal]) { seen[m.idMeal] = true; merged.push(m); }
                });
                showAutocomplete(merged);
            }
        }).catch(function() {
            if (localResults.length > 0 && searchBox.value.trim().length >= 2) {
                showAutocomplete(localResults);
            } else {
                autocompleteEl.style.display = 'none';
            }
        });
    }, 300);
});

searchBox.addEventListener('keydown', function(e) {
    var items = autocompleteEl.querySelectorAll('.autocomplete-item');
    if (autocompleteEl.style.display === 'none' || items.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeAutoIndex = (activeAutoIndex + 1) % items.length;
        highlightAutoItem(activeAutoIndex);
        searchBox.value = items[activeAutoIndex].querySelector('span').textContent;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeAutoIndex = (activeAutoIndex - 1 + items.length) % items.length;
        highlightAutoItem(activeAutoIndex);
        searchBox.value = items[activeAutoIndex].querySelector('span').textContent;
    } else if (e.key === 'Escape') {
        autocompleteEl.style.display = 'none';
        activeAutoIndex = -1;
    }
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-wrapper')) {
        autocompleteEl.style.display = 'none';
        activeAutoIndex = -1;
    }
});

searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    autocompleteEl.style.display = 'none';
    activeAutoIndex = -1;
    var query = searchBox.value.trim();
    if (!query) { showToast('Please type a recipe name to search'); return; }
    document.getElementById('home').style.display = 'none';
    document.getElementById('recipes').style.display = '';
    document.getElementById('favourites').style.display = 'none';
    document.getElementById('history').style.display = 'none';
    navLinks.forEach(function(l) { l.classList.remove('active'); });
    document.querySelector('[data-section="recipes"]').classList.add('active');
    fetchRecipes(query);
});

// ===== INIT =====
updateAuthUI();
initDarkMode();

// ===== DARK MODE =====
function initDarkMode() {
    var toggle = document.getElementById('darkModeToggle');
    var saved = localStorage.getItem('recipeAppDarkMode');
    // Default is dark mode (no class). Light mode = 'light-mode' class.
    if (saved === 'light') {
        document.body.classList.add('light-mode');
        toggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    toggle.addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        var isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('recipeAppDarkMode', isLight ? 'light' : 'dark');
        toggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });
}

// ===== RECIPE FILTERS =====
var allFetchedMeals = [];
var filterBar = document.getElementById('filterBar');
var filterArea = document.getElementById('filterArea');
var filterCategory = document.getElementById('filterCategory');
var clearFiltersBtn = document.getElementById('clearFiltersBtn');

function populateFilters(meals) {
    var areas = [];
    var categories = [];
    meals.forEach(function(m) {
        if (m.strArea && areas.indexOf(m.strArea) === -1) areas.push(m.strArea);
        if (m.strCategory && categories.indexOf(m.strCategory) === -1) categories.push(m.strCategory);
    });
    areas.sort();
    categories.sort();

    filterArea.innerHTML = '<option value="">All Cuisines</option>';
    areas.forEach(function(a) {
        filterArea.innerHTML += '<option value="' + a + '">' + a + '</option>';
    });

    filterCategory.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(function(c) {
        filterCategory.innerHTML += '<option value="' + c + '">' + c + '</option>';
    });
}

function applyFilters() {
    var area = filterArea.value;
    var category = filterCategory.value;
    var filtered = allFetchedMeals.filter(function(m) {
        if (area && m.strArea !== area) return false;
        if (category && m.strCategory !== category) return false;
        return true;
    });

    recipeContainer.innerHTML = '';
    if (filtered.length === 0) {
        recipeContainer.innerHTML =
            '<div class="empty-state">' +
                '<i class="fa-solid fa-filter-circle-xmark empty-icon"></i>' +
                '<h2>No recipes match these filters</h2>' +
                '<p>Try changing or clearing the filters.</p>' +
            '</div>';
        return;
    }
    filtered.forEach(function(meal) {
        recipeContainer.appendChild(createRecipeCard(meal, false));
    });
}

filterArea.addEventListener('change', applyFilters);
filterCategory.addEventListener('change', applyFilters);
clearFiltersBtn.addEventListener('click', function() {
    filterArea.value = '';
    filterCategory.value = '';
    applyFilters();
});

// ===== BEST RESTAURANTS NEAR YOU =====
var restaurantData = {
    'Indian': [
        { name: 'Biryani Blues', rating: '4.5', distance: '1.2 km', icon: '🍛' },
        { name: 'Spice Garden', rating: '4.3', distance: '2.0 km', icon: '🌶️' },
        { name: 'Tandoori Nights', rating: '4.6', distance: '0.8 km', icon: '🔥' },
        { name: 'Curry House', rating: '4.2', distance: '3.1 km', icon: '🍲' }
    ],
    'Italian': [
        { name: 'La Bella Italia', rating: '4.7', distance: '1.5 km', icon: '🍝' },
        { name: 'Pizza Roma', rating: '4.4', distance: '0.9 km', icon: '🍕' },
        { name: 'Trattoria Milano', rating: '4.5', distance: '2.3 km', icon: '🇮🇹' },
        { name: 'Pasta Palace', rating: '4.1', distance: '1.8 km', icon: '🍜' }
    ],
    'Chinese': [
        { name: 'Golden Dragon', rating: '4.4', distance: '1.0 km', icon: '🐉' },
        { name: 'Wok & Roll', rating: '4.3', distance: '2.5 km', icon: '🥡' },
        { name: 'Dim Sum Delight', rating: '4.6', distance: '1.7 km', icon: '🥟' },
        { name: 'Szechuan Flame', rating: '4.2', distance: '3.0 km', icon: '🌶️' }
    ],
    'Mexican': [
        { name: 'Taco Loco', rating: '4.5', distance: '1.3 km', icon: '🌮' },
        { name: 'El Sombrero', rating: '4.3', distance: '2.1 km', icon: '🇲🇽' },
        { name: 'Burrito Express', rating: '4.4', distance: '0.7 km', icon: '🌯' },
        { name: 'Casa de Salsa', rating: '4.1', distance: '2.8 km', icon: '💃' }
    ],
    'Japanese': [
        { name: 'Sakura Sushi', rating: '4.7', distance: '1.1 km', icon: '🍣' },
        { name: 'Ramen House', rating: '4.5', distance: '0.6 km', icon: '🍜' },
        { name: 'Tokyo Grill', rating: '4.3', distance: '2.4 km', icon: '🇯🇵' },
        { name: 'Wasabi Kitchen', rating: '4.4', distance: '1.9 km', icon: '🥢' }
    ],
    'Thai': [
        { name: 'Thai Orchid', rating: '4.5', distance: '1.4 km', icon: '🌸' },
        { name: 'Bangkok Bites', rating: '4.3', distance: '2.2 km', icon: '🍲' },
        { name: 'Pad Thai Palace', rating: '4.6', distance: '0.9 km', icon: '🥘' },
        { name: 'Spicy Basil', rating: '4.2', distance: '3.3 km', icon: '🌿' }
    ],
    'French': [
        { name: 'Le Petit Bistro', rating: '4.8', distance: '1.6 km', icon: '🥖' },
        { name: 'Café Parisien', rating: '4.5', distance: '2.0 km', icon: '☕' },
        { name: 'Boulangerie Belle', rating: '4.4', distance: '1.2 km', icon: '🥐' },
        { name: 'Chateau Gourmet', rating: '4.6', distance: '2.7 km', icon: '🇫🇷' }
    ],
    'American': [
        { name: 'Burger Barn', rating: '4.3', distance: '0.5 km', icon: '🍔' },
        { name: 'Smokehouse BBQ', rating: '4.5', distance: '1.8 km', icon: '🥩' },
        { name: 'Diner Dash', rating: '4.2', distance: '1.1 km', icon: '🍟' },
        { name: 'Grill Masters', rating: '4.4', distance: '2.5 km', icon: '🔥' }
    ],
    'British': [
        { name: 'The Chippy', rating: '4.3', distance: '1.0 km', icon: '🐟' },
        { name: 'Pub & Grub', rating: '4.4', distance: '0.8 km', icon: '🍺' },
        { name: 'Royal Kitchen', rating: '4.5', distance: '2.1 km', icon: '👑' },
        { name: 'Tea & Toast', rating: '4.2', distance: '1.6 km', icon: '☕' }
    ],
    '_default': [
        { name: 'World Flavors Kitchen', rating: '4.4', distance: '1.0 km', icon: '🌍' },
        { name: 'The Fusion Table', rating: '4.3', distance: '1.8 km', icon: '🍽️' },
        { name: 'Gourmet Garden', rating: '4.5', distance: '2.2 km', icon: '🌿' },
        { name: 'Chef\'s Special', rating: '4.6', distance: '0.9 km', icon: '👨‍🍳' }
    ]
};

function getRestaurantsHTML(cuisine) {
    var restaurants = restaurantData[cuisine] || restaurantData['_default'];
    var html =
        '<div class="restaurants-section">' +
            '<h3><i class="fa-solid fa-location-dot"></i> Best Restaurants Near You</h3>' +
            '<div class="restaurants-grid">';

    restaurants.forEach(function(r) {
        html +=
            '<div class="restaurant-card">' +
                '<div class="restaurant-icon">' + r.icon + '</div>' +
                '<div class="restaurant-info">' +
                    '<span class="rest-name">' + r.name + '</span>' +
                    '<div class="rest-meta">' +
                        '<span class="rest-rating"><i class="fa-solid fa-star"></i> ' + r.rating + '</span>' +
                        '<span><i class="fa-solid fa-route"></i> ' + r.distance + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
    });

    html += '</div></div>';
    return html;
}

// ===== VOICE SEARCH =====
var voiceSearchBtn = document.getElementById('voiceSearchBtn');
var isListening = false;
var recognition = null;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
        isListening = true;
        voiceSearchBtn.classList.add('listening');
        voiceSearchBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i>';
        showToast('Listening... Speak a recipe name');
    };

    recognition.onresult = function(event) {
        var transcript = '';
        for (var i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        searchBox.value = transcript;
        if (event.results[event.resultIndex].isFinal) {
            stopListening();
            if (transcript.trim()) {
                searchForm.dispatchEvent(new Event('submit'));
            }
        }
    };

    recognition.onerror = function(event) {
        stopListening();
        if (event.error === 'no-speech') {
            showToast('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
            showToast('Microphone access denied. Please allow microphone.');
        } else {
            showToast('Voice search error. Please try again.');
        }
    };

    recognition.onend = function() {
        stopListening();
    };

    voiceSearchBtn.addEventListener('click', function() {
        if (isListening) {
            recognition.stop();
            stopListening();
        } else {
            try {
                recognition.start();
            } catch(e) {
                showToast('Voice search unavailable. Please try again.');
            }
        }
    });
} else {
    voiceSearchBtn.style.display = 'none';
}

function stopListening() {
    isListening = false;
    if (voiceSearchBtn) {
        voiceSearchBtn.classList.remove('listening');
        voiceSearchBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    }
}

// ===== MULTI-LANGUAGE TRANSLATION =====
var currentLang = 'en';
var langToggle = document.getElementById('langToggle');
var langDropdown = document.getElementById('langDropdown');
var currentLangLabel = document.getElementById('currentLangLabel');
var translationCache = {};

var langLabels = {
    'en': 'EN', 'hi': 'हि', 'te': 'తె', 'ta': 'த', 'bn': 'বা',
    'mr': 'म', 'gu': 'ગુ', 'kn': 'ಕ', 'ml': 'മ', 'pa': 'ਪੰ',
    'ur': 'UR', 'es': 'ES', 'fr': 'FR', 'ar': 'AR', 'zh': 'ZH', 'ja': 'JA'
};

langToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    langDropdown.classList.toggle('show');
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.language-selector')) {
        langDropdown.classList.remove('show');
    }
});

document.querySelectorAll('.lang-option').forEach(function(opt) {
    opt.addEventListener('click', function(e) {
        e.stopPropagation();
        var lang = opt.dataset.lang;
        currentLang = lang;
        currentLangLabel.textContent = langLabels[lang] || lang.toUpperCase();
        document.querySelectorAll('.lang-option').forEach(function(o) { o.classList.remove('active'); });
        opt.classList.add('active');
        langDropdown.classList.remove('show');
        showToast('Language changed to ' + opt.textContent.trim());

        // Re-translate currently open recipe popup if visible
        if (recipeOverlay.classList.contains('show')) {
            translateRecipePopup(lang);
        }
    });
});

function translateText(text, targetLang) {
    if (!text || !text.trim() || targetLang === 'en') {
        return Promise.resolve(text);
    }
    var cacheKey = targetLang + ':' + text.substring(0, 100);
    if (translationCache[cacheKey]) {
        return Promise.resolve(translationCache[cacheKey]);
    }
    var url = 'https://api.mymemory.translated.net/get?q=' +
        encodeURIComponent(text.substring(0, 500)) +
        '&langpair=en|' + targetLang;
    return fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.responseData && data.responseData.translatedText) {
                var translated = data.responseData.translatedText;
                translationCache[cacheKey] = translated;
                return translated;
            }
            return text;
        })
        .catch(function() { return text; });
}

function translateRecipePopup(lang) {
    if (lang === 'en') {
        // Restore original content if we have it
        if (window._originalRecipeContent) {
            recipeDetailsContent.innerHTML = window._originalRecipeContent;
            reattachPopupShareListeners();
        }
        return;
    }

    // Save original content before translating
    if (!window._originalRecipeContent || !recipeDetailsContent.querySelector('.translating-indicator')) {
        window._originalRecipeContent = recipeDetailsContent.innerHTML;
    }

    // Show translating indicator
    var existingIndicator = recipeDetailsContent.querySelector('.translating-indicator');
    if (!existingIndicator) {
        var indicator = document.createElement('div');
        indicator.className = 'translating-indicator';
        indicator.innerHTML = '<i class="fa-solid fa-language"></i> Translating...';
        recipeDetailsContent.insertBefore(indicator, recipeDetailsContent.firstChild);
    }

    var recipeName = recipeDetailsContent.querySelector('.recipeName');
    var instructions = recipeDetailsContent.querySelector('.recipeInstructions');
    var ingredients = recipeDetailsContent.querySelectorAll('.ingredientList li');

    var promises = [];

    if (recipeName) {
        promises.push(
            translateText(recipeName.getAttribute('data-original') || recipeName.textContent, lang)
                .then(function(translated) {
                    if (!recipeName.getAttribute('data-original')) {
                        recipeName.setAttribute('data-original', recipeName.textContent);
                    }
                    recipeName.textContent = translated;
                })
        );
    }

    if (instructions) {
        promises.push(
            translateText(instructions.getAttribute('data-original') || instructions.textContent, lang)
                .then(function(translated) {
                    if (!instructions.getAttribute('data-original')) {
                        instructions.setAttribute('data-original', instructions.textContent);
                    }
                    instructions.textContent = translated;
                })
        );
    }

    ingredients.forEach(function(li) {
        promises.push(
            translateText(li.getAttribute('data-original') || li.textContent, lang)
                .then(function(translated) {
                    if (!li.getAttribute('data-original')) {
                        li.setAttribute('data-original', li.textContent);
                    }
                    li.textContent = translated;
                })
        );
    });

    Promise.all(promises).then(function() {
        var indicator = recipeDetailsContent.querySelector('.translating-indicator');
        if (indicator) indicator.remove();
    });
}

function reattachPopupShareListeners() {
    recipeDetailsContent.querySelectorAll('.share-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (window._lastOpenedMeal) {
                shareMeal(window._lastOpenedMeal, btn.dataset.platform);
            }
        });
    });
}

// Patch openRecipePopup to store meal and auto-translate
var _originalOpenRecipePopup = openRecipePopup;
openRecipePopup = function(meal) {
    window._lastOpenedMeal = meal;
    window._originalRecipeContent = null;
    _originalOpenRecipePopup(meal);
    if (currentLang !== 'en') {
        setTimeout(function() {
            translateRecipePopup(currentLang);
        }, 100);
    }
};
