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

        if (section === 'home') {
            heroEl.style.display = '';
            recipesEl.style.display = '';
            favouritesEl.style.display = 'none';
            heroEl.scrollIntoView({ behavior: 'smooth' });
        } else if (section === 'recipes') {
            heroEl.style.display = 'none';
            recipesEl.style.display = '';
            favouritesEl.style.display = 'none';
            recipesEl.scrollIntoView({ behavior: 'smooth' });
        } else if (section === 'favourites') {
            heroEl.style.display = 'none';
            recipesEl.style.display = 'none';
            favouritesEl.style.display = '';
            renderFavourites();
            favouritesEl.scrollIntoView({ behavior: 'smooth' });
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

    return recipeDiv;
}

function fetchAndShowMeal(id) {
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

    fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(query))
        .then(function(res) { return res.json(); })
        .then(function(data) {
            recipeContainer.innerHTML = '';

            // Remove old results header if any
            var oldHeader = document.querySelector('.results-header');
            if (oldHeader) oldHeader.remove();
            var oldInlineSearch = document.querySelector('.inline-search');
            if (oldInlineSearch) oldInlineSearch.remove();

            if (!data.meals || data.meals.length === 0) {
                recipeContainer.innerHTML =
                    '<div class="empty-state">' +
                        '<i class="fa-solid fa-face-sad-tear empty-icon"></i>' +
                        '<h2>No recipes found for "' + query + '"</h2>' +
                        '<p>Try searching for something else like "pasta", "chicken", or "cake".</p>' +
                    '</div>';
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
            var header = document.createElement('div');
            header.className = 'results-header';
            header.innerHTML =
                '<h2>Results for <span>"' + query + '"</span></h2>' +
                '<span class="results-count"><i class="fa-solid fa-bowl-food"></i> ' + data.meals.length + ' recipe' + (data.meals.length > 1 ? 's' : '') + ' found</span>';
            recipeContainer.parentElement.insertBefore(header, recipeContainer);

            data.meals.forEach(function(meal) {
                recipeContainer.appendChild(createRecipeCard(meal, false));
            });

            document.getElementById('recipes').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(function(error) {
            recipeContainer.innerHTML =
                '<div class="empty-state">' +
                    '<i class="fa-solid fa-triangle-exclamation empty-icon"></i>' +
                    '<h2>Failed to fetch recipes</h2>' +
                    '<p>Please check your internet connection and try again.</p>' +
                '</div>';
            console.error('Error fetching recipes:', error);
        });
}

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

// ===== RECIPE POPUP =====
function openRecipePopup(meal) {
    var content =
        '<h2 class="recipeName">' + meal.strMeal + '</h2>' +
        '<h3><i class="fa-solid fa-basket-shopping"></i> Ingredients</h3>' +
        '<ul class="ingredientList">' + fetchIngredients(meal) + '</ul>' +
        '<h3><i class="fa-solid fa-list-check"></i> Instructions</h3>' +
        '<p class="recipeInstructions">' + meal.strInstructions + '</p>';

    if (meal.strYoutube) {
        content += '<a href="' + meal.strYoutube + '" target="_blank" rel="noopener noreferrer" class="recipe-video-link">' +
            '<i class="fa-brands fa-youtube"></i> Watch Video Tutorial</a>';
    }

    recipeDetailsContent.innerHTML = content;
    recipeOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
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
searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var query = searchBox.value.trim();
    if (!query) { showToast('Please type a recipe name to search'); return; }
    document.getElementById('home').style.display = 'none';
    document.getElementById('recipes').style.display = '';
    document.getElementById('favourites').style.display = 'none';
    navLinks.forEach(function(l) { l.classList.remove('active'); });
    document.querySelector('[data-section="recipes"]').classList.add('active');
    fetchRecipes(query);
});

// ===== INIT =====
updateAuthUI();
