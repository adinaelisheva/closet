const LOC_NAME_MAP = {
  "work" : "At work",
  "home" : "At home",
  "climbing" : "In climbing bag",
  "wash" : "In the wash"
};

let dropdown = null;

/** Some handy helpers */
const showEl = (el) => {
  el.classList.remove('hide');
};
const hideEl = (el) => {
  el.classList.add('hide');
};
const resetAll = () => {
  // Show everythng but hide dropdown and screen
  document.querySelectorAll('.hide').forEach(showEl);
  hideEl(document.querySelector('.screen'));
  hideEl(dropdown);
}

const setup = () => {
  fetch('./list.php')
    .then(response => response.json())
    .then(data => updatePage(data))
    .catch(error => console.error(error));
};

const createNewSection = (el, title) => {
  const det = document.createElement('details');

  const summary = document.createElement('summary');
  summary.innerText = LOC_NAME_MAP[title];
  det.appendChild(summary);
  
  const list = document.createElement('ul');
  det.appendChild(list);

  el.appendChild(det);

  return list;
};

const handleItemClick = (e) => {
  resetAll();
  if (dropdown === null) {
    return;
  }
  hideEl(e.target);

  dropdown.value = e.target.parentElement.getAttribute('loc');

  e.target.parentElement.appendChild(dropdown);
  showEl(dropdown);
  showEl(document.querySelector('.screen'));
};

const handleSelectChange = (e) => {
  resetAll();
  document.querySelector('.main').classList.add('dim');

  const id = e.target.parentElement.getAttribute('dbid');
  fetch(`./update.php?id=${id}&location=${e.target.value}`)
    .then(setup)
    .catch((error) => {
      console.error(error);
      resetAll();
    });
};

const createAndAddItem = (section, item) => {
  const listItem = document.createElement('li');
  const innerDiv = document.createElement('div');
  innerDiv.innerHTML = item.name;
  innerDiv.addEventListener('click', handleItemClick);
  listItem.setAttribute('dbid', item.id);
  listItem.setAttribute('loc', item.location);
  listItem.appendChild(innerDiv);
  section.appendChild(listItem);
};

const updatePage = (data) => {
  const dataEl = document.createElement('div');
  dataEl.classList.add('data');

  // Also set this up as we go
  dropdown = document.createElement('select');
  dropdown.classList.add('dropdown');
  dropdown.addEventListener('change', handleSelectChange);

  let curloc = "";
  let cursection = null;
  data.forEach((item) => {
    if (item.location !== curloc) {
      curloc = item.location;
      dropdown.options.add(new Option(curloc, curloc));
      cursection = createNewSection(dataEl, curloc);
    }
    createAndAddItem(cursection, item);
  });

  const mainEl = document.querySelector('.main');
  mainEl.removeChild(mainEl.children[0]);
  mainEl.appendChild(dataEl);

  // Screen shows up to listen for non-dropdown clicks. When it's hit, 
  // show everything except hide dropdown and itself
  document.querySelector('.screen').addEventListener('click', resetAll);

  mainEl.classList.remove('dim');
};

window.onload = setup;