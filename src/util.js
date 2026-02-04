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

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, 
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const now = {
    date: function () {
        const currentdate = new Date(); 
        return currentdate.getFullYear() + 
                (currentdate.getMonth()+1).toString().padStart(2, '0') +
                currentdate.getDate().toString().padStart(2, '0');
    },
    time: () => {
        const currentdate = new Date(); 
        return currentdate.getHours().toString().padStart(2, '0') + ":"  
                + currentdate.getMinutes().toString().padStart(2, '0') + ":" 
                + currentdate.getSeconds().toString().padStart(2, '0');
    }
}

String.prototype.toDate = function() {
    let value = this.substr(6, 2) + '/' + this.substr(4, 2) + '/' + this.substr(0, 4);
    return value;
}

String.prototype.isDate = function() {
    let valid = Date.parse(this.substr(0, 4) + '-' + this.substr(4, 2) + '-' + this.substr(6, 2));
    if (isNaN(valid)) return false;
    return true;
}

function formatDate(yyyymmdd) {

  return yyyymmdd.replace(
    /(\d{4})(\d{2})(\d{2})/,
    '$3/$2/$1'
  );
}