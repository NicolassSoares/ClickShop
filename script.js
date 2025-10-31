
// script.js - ATUALIZADO com sincronização entre dispositivos
class ClickShopProdutos {
  constructor() {
    this.key = 'produtosAfiliados';
    this.produtosAfiliados = JSON.parse(localStorage.getItem(this.key)) || [];
    this.inicializar();
  }

  inicializar() {
    this.carregarProdutos();
    this.configurarBusca();
    this.rastrearEventos();

    // Sincronizar entre abas/dispositivos
    window.addEventListener('storage', () => {
      this.produtosAfiliados = JSON.parse(localStorage.getItem(this.key)) || [];
      this.carregarProdutos();
    });

    window.addEventListener('produtosAtualizados', () => {
      this.produtosAfiliados = JSON.parse(localStorage.getItem(this.key)) || [];
      this.carregarProdutos();
    });

    const params = new URLSearchParams(window.location.search);
    const cat = params.get('categoria');
    if (cat) setTimeout(() => this.filtrarPorCategoria(cat), 200);
  }

  carregarProdutos() {
    // Página principal
    const container = document.getElementById('listaProdutos');
    if (container) {
      this.carregarProdutosGenerico(container, this.produtosAfiliados);
    }

    // Página de ofertas
    const containerOfertas = document.getElementById('listaOfertas');
    if (containerOfertas) {
      const ofertas = this.produtosAfiliados.filter(p => 
        p.badgePromocao || p.precoPromocional || p.categoria === 'ofertas'
      );
      this.carregarProdutosGenerico(containerOfertas, ofertas);
    }

    // Página de livros
    const containerLivros = document.getElementById('listaLivros');
    if (containerLivros) {
      const livros = this.produtosAfiliados.filter(p => p.categoria === 'livros');
      this.carregarProdutosGenerico(containerLivros, livros);
    }
  }

  carregarProdutosGenerico(container, produtos) {
    if (!container) return;
    container.innerHTML = '';

    if (!produtos.length) {
      container.innerHTML = '<p style="text-align:center;color:#777;">Nenhum produto disponível.</p>';
      return;
    }

    produtos.forEach(p => {
      const card = document.createElement('div');
      card.className = 'produto-card';
      card.setAttribute('data-nome', (p.nome || '').toLowerCase());
      card.setAttribute('data-descricao', (p.descricao || '').toLowerCase());
      card.setAttribute('data-categoria', (p.categoria || '').toLowerCase());

      card.innerHTML = `
        <img src="${p.imagem || 'image/sem-imagem.png'}" alt="${p.nome}" 
             onerror="this.src='https://via.placeholder.com/300x300/FF4500/ffffff?text=Produto+Sem+Imagem'">
        <h3>${p.nome}</h3>
        <div class="preco-container">
          ${p.precoPromocional ? `
            <span class="preco-original-riscado">${p.precoOriginal}</span>
            <span class="preco-promocional">${p.precoPromocional}</span>
          ` : `<span class="preco-normal">${p.precoOriginal}</span>`}
        </div>
        ${p.badgePromocao ? `<span class="badge">${p.badgePromocao}</span>` : ''}
        ${p.badgeFrete ? `<span class="badge-frete">${p.badgeFrete}</span>` : ''}
        <p class="categoria">Categoria: ${this.formatarCategoria(p.categoria)}</p>
        <button class="btn-saiba-mais" onclick="abrirModalProduto('${p.id}')">📖 Saiba Mais</button>
        <button class="btn-comprar" onclick="window.open('${p.linkAfiliado}', '_blank'); registrarClique('${p.id}')">🛒 Comprar</button>
      `;
      container.appendChild(card);
    });
  }

  configurarBusca() {
    const campo = document.getElementById('campoBusca');
    if (!campo) return;
    campo.addEventListener('input', () => {
      const termo = campo.value.toLowerCase();
      this.filtrarProdutos(termo);
    });
  }

