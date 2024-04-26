const loading = {
    start: function () {
        document.body.insertAdjacentHTML('beforeend', '<div id="loading" class="loading">LOADING</div>');
    },
    complete: function () {
        var loading = document.getElementById("loading");
        loading.remove(loading);
    }
};

const createElementFromHTML = (htmlString) => {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}