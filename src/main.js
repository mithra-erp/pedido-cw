const template = document.querySelector("#card-row-template");
const app = document.querySelector("#app");

let currentDate = new Date().toJSON().slice(0, 10).replaceAll("-", "");

const __main = () => __getItens();

const __getItens = () => {
    let data = {
        "area": "ESTLOJ",
        "join": [
            {
                "area": "EMPRES",
                "on": "EMPRES.CODIGO = ESTLOJ.FILIAL"
            },
            {
                "area": "PRODUT P",
                "on": "P.CODIGO = ESTLOJ.CODIGO"
            },
            {
                "area": "TABATAK T",
                "on": "T.CHAVE = EMPRES.LST_ATAK AND T.PRODUTO = P.CODATK",
                "type": "LEFT"
            }
        ],
        "fields": [
            "ESTLOJ.FILIAL",
            "EMPRES.ALIAS",
            "ESTLOJ.DATA",
            "ESTLOJ.STATUS",
            "ESTLOJ.IDENTIFICADOR",
            "SUM(ROUND(ESTLOJ.PEDIDO * T.VALUNIT, 2)) AS TOTAL"
        ],
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
            },
            {
                "field": "ESTLOJ.PEDIDO",
                "operation": "GREATER_THAN",
                "value": 0
            }
        ],
        "group_by": [
            "FILIAL",
            "DATA",
            "IDENTIFICADOR"
        ]
    }

    loading.start();

    fetch(Constants.PRODUCTION_URL + "/v1/search", {
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
                const status = clone.querySelector("#status")
                clone.querySelector("#id").innerHTML = item.IDENTIFICADOR
                clone.querySelector("#data").innerHTML = parse(item.DATA).toLocaleDateString()
                clone.querySelector("#filial").innerHTML = item.FILIAL
                clone.querySelector("#alias").innerHTML = item.ALIAS
                clone.querySelector("#total").innerHTML = item.TOTAL.toLocaleString(
                    undefined, // leave undefined to use the visitor's browser 
                    // locale or a string like 'en-US' to override it.
                    { minimumFractionDigits: 2 }
                );

                switch (item.STATUS) {
                    case "TRANSM":
                        status.classList.add("text-bg-success");
                        status.innerHTML = "Transmitido";
                        break;
                    case "FINALI":
                        status.classList.add("text-bg-primary");
                        status.innerHTML = "Finalizado";
                        break;
                    default:
                        status.classList.add("text-bg-secondary");
                        status.innerHTML = "Pendente";
                        break;
                }

                app.appendChild(clone);
            });
        } else {
            alert(json.message)
        }
    })
        .catch((error) => alert(error))
        .finally(() => loading.complete());
}

//__main()