  filtrarProdutos(termo) {
    const cards = document.querySelectorAll('.produto-card');
    cards.forEach(card => {
      const nome = card.getAttribute('data-nome') || '';
      const desc = card.getAttribute('data-descricao') || '';
      const cat = card.getAttribute('data-categoria') || '';
      if (!termo) {
        card.style.display = 'inline-block';
        return;
      }
      const ok = nome.includes(termo) || desc.includes(termo) || cat.includes(termo);
      card.style.display = ok ? 'inline-block' : 'none';
    });
  }

  filtrarPorCategoria(categoria) {
    const cards = document.querySelectorAll('.produto-card');
    cards.forEach(card => {
      const cat = card.getAttribute('data-categoria') || '';
      card.style.display = cat === (categoria || '').toLowerCase() ? 'inline-block' : 'none';
    });
  }

  rastrearEventos() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-comprar')) {
        const nome = e.target.closest('.produto-card')?.querySelector('h3')?.textContent;
        if (nome) this.registrarClique(nome);
      }
    });
  }

  registrarClique(nome) {
    const key = 'analyticsAfiliados';
    const analytics = JSON.parse(localStorage.getItem(key)) || [];
    analytics.push({ produto: nome, tipo: 'clique', data: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(analytics));
  }

  formatarCategoria(cat) {
    const map = {
      'moda-masculina': 'Moda Masculina',
      'moda-feminina': 'Moda Feminina',
      'celulares-acessorios': 'Celulares & Acessórios',
      'informatica': 'Informática',
      'eletronicos': 'Eletrônicos',
      'beleza': 'Beleza & Cuidados',
      'calcados': 'Calçados',
      'brinquedos-bebes': 'Brinquedos & Bebês',
      'esporte-lazer': 'Esporte & Lazer',
      'casa-decoracao': 'Casa & Decoração',
      'livros': 'Livros & Papelaria',
      'ofertas': 'Ofertas',
      'outros': 'Outros'
    };
    return map[cat] || cat;
  }
}

function abrirModalProduto(idProduto) {
  const produtos = JSON.parse(localStorage.getItem('produtosAfiliados')) || [];
  const produto = produtos.find(p => p.id == idProduto);
  
  if (produto) {
    alert(`Detalhes do Produto:\n\nNome: ${produto.nome}\n\nPreço Original: ${produto.precoOriginal}\n${produto.precoPromocional ? `Preço Promocional: ${produto.precoPromocional}\n` : ''}${produto.descricao ? `Descrição: ${produto.descricao}\n` : ''}\nCategoria: ${formatarCategoria(produto.categoria)}`);
  }
}

function formatarCategoria(cat) {
  const map = {
    'moda-masculina': 'Moda Masculina',
    'moda-feminina': 'Moda Feminina',
    'celulares-acessorios': 'Celulares & Acessórios',
    'informatica': 'Informática',
    'eletronicos': 'Eletrônicos',
    'beleza': 'Beleza & Cuidados',
    'calcados': 'Calçados',
    'brinquedos-bebes': 'Brinquedos & Bebês',
    'esporte-lazer': 'Esporte & Lazer',
    'casa-decoracao': 'Casa & Decoração',
    'livros': 'Livros & Papelaria',
    'ofertas': 'Ofertas',
    'outros': 'Outros'
  };
  return map[cat] || cat;
}

function registrarClique(idProduto) {
  const produtos = JSON.parse(localStorage.getItem('produtosAfiliados')) || [];
  const produto = produtos.find(p => p.id == idProduto);
  
  if (produto) {
    const key = 'analyticsAfiliados';
    const analytics = JSON.parse(localStorage.getItem(key)) || [];
    analytics.push({ 
      produto: produto.nome, 
      tipo: 'clique', 
      data: new Date().toISOString(),
      id: idProduto
    });
    localStorage.setItem(key, JSON.stringify(analytics));
  }
}

