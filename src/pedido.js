const container = document.querySelector("#grid");
const sendButton = document.querySelector('#sendButton');
const companySelector = document.querySelector("#filial");

const __getFiliais = () => {
    let data = {
        "area": "EMPRES",
        "fields": [
            "CODIGO",
            "ALIAS"
        ],
        "search": [
            {
                "field": "CODIGO",
                "operation": "GREATER_OR_EQUAL_THAN",
                "value": "0101"
            },
            {
                "field": "CODIGO",
                "operation": "LESS_OR_EQUAL_THAN",
                "value": "0299"
            }
        ]
    }

    loading.start();

    fetch(Constants.PRODUCTION_URL +  "/v1/search", {
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
        console.log(json)
        if (json.success) {
            json.data.forEach(item => {
                document.querySelector("#filial").insertAdjacentHTML('beforeend', `<option value="${item.CODIGO}">${item.ALIAS}</option>`);
            });
        } else {
            alert(json.message)
        }
    })
        .catch((error) => alert(error))
        .finally(() => loading.complete());
}

const __getItens = () => {
    let data = {
        "area": "PRODATAK A",
        "join": [
            {
                "area": "PRODUT P",
                "on": "P.CODIGO = A.PRODUTO"
            },
            {
                "area": "ESTLOJ E",
                "on": "E.DATA = DATE_FORMAT(CURDATE(), '%Y%m%d') AND E.CODIGO = P.CODIGO AND E.FILIAL = A.FILIAL",
                "type": "LEFT"
            }
        ],
        "fields": [
            "LPAD(ROW_NUMBER() OVER (ORDER BY A.ORDEM, A.GRUPO, P.DESCRICAO), 3, '0') AS ITEM",
            "P.CODIGO",
            "P.CODATK",
            "P.DESCRICAO",
            "CAST(IFNULL(E.MINIMO, 0) AS DECIMAL(20, 3)) AS MINIMO",
            "CAST(IFNULL(E.SALDO, 0) AS DECIMAL(20, 3)) AS SALDO",
            "CAST(IFNULL(E.SUGESTAO, 0) AS DECIMAL(20, 3)) AS SUGESTAO",
            "CAST(IFNULL(E.PEDIDO, 0) AS DECIMAL(20, 3)) AS PEDIDO",
            "A.GRUPO"
        ],
        "search": [
            {
                "field": "A.FILIAL",
                "operation": "EQUAL_TO",
                "value": companySelector.value
            },
            {
                "field": "P.CODATK",
                "operation": "DIFFERENT_THAN",
                "value": ""
            }
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
        container.innerHTML = '';
        if (json.success) {
            json.data.forEach(item => {
                let row = document.createElement('div');
                row.classList.add('row');

                let col1 = document.createElement('div');
                col1.classList.add('col')
                col1.classList.add('fw-bold')
                col1.innerHTML = item.DESCRICAO;
                row.appendChild(col1);
                container.appendChild(row);

                row = document.createElement('div');
                row.classList.add('row');

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Minimo</label><input class="form-control sku" type="number" placeholder="Default input" aria-label="default input example" value='${item.MINIMO}' disabled readonly></div>`);

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Contagem</label><input class="form-control sku" type="number" placeholder="Default input" aria-label="default input example" value='${item.SALDO}' disabled readonly></div>`);

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Sugestão</label><input class="form-control sku" type="number" placeholder="Default input" aria-label="default input example" value='${item.SUGESTAO}' disabled readonly></div>`);

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Pedido</label><input class="form-control sku" type="number" data-code="${item.CODIGO}" placeholder="Default input" aria-label="default input example" value='${item.PEDIDO}'></div>`);

                container.appendChild(row);
            });
        } else {
            alert(json.message)
        }
    })
        .catch((error) => alert(error))
        .finally(() => loading.complete());
}

const __save = () => {
    if (companySelector.value == '') return;

    let currentDate = new Date().toJSON().slice(0, 10).replaceAll('-', '');
    let data = [];
    document.querySelectorAll(".sku").forEach(item => {
        data.push({ DATA: currentDate, CODIGO: item.getAttribute('data-code'), SALDO: item.value, FILIAL: companySelector.value });
    })
    console.log(data);

    loading.start();

    let json = [{ area: 'ESTLOJ', data: data }];

    alert(JSON.stringify(json));

    fetch(Constants.PRODUCTION_URL + "/v1/template", {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
            "X-Client-Id": sessionStorage.getItem('x-client-id'),
            "Authorization": "Bearer " + sessionStorage.getItem('access_token'),
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            console.log(response)
            return response.json()
        })
        .then(json => {
            alert(json.message)
            console.log(json);
            if (json.success) {
                history.back();
            }
        })
        .catch((error) => alert(error))
        .finally(() => loading.complete());
}

const __main = () => {
    __getFiliais();
}

sendButton.addEventListener('click', () => __save());
companySelector.addEventListener('change', () => __getItens());

__main();