let dropdownOpts;

const createDropdown = () => {
  const dropdown = document.createElement('select');
  dropdown.classList.add('dropdown');
  dropdown.addEventListener('change', handleSelectChange);
  dropdownOpts.forEach((loc) => {
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
  det.classList.add(title);
  det.classList.add('category');

  const summary = document.createElement('summary');
  if (config.LOC_NAME_MAP && config.LOC_NAME_MAP[title]) {
    title = config.LOC_NAME_MAP[title];
  }
  summary.innerText = title;
  det.appendChild(summary);
  
  const list = document.createElement('ul');
  det.appendChild(list);

  el.appendChild(det);

  return list;
};

const handleSelectChange = (e) => {
  document.querySelector('.main').classList.add('dim');

  const li = e.target.parentElement;
  const id = li.getAttribute('dbid');
  fetch(`./update.php?id=${id}&location=${e.target.value}`)
    .then(() => {
      li.parentElement.removeChild(li);
      document.querySelector(`details.${e.target.value} ul`).appendChild(li);
      document.querySelector('.main').classList.remove('dim');
    })
    .catch((error) => {
      console.error(error);
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

  // First make sections for each default location
  const startingLocs = config.DEFAULT_LOCS ? config.DEFAULT_LOCS : [];
  startingLocs.forEach((loc) => {
    createNewSection(dataEl, loc);
  });
  
  // Also run through and find every location, for use in the dropdown
  dropdownOpts = [...new Set(startingLocs.concat(data.map(item => item.location)))];

  // Finally populate these sections, making new ones as needed.
  curloc = "";
  let cursection = null;
  data.forEach((item) => {
    if (item.location !== curloc) {
      curloc = item.location;
      cursection = dataEl.querySelector(`details.${curloc} ul`);
      if (!cursection){
        cursection = createNewSection(dataEl, curloc);
      }
    }
    createAndAddItem(cursection, item);
  });

  const mainEl = document.querySelector('.main');
  mainEl.removeChild(mainEl.children[0]);
  mainEl.appendChild(dataEl);
  mainEl.classList.remove('dim');
};

window.onload = setup;