// Funções para carregar produtos específicos em páginas específicas
function carregarProdutosOfertas() {
  const container = document.getElementById('listaOfertas');
  if (!container) return;
  
  const produtos = JSON.parse(localStorage.getItem('produtosAfiliados')) || [];
  const ofertas = produtos.filter(p => p.badgePromocao || p.precoPromocional || p.categoria === 'ofertas');
  
  if (ofertas.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#777;">Nenhuma oferta disponível no momento.</p>';
    return;
  }
  
  container.innerHTML = '';
  ofertas.forEach(p => {
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.innerHTML = `
      <img src="${p.imagem || 'image/sem-imagem.png'}" alt="${p.nome}" 
           onerror="this.src='https://via.placeholder.com/300x300/FF4500/ffffff?text=Produto+Sem+Imagem'">
      <h3>${p.nome}</h3>
      <div class="preco-container">
        ${p.precoPromocional ? `
          <span class="preco-original-riscado">${p.precoOriginal}</span>
          <span class="preco-promocional">${p.precoPromocional}</span>
        ` : `<span class="preco-normal">${p.precoOriginal}</span>`}
      </div>
      ${p.badgePromocao ? `<span class="badge">${p.badgePromocao}</span>` : ''}
      ${p.badgeFrete ? `<span class="badge-frete">${p.badgeFrete}</span>` : ''}
      <p class="categoria">Categoria: ${formatarCategoria(p.categoria)}</p>
      <button class="btn-saiba-mais" onclick="abrirModalProduto('${p.id}')">📖 Saiba Mais</button>
      <button class="btn-comprar" onclick="window.open('${p.linkAfiliado}', '_blank'); registrarClique('${p.id}')">🛒 Comprar</button>
    `;
    container.appendChild(card);
  });
}

function carregarProdutosLivros() {
  const container = document.getElementById('listaLivros');
  if (!container) return;
  
  const produtos = JSON.parse(localStorage.getItem('produtosAfiliados')) || [];
  const livros = produtos.filter(p => p.categoria === 'livros');
  
  if (livros.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#777;">Nenhum livro disponível no momento.</p>';
    return;
  }
  
  container.innerHTML = '';
  livros.forEach(p => {
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.innerHTML = `
      <img src="${p.imagem || 'image/sem-imagem.png'}" alt="${p.nome}" 
           onerror="this.src='https://via.placeholder.com/300x300/FF4500/ffffff?text=Produto+Sem+Imagem'">
      <h3>${p.nome}</h3>
      <div class="preco-container">
        ${p.precoPromocional ? `
          <span class="preco-original-riscado">${p.precoOriginal}</span>
          <span class="preco-promocional">${p.precoPromocional}</span>
        ` : `<span class="preco-normal">${p.precoOriginal}</span>`}
      </div>
      ${p.badgePromocao ? `<span class="badge">${p.badgePromocao}</span>` : ''}
      ${p.badgeFrete ? `<span class="badge-frete">${p.badgeFrete}</span>` : ''}
      <p class="categoria">Categoria: ${formatarCategoria(p.categoria)}</p>
      <button class="btn-saiba-mais" onclick="abrirModalProduto('${p.id}')">📖 Saiba Mais</button>
      <button class="btn-comprar" onclick="window.open('${p.linkAfiliado}', '_blank'); registrarClique('${p.id}')">🛒 Comprar</button>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.clickShop = new ClickShopProdutos();
  
  // Carregar produtos específicos baseado na página atual
  if (window.location.pathname.includes('ofertas.html')) {
    carregarProdutosOfertas();
  } else if (window.location.pathname.includes('livros.html')) {
    carregarProdutosLivros();
  }
  
  // Atualizar quando produtos forem modificados
  window.addEventListener('produtosAtualizados', () => {
    if (window.location.pathname.includes('ofertas.html')) {
      carregarProdutosOfertas();
    } else if (window.location.pathname.includes('livros.html')) {
      carregarProdutosLivros();
    }
  });
  
  // Sincronizar entre abas
  window.addEventListener('storage', () => {
    if (window.location.pathname.includes('ofertas.html')) {
      carregarProdutosOfertas();
    } else if (window.location.pathname.includes('livros.html')) {
      carregarProdutosLivros();
    }
  });
});