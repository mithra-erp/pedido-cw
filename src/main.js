const template = document.querySelector("#card-row-template");
const app = document.querySelector("#app");

let currentDate = new Date().toJSON().slice(0, 10).replaceAll("-", "");

const __main = () => __getItens();

const __getItens = () => {
    let data = {
        "area": "ESTLOJ",
        "fields": ["FILIAL", "DATA", "STATUS", "IDENTIFICADOR"],
        "search": [
            {
                "field": "DATA",
                "operation": "GREATER_OR_EQUAL_THAN",
                "value": currentDate
            },
            {
                "field": "DATA",
                "operation": "LESS_OR_EQUAL_THAN",
                "value": currentDate
            }
        ],
        "group by": ["FILIAL", "DATA", "IDENTIFICADOR"]
    }

    loading.start();

    fetch("https://api.mithra.com.br/mithra/v1/search", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "X-Client-Id": sessionStorage.getItem('x-client-id'),
            "Authorization": "Bearer " + sessionStorage.getItem('access_token'),
            "Content-Type": "application/json"
        }
    }).then(response => {
        console.log(response)
        return response.json()
    }).then(json => {
        if (json.success) {
            console.log(json)
            json.data.forEach(item => {
                const clone = template.content.cloneNode(true);
                clone.querySelector(".card-header").innerHTML = item.IDENTIFICADOR
                clone.querySelector(".card-body").innerHTML = item.DATA
                clone.querySelector(".card-body").innerHTML = item.FILIAL
                clone.querySelector(".card-footer").innerHTML = item.STATUS
                app.appendChild(clone);
            });
        } else {
            alert(json.message)
        }
    })
        .catch((error) => alert(error))
        .finally(() => loading.complete());
}