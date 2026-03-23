const searchBox=document.querySelector('.searchBox');
const searchBtn=document.querySelector('.searchBtn');
const recipeContainer=document.querySelector('.recipe-container');
const recipeDetailsContent=document.querySelector('.recipe-details-content');
const recipeCloseBtn=document.querySelector('.recipe-close-btn');

//function to get recipes

const fetchRecipes=async(query)=>{
    recipeContainer.innerHTML='<h2>Fetching recipes...</h2>'; // Clear previous results
    try{
    const data=await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const response=await data.json();
    recipeContainer.innerHTML=''; // Clear loading message
    response.meals.forEach(meal=>{
         const recipeDiv=document.createElement('div');
         recipeDiv.classList.add('recipe');
         recipeDiv.innerHTML=`
         <img src="${meal.strMealThumb}">
         <H3>${meal.strMeal}</H3>
         <p><span>${meal.strArea}</span> Dish</p>
         <p><span>${meal.strCategory}</span> category</p>

         
         `
         const button=document.createElement('button');
         button.textContent='View Recipe';
         recipeDiv.appendChild(button);
         
            //Adding EventListener to recipe button
            button.addEventListener('click',()=>{
                openRecipePopup(meal);
            });
            recipeContainer.appendChild(recipeDiv);
    });
}
catch(error){
    recipeContainer.innerHTML='<h2>Failed to fetch recipes. Please try again later.</h2>';
    console.error('Error fetching recipes:', error);
}

}
//fucntion to fetch ingredient s and measurements
const fetchIngredients = (meal) => {
    let ingredientsList = "";

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`]; // ✅ fixed
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== "") {
            ingredientsList += `<li>${measure} ${ingredient}</li>`;
        } else {
            break;
        }
    }

    return ingredientsList;
}
const openRecipePopup=(meal)=>{
    recipeDetailsContent.innerHTML=`
    <h2 class="recipeName">${meal.strMeal}</h2>
    <h3>Ingredients</h3>
    <ul class="ingredientList">${fetchIngredients(meal)}</ul>
    
    <div>
        <h3>Instructions</h3>
        <div>
        <p class="recipeInstructions">${meal.strInstructions}</p>
        </div>
        </div>
    `
    ;
    recipeDetailsContent.parentElement.style.display='block';
}
recipeCloseBtn.addEventListener('click',()=>{
    recipeDetailsContent.parentElement.style.display='none';
})


searchBtn.addEventListener('click',(e)=>{
       e.preventDefault();
       const searchInput=searchBox.value.trim();
       if(!searchInput){
        recipeContainer.innerHTML='"<h2>Please enter a meal to search</h2>"';
        return;
       }
       fetchRecipes(searchInput);
})