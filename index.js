const LOC_NAME_MAP = {
  "work" : "At work",
  "home" : "At home",
  "climbing" : "In climbing bag",
  "wash" : "In the wash"
};

const DROPDOWN_OPTS = [];

/** Some handy helpers */
const showEl = (el) => {
  el.classList.remove('hide');
};
const hideEl = (el) => {
  el.classList.add('hide');
};
const resetAll = () => {
  // Show everythng but hide dropdowns
  document.querySelectorAll('.hide').forEach(showEl);
  document.querySelectorAll('.dropdown').forEach(hideEl);
};

const createDropdown = () => {
  const dropdown = document.createElement('select');
  dropdown.classList.add('dropdown');
  dropdown.addEventListener('change', handleSelectChange);
  DROPDOWN_OPTS.forEach((loc) => {
    dropdown.options.add(new Option(loc, loc));
  });
  return dropdown;
}

const setup = () => {
  fetch('./list.php')
    .then(response => response.json())
    .then(data => initialSetup(data))
    .catch(error => console.error(error));
};

const createNewSection = (el, title) => {
  const det = document.createElement('details');

  const summary = document.createElement('summary');
  if (LOC_NAME_MAP[title]) {
    title = LOC_NAME_MAP[title];
  }
  summary.innerText = title;
  det.appendChild(summary);
  
  const list = document.createElement('ul');
  det.appendChild(list);

  el.appendChild(det);

  return list;
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
  listItem.classList.add('itemContainer');
  const innerDiv = document.createElement('div');
  innerDiv.innerHTML = item.name;
  innerDiv.classList.add('itemname');
  listItem.setAttribute('dbid', item.id);
  listItem.setAttribute('loc', item.location);
  listItem.appendChild(innerDiv);
  const dd = createDropdown();
  dd.value = item.location;
  listItem.appendChild(dd);
  section.appendChild(listItem);
};

const initialSetup = (data) => {
  const dataEl = document.createElement('div');
  dataEl.classList.add('data');

  // First run through and find every location
  // Note: SQL could do this for me...
  const locs = [...new Set(data.map(item => item.location))];
  locs.forEach((loc) => {
    DROPDOWN_OPTS.push(loc);
  })

  curloc = "";
  let cursection = null;
  data.forEach((item) => {
    if (item.location !== curloc) {
      curloc = item.location;
      cursection = createNewSection(dataEl, curloc);
    }
    createAndAddItem(cursection, item);
  });

  const mainEl = document.querySelector('.main');
  mainEl.removeChild(mainEl.children[0]);
  mainEl.appendChild(dataEl);
  mainEl.classList.remove('dim');
};

window.onload = setup;