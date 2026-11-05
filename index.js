let dropdownOpts;

function updateTopBar() {
  for (const loc of Object.keys(config.VITAL_LOC_EMOJI_MAP)) {
    const container = document.querySelector(`.${loc}`);
    let emojiStr = config.VITAL_LOC_EMOJI_MAP[loc];
    let minRemaining = 2;
    for (const type of Object.keys(config.VITAL_TYPE_EMOJI_MAP)) {
      const isSingleton = config.SINGLETON_TYPE_LIST.indexOf(type) >= 0;
      const count = container.querySelectorAll(`.${type}`).length ?? 0;
      if (count >= 2 || (count && isSingleton)) {
        continue;
      }
      emojiStr += config.VITAL_TYPE_EMOJI_MAP[type];
      if (minRemaining > count) { minRemaining = count; }
    }
    if (minRemaining === 2) {
      // This area is fine - clear the topbar
      postToTopbar(`gym${loc}`);
    } else {
      const color = minRemaining === 0 ? '#ba2709' : '#d9ab07';
      postToTopbar(`gym${loc}`, emojiStr, color, 'gymcloset');
    }
  }  
}

function createDropdown() {
  const dropdown = document.createElement('select');
  dropdown.classList.add('dropdown');
  dropdown.addEventListener('change', handleSelectChange);
  dropdownOpts.forEach((loc) => {
    dropdown.options.add(new Option(loc, loc));
  });
  return dropdown;
}

async function setup() {
  const response = await fetch('./list.php');
  const data =  await response.json();
  initialSetup(data);
  updateTopBar();
};

function createNewSection(el, title) {
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

async function handleSelectChange(e) {
  document.querySelector('.main').classList.add('dim');

  const li = e.target.parentElement;
  const id = li.getAttribute('dbid');
  await fetch(`./update.php?id=${id}&location=${e.target.value}`)
  li.parentElement.removeChild(li);
  document.querySelector(`details.${e.target.value} ul`).appendChild(li);
  document.querySelector('.main').classList.remove('dim');
  updateTopBar();
};

function createAndAddItem(section, item) {
  const listItem = document.createElement('li');
  listItem.classList.add('itemContainer');

  const outerDiv = document.createElement('div');
  outerDiv.classList.add(item.type);
  outerDiv.classList.add('itemnameContainer');

  const img = document.createElement('img');
  img.setAttribute('src',`${item.filename}.png`);
  img.classList.add('itemimg');
  outerDiv.appendChild(img);

  const innerDiv = document.createElement('div');
  innerDiv.innerHTML = item.name;
  innerDiv.classList.add('itemname');
  outerDiv.appendChild(innerDiv);

  listItem.setAttribute('dbid', item.id);
  listItem.setAttribute('loc', item.location);
  listItem.appendChild(outerDiv);

  const dd = createDropdown();
  dd.value = item.location;

  listItem.appendChild(dd);
  section.appendChild(listItem);
};

function initialSetup(data) {
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
