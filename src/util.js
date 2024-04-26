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

function parse(str) {
    if(!/^(\d){8}$/.test(str)) return null;
    var y = str.substr(0,4),
        m = str.substr(4,2),
        d = str.substr(6,2);
    return new Date(y,m,d);
}