// Função para carregar a home page
async function carregarHome() {
    const container = document.querySelector('.recipes');
    if (!container) return;

    try {
        const response = await fetch('http://localhost:3000/receitas');
        const receitas = await response.json();

        container.innerHTML = receitas.map(receita => `
            <article class="recipe-card">
                <img src="${receita.imagem}" alt="${receita.titulo}">
                <div class="recipe-content">
                    <h2>${receita.titulo}</h2>
                    <p class="category">${receita.categoria}</p>
                    <div class="recipe-details">
                        <h3>Ingredientes:</h3>
                        <ul>${receita.ingredientes.map(ing => `<li>${ing}</li>`).join('')}</ul>
                        <a href="detalhes.html?id=${receita.id}" class="btn-detalhes">Ver receita completa</a>
                    </div>
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar receitas:', error);
        container.innerHTML = '<p>Erro ao carregar receitas.</p>';
    }
}

// Função para carregar a página de detalhes
async function carregarDetalhes() {
    const container = document.querySelector('.recipe-detail');
    if (!container) return;

    const id = new URLSearchParams(window.location.search).get('id');
    try {
        const response = await fetch(`http://localhost:3000/receitas/${id}`);
        const receita = await response.json();

        if (!receita) {
            container.innerHTML = '<p>Receita não encontrada.</p>';
            return;
        }

        container.innerHTML = `
            <div class="detail-header">
                <h1>${receita.titulo}</h1>
                <p class="category">${receita.categoria}</p>
                <p class="meta-info">Tempo de preparo: ${receita.tempoPreparo} | Dificuldade: ${receita.dificuldade}</p>
            </div>
            <div class="detail-content">
                <img src="${receita.imagem}" alt="${receita.titulo}">
                <p>${receita.descricao}</p>
                <h2>Ingredientes</h2>
                <ul>${receita.ingredientes.map(ing => `<li>${ing}</li>`).join('')}</ul>
                <h2>Modo de Preparo</h2>
                <p>${receita.preparo}</p>
                <a href="index.html" class="btn-voltar">Voltar</a>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        container.innerHTML = '<p>Erro ao carregar detalhes da receita.</p>';
    }
}

// Função para criar o carrossel
async function criarCarrossel() {
    const carrosselInner = document.querySelector('.carrossel-grande-inner');
    const btnPrev = document.querySelector('.carrossel-grande-prev');
    const btnNext = document.querySelector('.carrossel-grande-next');

    try {
        const response = await fetch('http://localhost:3000/receitas?_limit=3');
        const receitasDestaque = await response.json();

        carrosselInner.innerHTML = '';

        receitasDestaque.forEach(receita => {
            const item = document.createElement('div');
            item.className = 'carrossel-grande-item';
            item.innerHTML = `
                <div class="carrossel-img-container">
                    <img src="${receita.imagem}" alt="${receita.titulo}">
                </div>
                <div class="carrossel-title-container">
                    <h3>${receita.titulo}</h3>
                </div>
            `;
            carrosselInner.appendChild(item);
        });

        let slideAtual = 0;
        const totalSlides = receitasDestaque.length;

        function atualizarCarrossel() {
            carrosselInner.style.transform = `translateX(-${slideAtual * 100}%)`;
        }

        btnPrev.addEventListener('click', () => {
            slideAtual = (slideAtual > 0) ? slideAtual - 1 : totalSlides - 1;
            atualizarCarrossel();
        });

        btnNext.addEventListener('click', () => {
            slideAtual = (slideAtual < totalSlides - 1) ? slideAtual + 1 : 0;
            atualizarCarrossel();
        });

        let intervaloCarrossel = setInterval(() => {
            slideAtual = (slideAtual < totalSlides - 1) ? slideAtual + 1 : 0;
            atualizarCarrossel();
        }, 5000);

        carrosselInner.addEventListener('mouseenter', () => {
            clearInterval(intervaloCarrossel);
        });

        carrosselInner.addEventListener('mouseleave', () => {
            intervaloCarrossel = setInterval(() => {
                slideAtual = (slideAtual < totalSlides - 1) ? slideAtual + 1 : 0;
                atualizarCarrossel();
            }, 5000);
        });

        atualizarCarrossel();
    } catch (error) {
        console.error('Erro ao carregar carrossel:', error);
        carrosselInner.innerHTML = '<p>Erro ao carregar carrossel.</p>';
    }
}

// Função para filtrar receitas por categoria
async function filtrarPorCategoria(categoria) {
    const container = document.querySelector('.recipes');
    if (!container) return;

    try {
        let url = 'http://localhost:3000/receitas';
        if (categoria !== 'Todas') {
            url += `?categoria=${encodeURIComponent(categoria)}`;
        }
        const response = await fetch(url);
        const receitasFiltradas = await response.json();

        container.innerHTML = receitasFiltradas.map(receita => `
            <article class="recipe-card">
                <img src="${receita.imagem}" alt="${receita.titulo}">
                <div class="recipe-content">
                    <h2>${receita.titulo}</h2>
                    <p class="category">${receita.categoria}</p>
                    <div class="recipe-details">
                        <h3>Ingredientes:</h3>
                        <ul>${receita.ingredientes.map(ing => `<li>${ing}</li>`).join('')}</ul>
                        <a href="detalhes.html?id=${receita.id}" class="btn-detalhes">Ver receita completa</a>
                    </div>
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Erro ao filtrar receitas:', error);
        container.innerHTML = '<p>Erro ao filtrar receitas.</p>';
    }
}

// Função para configurar os botões de categoria
function configurarBotoesCategoria() {
    const botoes = document.querySelectorAll('.category-btn');
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            botoes.forEach(btn => btn.classList.remove('active'));
            botao.classList.add('active');
            filtrarPorCategoria(botao.textContent);
        });
    });
}

// Função para implementar a busca
async function configurarBusca() {
    const campoBusca = document.getElementById('search');
    if (!campoBusca) return;

    campoBusca.addEventListener('input', async (e) => {
        const termo = e.target.value.toLowerCase();
        const container = document.querySelector('.recipes');
        if (!container) return;

        try {
            const response = await fetch('http://localhost:3000/receitas');
            const receitas = await response.json();

            const receitasFiltradas = receitas.filter(receita =>
                receita.titulo.toLowerCase().includes(termo) ||
                receita.descricao.toLowerCase().includes(termo) ||
                receita.ingredientes.some(ing => ing.toLowerCase().includes(termo))
            );

            container.innerHTML = receitasFiltradas.map(receita => `
                <article class="recipe-card">
                    <img src="${receita.imagem}" alt="${receita.titulo}">
                    <div class="recipe-content">
                        <h2>${receita.titulo}</h2>
                        <p class="category">${receita.categoria}</p>
                        <div class="recipe-details">
                            <h3>Ingredientes:</h3>
                            <ul>${receita.ingredientes.map(ing => `<li>${ing}</li>`).join('')}</ul>
                            <a href="detalhes.html?id=${receita.id}" class="btn-detalhes">Ver receita completa</a>
                        </div>
                    </div>
                </article>
            `).join('');
        } catch (error) {
            console.error('Erro ao buscar receitas:', error);
            container.innerHTML = '<p>Erro ao buscar receitas.</p>';
        }
    });
}

// Inicializa a página correta
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.recipes')) {
        carregarHome();
        criarCarrossel();
        configurarBotoesCategoria();
        configurarBusca();
    }
    if (document.querySelector('.recipe-detail')) {
        carregarDetalhes();
    }
});