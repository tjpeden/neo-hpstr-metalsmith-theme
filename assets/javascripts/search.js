function get(url) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.onreadystatechange = check;
    request.open('GET', url, true);
    request.send();

    function check() {
      if(request.readyState === XMLHttpRequest.DONE) {
        if(request.status === 200) {
          resolve(request.responseText);
        } else {
          reject("There was a problem with the request.");
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', event => {
  get('/search/index.json').then(data => {
    const json = JSON.parse(data);
    const index = lunr.Index.load(json);
    const searchInput = document.querySelector('#search-input');
    const searchResults = document.querySelector('#search-results');

    searchInput.addEventListener('keyup', event => {
      const results = index.search(searchInput.value);

      searchResults.innerHTML = '';

      console.log(results);
      for(let result of results) {
        const ref = `/${result.ref}`;
        const li = document.createElement('li');
        const anchor = document.createElement('a');

        anchor.href = ref;
        anchor.title = ref;
        anchor.innerText = ref;

        li.appendChild(anchor);
        searchResults.appendChild(li);
      }
    });
  });
});
