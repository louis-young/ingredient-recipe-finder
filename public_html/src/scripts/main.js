"use strict";

// Development mode.
const development = true;

/**
 * API requests.
 */

class Request {
  static async get(api) {
    Logger.log(`API Request: ${api}`);

    const proxy = "https://cors-anywhere.herokuapp.com/";

    const response = await fetch(`${proxy}${api}`);

    const data = await response.json();

    Logger.log(`API Response: ${JSON.stringify(data)}`);

    return data;
  }
}

/**
 * Logger utility.
 */

class Logger {
  static log(message) {
    if (development) {
      console.log(`[RECIPES] ${message}`);
    }
  }

  static error(message) {
    if (development) {
      console.error(`[RECIPES] ${message}`);
    }
  }

  static warn(message) {
    if (development) {
      console.warn(`[RECIPES] ${message}`);
    }
  }
}

/**
 * App.
 */

class App {
  constructor() {}

  /**
   * GET ingredients.
   */

  get ingredients() {
    const ingredientsToInclude = [];

    const ingredients = ingredientsContainer.querySelectorAll(".ingredient");

    if (ingredients.length === 0) {
      return;
    }

    ingredients.forEach((ingredient) => {
      ingredientsToInclude.push(ingredient.textContent);
    });

    return ingredientsToInclude;
  }

  /**
   * GET recipes.
   */

  get recipes() {
    return (async () => {
      return await Request.get(`http://www.recipepuppy.com/api/?i=${this.ingredients}&p=1`);
    })();
  }
}

const app = new App();

/**
 * Screen.
 */

class Screen {
  static addIngredient(ingredient) {
    let output = `<li class="ingredient">${ingredient}</li>`;

    ingredientsContainer.innerHTML += output;
  }

  static renderRecipes(recipes) {
    let output = "";

    recipes.results.forEach((recipe) => {
      const { title, ingredients } = recipe;

      output += `<li class="recipe"><p class="recipe__title">${title}</p><p class="recipe__ingredients">${ingredients}</p></li>`;
    });

    recipesContainer.innerHTML = output;
  }
}

/**
 * DOM.
 */

const form = document.querySelector(".form");

const input = document.querySelector(".form__input");

const ingredientsContainer = document.querySelector(".ingredients");

const recipesContainer = document.querySelector(".recipes");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  Screen.addIngredient(input.value);

  input.value = "";

  input.focus();

  (async () => {
    Screen.renderRecipes(await app.recipes);
  })();
});

ingredientsContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("ingredient")) {
    event.target.remove();

    (async () => {
      Screen.renderRecipes(await app.recipes);
    })();
  }
});
