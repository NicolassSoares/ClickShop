function atualizarCategoriasMenu() {
  const menuCategorias = document.getElementById('menuCategorias');
  if (!menuCategorias) return;

  const produtos = JSON.parse(localStorage.getItem('produtosAfiliados')) || [];
  const categoriasPadrao = {
    'moda-masculina': '🧢 Moda Masculina',
    'moda-feminina': '👗 Moda Feminina',
    'celulares-acessorios': '📱 Celulares & Acessórios',
    'informatica': '💻 Informática',
    'eletronicos': '🖥️ Eletrônicos',
    'beleza': '💄 Beleza & Cuidados',
    'calcados': '👟 Calçados',
    'brinquedos-bebes': '🧸 Brinquedos & Bebês',
    'esporte-lazer': '🧳 Esporte & Lazer',
    'casa-decoracao': '🏠 Casa & Decoração',
    'livros': '📚 Livros & Papelaria',
    'ofertas': '🔥 Ofertas',
    'outros': '📦 Outros'
  };

  const presentes = new Set((produtos || []).map(p => p.categoria || 'outros'));
  menuCategorias.innerHTML = '';

  Object.keys(categoriasPadrao).forEach(catKey => {
    if (presentes.size === 0 || presentes.has(catKey)) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="index.html?categoria=${catKey}">${categoriasPadrao[catKey]}</a>`;
      menuCategorias.appendChild(li);
    }
  });

  if ((produtos || []).length === 0) {
    menuCategorias.innerHTML = '';
    Object.keys(categoriasPadrao).forEach(catKey => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="index.html?categoria=${catKey}">${categoriasPadrao[catKey]}</a>`;
      menuCategorias.appendChild(li);
    });
  }
}

function atualizarTituloCategoria(categoria) {
  const titulo = document.getElementById('tituloProdutos');
  if (!titulo) return;

  const categoriasMap = {
    'moda-masculina': '🧢 Moda Masculina',
    'moda-feminina': '👗 Moda Feminina',
    'celulares-acessorios': '📱 Celulares & Acessórios',
    'informatica': '💻 Informática',
    'eletronicos': '🖥️ Eletrônicos',
    'beleza': '💄 Beleza & Cuidados',
    'calcados': '👟 Calçados',
    'brinquedos-bebes': '🧸 Brinquedos & Bebês',
    'esporte-lazer': '🧳 Esporte & Lazer',
    'casa-decoracao': '🏠 Casa & Decoração',
    'livros': '📚 Livros & Papelaria',
    'ofertas': '🔥 Ofertas',
    'outros': '📦 Outros'
  };

  titulo.textContent = categoriasMap[categoria] || '🛒 Todos os Produtos';
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarCategoriasMenu();
  window.addEventListener('produtosAtualizados', atualizarCategoriasMenu);

  const url = new URL(window.location.href);
  const cat = url.searchParams.get('categoria');
  
  if (cat) {
    atualizarTituloCategoria(cat);
    setTimeout(() => {
      if (window.clickShop && typeof window.clickShop.filtrarPorCategoria === 'function') {
        window.clickShop.filtrarPorCategoria(cat);
      }
    }, 250);
  }
});