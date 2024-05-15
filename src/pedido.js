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
            "CAST(IFNULL(E.MINIMO, 0) AS DECIMAL(20, 0)) AS MINIMO",
            "CAST(IFNULL(E.SALDO, 0) AS DECIMAL(20, 0)) AS SALDO",
            "CAST(IFNULL(E.SUGESTAO, 0) AS DECIMAL(20, 0)) AS SUGESTAO",
            "CAST(IFNULL(E.PEDIDO, 0) AS DECIMAL(20, 0)) AS PEDIDO",
            "A.GRUPO",
            "get_limite_filial('" + companySelector.value + "') AS LIMITE"
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
            document.querySelector("#limite-filial").innerHTML = "Limite: " + parseFloat(json.data[0].LIMITE).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
            json.data.forEach(item => {
                let card = document.createElement('div');
                card.classList.add('card');
                card.classList.add('p-2')
                card.classList.add('mt-2')

                let row = document.createElement('div');
                row.classList.add('row');

                let col1 = document.createElement('div');
                col1.classList.add('col')
                col1.classList.add('fw-bold')
                col1.innerHTML = item.DESCRICAO;
                row.appendChild(col1);
                card.appendChild(row);

                row = document.createElement('div');
                row.classList.add('row');
                row.classList.add('sku');
                row.setAttribute('data-code', item.CODIGO);

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Minimo</label><input class="form-control minimo" type="number" placeholder="Default input" aria-label="default input example" value='${item.MINIMO}' disabled readonly></div>`);

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Contagem</label><input class="form-control saldo" type="number" placeholder="Default input" aria-label="default input example" value='${item.SALDO}' disabled readonly></div>`);

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Sugestão</label><input class="form-control sugestao" type="number" placeholder="Default input" aria-label="default input example" value='${item.SUGESTAO}' disabled readonly></div>`);

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Pedido</label><input class="form-control pedido" type="number" placeholder="Pedido" aria-label="default input example" value='${item.PEDIDO}'  pattern="[0-9]*" inputmode="numeric" min="0" step="1" onclick="this.select()"></div>`);

                card.appendChild(row);
                container.appendChild(card);
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
    const random_uuid = uuidv4();
    let currentDate = new Date().toJSON().slice(0, 10).replaceAll('-', '');
    let data = [];
    document.querySelectorAll(".sku").forEach(item => {
        data.push({
            FILIAL: companySelector.value,
            DATA: currentDate,
            CODIGO: item.getAttribute('data-code'),
            PEDIDO: item.querySelector('.pedido').value,
            MINIMO: item.querySelector('.minimo').value,
            SUGESTAO: item.querySelector('.sugestao').value,
            SALDO: item.querySelector('.saldo').value,
            STATUS: "FINALIZ",
            IDENTIFICADOR: random_uuid
        });
    })

    loading.start();

    let json = [{ area: 'ESTLOJ', data: data }, { area: 'LOGATAK', data: [{ DATA: now.date(), HORA: now.time(), RETORNO: "Aguardando Transmissão", IDENTIFICADOR: random_uuid }] }];

    fetch(Constants.PRODUCTION_URL + "/v1/template", {
        method: "PUT",
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
            console.log(json);
            if (json.success) {
                alert('Pedido salvo!')
                history.back();
            }
        })
        .catch((error) => alert(error))
        .finally(() => loading.complete());
}

sendButton.addEventListener('click', () => __save());
companySelector.addEventListener('change', () => __getItens());

__getFiliais();