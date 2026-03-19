function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-6">Disponível em estoque: 5</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button button-shipping is-info" data-id="${book.id}"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button button-buy is-success is-fullwidth">Comprar</button>
                </div>
            </div>
        </div>`;
    return div;
}

function calculateShipping(id, cep) {
    fetch('http://localhost:3000/shipping/' + cep)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            swal('Frete', `O frete é: R$${data.value.toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const books = document.querySelector('.books');

    fetch('http://localhost:3000/products')
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    books.appendChild(newBook(book));
                });

                document.querySelectorAll('.button-shipping').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                        calculateShipping(id, cep);
                    });
                });

                document.querySelectorAll('.button-buy').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        swal('Compra de livro', 'Sua compra foi realizada com sucesso', 'success');
                    });
                });
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
});

// Função simples de busca
function filtrarLivros() {
    const termoRaw = document.getElementById('search-input').value.trim();
    const termo = termoRaw.toLowerCase();
    const booksContainer = document.querySelector('.books');

    // Se campo vazio, mostra todos
    if (!termo) {
        document.querySelectorAll('.column.is-4').forEach(card => card.style.display = 'block');
        return;
    }

    // Se for um número (id), consulta o backend /product/:id
    if (/^\d+$/.test(termoRaw)) {
        fetch('http://localhost:3000/product/' + termoRaw)
            .then((res) => {
                if (res.ok) return res.json();
                if (res.status === 404) return null;
                throw res.statusText;
            })
            .then((product) => {
                // Esconde todos antes de mostrar resultado
                document.querySelectorAll('.column.is-4').forEach(card => card.style.display = 'none');

                if (!product) {
                    swal('Busca', 'Produto não encontrado', 'warning');
                    return;
                }

                // Tenta encontrar o card já presente na página
                const existing = document.querySelector(`.book[data-id="${product.id}"]`);
                if (existing) {
                    existing.closest('.column.is-4').style.display = 'block';
                } else {
                    // Se não existe, adiciona o produto buscado (evita duplicatas futuras)
                    booksContainer.appendChild(newBook(product));
                }
            })
            .catch((err) => {
                swal('Erro', 'Erro ao consultar produto', 'error');
                console.error(err);
            });
        return;
    }

    // Busca por texto no título, autor ou id (como string)
    document.querySelectorAll('.column.is-4').forEach(card => {
        const titleEl = card.querySelector('.title');
        const authorEl = card.querySelector('.subtitle');
        const bookEl = card.querySelector('.book');
        const nomeLivro = titleEl ? titleEl.innerText.toLowerCase() : '';
        const autor = authorEl ? authorEl.innerText.toLowerCase() : '';
        const idAttr = bookEl ? (bookEl.getAttribute('data-id') || '') : '';

        if (nomeLivro.includes(termo) || autor.includes(termo) || idAttr === termoRaw) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Ativa a busca ao clicar no botão ou ao digitar
document.getElementById('search-button').addEventListener('click', filtrarLivros);

document.getElementById('search-input').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filtrarLivros();
});
