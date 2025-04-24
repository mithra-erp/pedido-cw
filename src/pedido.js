var identificador = null;

const container = document.querySelector("#grid");
const sendButton = document.querySelector('#sendButton');
const companySelector = document.querySelector("#filial");

const __getFiliais = () => {
    let data = {
        "area": "EMPRES",
        "fields": [
            "CODIGO",
            "ALIAS",
            "LST_ATAK",
            "get_limite_filial(CODIGO) AS LIMITE"
        ],
        "search": [
            {
                "field": "CODATK",
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
        console.log(json)
        if (json.success) {
            json.data.forEach(item => {
                document.querySelector("#filial").insertAdjacentHTML('beforeend', `<option value="${item.CODIGO}" data-lista="${item.LST_ATAK}" data-limite="${item.LIMITE}">${item.ALIAS}</option>`);
            });
        } else {
            alert(json.message)
        }
    })
        .catch((error) => alert(error))
        .finally(() => loading.complete());
}

const __getItens = () => {
    const lista = companySelector.options[companySelector.selectedIndex].getAttribute('data-lista');
    const limiteFilial = companySelector.options[companySelector.selectedIndex].getAttribute('data-limite');
    console.log(limiteFilial)
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
            },
            {
                "area": "TABATAK T",
                "on": "T.CHAVE = " + lista + " AND T.PRODUTO = P.CODATK",
                "type": "LEFT"
            },
            {
                "area": "SENHAS S",
                "on": "E.USUINC > '' AND E.USUINC LIKE CONCAT(S.USUARIO, '%')",
                "type": "LEFT"
            }
        ],
        "fields": [
            "E.IDENTIFICADOR",
            "LPAD(ROW_NUMBER() OVER (ORDER BY A.ORDEM, A.GRUPO, P.DESCRICAO), 3, '0') AS ITEM",
            "P.CODIGO",
            "P.CODATK",
            "P.QTCAIXA",
            "IFNULL(IF(T.PRODUTO IN ('4032','3517'), 10, T.VALUNIT), 0) AS VALUNIT",
            "P.DESCRICAO",
            "CAST(IFNULL(E.MINIMO, 0) AS DECIMAL(20, 0)) AS MINIMO",
            "CAST(IFNULL(E.SALDO, 0) AS DECIMAL(20, 0)) AS SALDO",
            "CAST(IFNULL(E.SUGESTAO, 0) AS DECIMAL(20, 0)) AS SUGESTAO",
            "CAST(IFNULL(E.PEDIDO, 0) AS DECIMAL(20, 0)) AS PEDIDO",
            "A.GRUPO",
            "IFNULL(NULLIF(E.DATAINC, ''), RIGHT(E.USUINC, 8)) AS DATAINC",
            "E.HORAINC",
            "S.USUARIO AS USUINC",
            "S.NOME",
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
            },
            {
                "field": "P.PREFIXO",
                "operation": "EQUAL_TO",
                "value": "94"
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
        return response.json()
    }).then(json => {
        console.log(json)
        container.innerHTML = '';
        if (json.success) {
            document.querySelector("#limite-filial").innerHTML = "Limite: " + parseFloat(limiteFilial).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });

            let ctrlog = json.data.filter(item => item.USUINC > '')[0];

            if (ctrlog !== undefined) {
                console.log(ctrlog)
                if (ctrlog.DATAINC == '' && ctrlog.USUINC.substr(-8).isDate()) {
                    console.log(ctrlog.DATAINC)
                    ctrlog.DATAINC = ctrlog.USUINC.substr(-8).toDate();
                    ctrlog.USUINC = ctrlog.USUINC.substr(0, ctrlog.USUINC.length - 8);
                } else if (ctrlog.DATAINC != '') {
                    ctrlog.DATAINC = ctrlog.DATAINC.toDate() + ' ' + ctrlog.HORAINC;
                }

                document.querySelector("#usuario-estoque").innerHTML = 'Estoque por: ' + ctrlog.NOME.toUpperCase();
                document.querySelector("#data-estoque").innerHTML = 'Registrado em: ' + ctrlog.DATAINC;
            }

            identificador = json.data[0].IDENTIFICADOR;

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

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Pedido</label><input class="form-control pedido" type="number" placeholder="Pedido" aria-label="default input example" value='${item.PEDIDO}'  pattern="[0-9]*" inputmode="numeric" min="0" step="1" onclick="this.select()" onchange="updateBill()" data-qtcaixa='${item.QTCAIXA}' data-valunit='${item.VALUNIT}'></div>`);

                card.appendChild(row);
                container.appendChild(card);
            });
            sendButton.classList.remove('d-none');
        } else {
            alert(json.message)
        }
    }).catch((error) => {
        console.log(error)
        alert(error)
    })
        .finally(() => {
            updateBill();
            loading.complete();
        });
}

const __getPedido = (id) => {

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
            },
            {
                "area": "EMPRES",
                "on": "EMPRES.CODIGO = E.FILIAL",
                "type": "LEFT"
            },
            {
                "area": "TABATAK T",
                "on": "T.CHAVE = EMPRES.LST_ATAK AND T.PRODUTO = P.CODATK",
                "type": "LEFT"
            }
        ],
        "fields": [
            "EMPRES.CODIGO",
            "EMPRES.ALIAS",
            "E.IDENTIFICADOR",
            "LPAD(ROW_NUMBER() OVER (ORDER BY A.ORDEM, A.GRUPO, P.DESCRICAO), 3, '0') AS ITEM",
            "P.CODIGO",
            "P.CODATK",
            "P.QTCAIXA",
            "IFNULL(IF(T.PRODUTO IN ('4032','3517'), 10, T.VALUNIT), 0) AS VALUNIT",
            "P.DESCRICAO",
            "CAST(IFNULL(E.MINIMO, 0) AS DECIMAL(20, 0)) AS MINIMO",
            "CAST(IFNULL(E.SALDO, 0) AS DECIMAL(20, 0)) AS SALDO",
            "CAST(IFNULL(E.SUGESTAO, 0) AS DECIMAL(20, 0)) AS SUGESTAO",
            "CAST(IFNULL(E.PEDIDO, 0) AS DECIMAL(20, 0)) AS PEDIDO",
            "A.GRUPO",
            "get_limite_filial(E.FILIAL) AS LIMITE"
        ],
        "search": [
            {
                "field": "E.IDENTIFICADOR",
                "operation": "EQUAL_TO",
                "value": id
            },
            {
                "field": "E.PEDIDO",
                "operation": "GREATER_THAN",
                "value": 0
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
            companySelector.insertAdjacentHTML('beforeend', `<option value="${json.data[0].CODIGO}">${json.data[0].ALIAS}</option>`);
            companySelector.selectedIndex = 1;
            companySelector.setAttribute('disabled', true);
            document.querySelector("#limite-filial").innerHTML = "Limite: " + parseFloat(json.data[0].LIMITE).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });

            identificador = json.data[0].IDENTIFICADOR;

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

                row.insertAdjacentHTML('beforeend', `<div class='col'><label>Pedido</label><input class="form-control pedido" type="number" placeholder="Pedido" aria-label="default input example" value='${item.PEDIDO}'  pattern="[0-9]*" inputmode="numeric" min="0" step="1" disabled readonly data-qtcaixa='${item.QTCAIXA}' data-valunit='${item.VALUNIT}'></div>`);

                card.appendChild(row);
                container.appendChild(card);
            });

        } else {
            alert(json.message)
            history.back();
        }
    }).catch((error) => alert(error))
        .finally(() => {
            updateBill();
            loading.complete();
        });
}

const __save = () => {
    if (companySelector.value == '') return;

    if (identificador == null || identificador == '') {
        identificador = uuidv4();
    }

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
            STATUS: "FINALI",
            IDENTIFICADOR: identificador
        });
    })

    loading.start();

    let json = [{ area: 'ESTLOJ', data: data }, { area: 'LOGATAK', data: [{ DATA: now.date(), HORA: now.time(), RETORNO: "Aguardando Transmissão", IDENTIFICADOR: identificador }] }];

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
            } else {
                alert(json.message);
            }
        })
        .catch((error) => alert(error))
        .finally(() => loading.complete());
}


const updateBill = () => {
    var totalRS = 0;
    var totalKG = 0;
    var totalCX = 0;
    const items = document.querySelectorAll(".pedido");
    for (const item of items) {
        const fator = item.getAttribute('data-qtcaixa') || "0";
        const valunit = item.getAttribute('data-valunit') || "0";

        totalCX += parseFloat(item.value);
        totalKG += item.value * parseFloat(fator);
        totalRS += item.value * parseFloat(fator) * parseFloat(valunit);
    }

    document.querySelector("#total-caixa").innerHTML = 'Total CX: ' + totalCX.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    document.querySelector("#total-quilo").innerHTML = 'Total KG: ' + totalKG.toLocaleString('pt-BR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    });
    document.querySelector("#total-pedido").innerHTML = 'Total R$: ' + totalRS.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

sendButton.addEventListener('click', () => {
    confirmation.show('Salvar pedido?', 'Confirmação', () => {
        __save();
    });
});
companySelector.addEventListener('change', () => __getItens());

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
console.log(params);
if (params !== null && params.id !== undefined && params.id !== null) {
    console.log('id', params.id);
    __getPedido(params.id);
} else {
    __getFiliais();
}

