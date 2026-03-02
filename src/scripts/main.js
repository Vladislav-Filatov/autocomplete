import '../styles/reset.css';
import '../styles/index.css';
import {apiSend} from "./api.js";

const repoInput = document.querySelector('.main__input');
const repoList = document.querySelector('.repo-list');
const autoCompleteList = document.querySelector('.autocomplete-list');
const repoItemTemplate = document.querySelector('#repo-list-item-template').content;
const autoCompleteItemTemplate = document.querySelector('#autocomplete-item-template').content;
let autoCompleteItemsList = [];
let displayedRepos = [];
let requestCount = 0;

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    }
}

function clearAutocomplete() {
    autoCompleteList.innerHTML = '';
    autoCompleteItemsList = [];
}

function createNewAutocompleteItem(data, index) {
    const newAutocompleteItem = autoCompleteItemTemplate.cloneNode(true);
    newAutocompleteItem.querySelector('.autocomplete-item').textContent = data.name;
    newAutocompleteItem.querySelector('.autocomplete-item').dataset.itemIndex = String(index);
    autoCompleteList.append(newAutocompleteItem);
    return newAutocompleteItem;
}
function createNewRepoItem(data) {
    const newRepoItem = repoItemTemplate.cloneNode(true);
    newRepoItem.querySelector('.item__name-field').textContent += data.name;
    newRepoItem.querySelector('.item__owner-field').textContent += data.owner.login;
    newRepoItem.querySelector('.item__stars-field').textContent += data.stargazers_count;
    newRepoItem.querySelector('.repo-list__item').dataset.repoId = String(data.id);
    repoList.append(newRepoItem);
    return newRepoItem;
}

function renderRepoList() {
    repoList.innerHTML = '';
    for (const repo of displayedRepos) {
        createNewRepoItem(repo);
    }
}

const debouncedSearch = debounce(async (text) => {
    const q = text.trim();
    if (!q) {
        clearAutocomplete();
        return;
    }
    const currentRequestCount = ++requestCount;
    try {
        const data = await apiSend(q);
        if (currentRequestCount!==requestCount) return;
        clearAutocomplete();
        for (let i=0; i<5; i++) {
            if (!data.items[i]) break;
            autoCompleteItemsList.push(data.items[i]);
            createNewAutocompleteItem(data.items[i], i);
        }
    } catch (err) {
        if (currentRequestCount !== requestCount) return;
        clearAutocomplete();
        console.log(err);
    }
}, 400);


repoInput.addEventListener('input', () => {
    debouncedSearch(repoInput.value);
});

autoCompleteList.addEventListener('click', (e) => {
    const item = e.target.closest('.autocomplete-item');
    if (!item) return;
    const selectedRepo = autoCompleteItemsList[Number(item.dataset.itemIndex)];
    const alreadyAdded = displayedRepos.some(repo => repo.id === selectedRepo.id);
    if (!alreadyAdded) {
        displayedRepos.push(selectedRepo);
        renderRepoList();
    }
    clearAutocomplete();
    repoInput.value = '';
});

repoList.addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.item__delete-button');
    if (!deleteButton) return;
    const item = deleteButton.closest('.repo-list__item');
    if (!item) return;
    displayedRepos = displayedRepos.filter(repo => repo.id !== Number(item.dataset.repoId));
    renderRepoList();
});