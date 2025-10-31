class ClickShopAdmin {
  constructor() {
    this.key = 'produtosAfiliados';
    this.keyCarrossel = 'carrosselBanners';
    this.keyCampanhas = 'campanhasSazonais';
    this.produtos = JSON.parse(localStorage.getItem(this.key)) || [];
    this.banners = JSON.parse(localStorage.getItem(this.keyCarrossel)) || [];
    this.campanhas = JSON.parse(localStorage.getItem(this.keyCampanhas)) || [];
    this.inicializar();
  }

  inicializar() {
    if (sessionStorage.getItem('clickshop_auth') !== 'true') return;

    this.form = document.getElementById('formProduto');
    this.lista = document.getElementById('listaProdutosPainel');
    this.formCarrossel = document.getElementById('formCarrossel');
    this.listaCarrossel = document.getElementById('listaCarrosselPainel');
    this.formCampanha = document.getElementById('formCampanha');
    this.listaCampanhas = document.getElementById('listaCampanhasPainel');

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.adicionarProduto();
      });
    }

    if (this.formCarrossel) {
      this.formCarrossel.addEventListener('submit', (e) => {
        e.preventDefault();
        this.adicionarBanner();
      });
    }

    if (this.formCampanha) {
      this.formCampanha.addEventListener('submit', (e) => {
        e.preventDefault();
        this.adicionarCampanha();
      });
    }

    this.carregarProdutosPainel();
    this.carregarCarrosselPainel();
    this.carregarCampanhasPainel();
    
    // Sincronizar entre abas
    window.addEventListener('storage', () => {
      this.produtos = JSON.parse(localStorage.getItem(this.key)) || [];
      this.banners = JSON.parse(localStorage.getItem(this.keyCarrossel)) || [];
      this.campanhas = JSON.parse(localStorage.getItem(this.keyCampanhas)) || [];
      this.carregarProdutosPainel();
      this.carregarCarrosselPainel();
      this.carregarCampanhasPainel();
    });

    window.addEventListener('produtosAtualizados', () => {
      this.produtos = JSON.parse(localStorage.getItem(this.key)) || [];
      this.carregarProdutosPainel();
    });

    window.addEventListener('carrosselAtualizado', () => {
      this.banners = JSON.parse(localStorage.getItem(this.keyCarrossel)) || [];
      this.carregarCarrosselPainel();
    });

    window.addEventListener('campanhasAtualizadas', () => {
      this.campanhas = JSON.parse(localStorage.getItem(this.keyCampanhas)) || [];
      this.carregarCampanhasPainel();
    });
  }

  adicionarProduto() {
    const novo = {
      id: Date.now().toString(),
      nome: document.getElementById('nomeProduto').value.trim(),
      descricao: document.getElementById('descricaoProduto').value.trim(),
      precoOriginal: document.getElementById('precoOriginal').value.trim(),
      precoPromocional: document.getElementById('precoPromocional').value.trim(),
      linkAfiliado: document.getElementById('linkAfiliado').value.trim(),
      imagem: document.getElementById('imagemProduto').value.trim(),
      categoria: document.getElementById('categoriaProduto').value || 'outros',
      badgePromocao: document.getElementById('badgePromocao').value.trim(),
      badgeFrete: document.getElementById('badgeFrete').value.trim(),
      dataCriacao: new Date().toISOString()
    };

    if (!novo.nome || !novo.linkAfiliado || !novo.categoria) {
      alert('Preencha os campos obrigatórios: Nome, Link Afiliado e Categoria.');
      return;
    }

    this.produtos.unshift(novo);
    localStorage.setItem(this.key, JSON.stringify(this.produtos));

    this.form.reset();
    this.carregarProdutosPainel();
    
    // Disparar eventos para sincronização
    window.dispatchEvent(new Event('produtosAtualizados'));
    window.dispatchEvent(new Event('storage'));
    
    alert('✅ Produto adicionado com sucesso!');
  }

  adicionarBanner() {
    const novoBanner = {
      id: Date.now().toString(),
      imagem: document.getElementById('imagemBanner').value.trim(),
      link: document.getElementById('linkBanner').value.trim(),
      titulo: document.getElementById('tituloBanner').value.trim(),
      ativo: document.getElementById('ativoBanner').checked,
      dataCriacao: new Date().toISOString()
    };

    if (!novoBanner.imagem) {
      alert('Preencha a URL da imagem do banner.');
      return;
    }

    this.banners.unshift(novoBanner);
    localStorage.setItem(this.keyCarrossel, JSON.stringify(this.banners));

    this.formCarrossel.reset();
    this.carregarCarrosselPainel();
    
    // Disparar eventos para sincronização
    window.dispatchEvent(new Event('carrosselAtualizado'));
    window.dispatchEvent(new Event('storage'));
    
    alert('✅ Banner adicionado com sucesso!');
  }

  adicionarCampanha() {
    const novaCampanha = {
      id: Date.now().toString(),
      nome: document.getElementById('nomeCampanha').value.trim(),
      descricao: document.getElementById('descricaoCampanha').value.trim(),
      imagem: document.getElementById('imagemCampanha').value.trim(),
      link: document.getElementById('linkCampanha').value.trim(),
      dataInicio: document.getElementById('dataInicioCampanha').value,
      dataFim: document.getElementById('dataFimCampanha').value,
      tema: document.getElementById('temaCampanha').value,
      corPersonalizada: document.getElementById('corPersonalizada').value,
      ativo: document.getElementById('ativoCampanha').checked,
      dataCriacao: new Date().toISOString()
    };

    if (!novaCampanha.nome || !novaCampanha.imagem || !novaCampanha.dataInicio || !novaCampanha.dataFim) {
      alert('Preencha os campos obrigatórios: Nome, Imagem, Data de Início e Data de Término.');
      return;
    }

    this.campanhas.unshift(novaCampanha);
    localStorage.setItem(this.keyCampanhas, JSON.stringify(this.campanhas));

    this.formCampanha.reset();
    this.carregarCampanhasPainel();
    
    // Disparar eventos para sincronização
    window.dispatchEvent(new Event('campanhasAtualizadas'));
    window.dispatchEvent(new Event('storage'));
    
    alert('✅ Campanha criada com sucesso!');
  }

  carregarProdutosPainel() {
    if (!this.lista) return;
    
    this.lista.innerHTML = '';
    const produtos = JSON.parse(localStorage.getItem(this.key)) || [];

    if (produtos.length === 0) {
      this.lista.innerHTML = '<p style="text-align:center;color:#777;">Nenhum produto cadastrado.</p>';
      return;
    }

    produtos.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'produto-card';
      card.innerHTML = `
        <img src="${p.imagem || 'image/sem-imagem.png'}" alt="${p.nome}">
        <h3>${p.nome}</h3>
        <div class="preco-container">
          ${p.precoPromocional ? `
            <span class="preco-original-riscado">${p.precoOriginal}</span>
            <span class="preco-promocional">${p.precoPromocional}</span>
          ` : `<span class="preco-normal">${p.precoOriginal}</span>`}
        </div>
        <p><strong>Categoria:</strong> ${p.categoria}</p>
        ${p.badgePromocao ? `<span class="badge">${p.badgePromocao}</span>` : ''}
        ${p.badgeFrete ? `<span class="badge-frete">${p.badgeFrete}</span>` : ''}
        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
          <button class="btn-editar" onclick="editarProduto('${p.id}')">✏️ Editar</button>
          <button class="btn-excluir" onclick="removerProduto('${p.id}')">🗑️ Excluir</button>
        </div>
      `;
      this.lista.appendChild(card);
    });
  }

  carregarCarrosselPainel() {
    if (!this.listaCarrossel) return;
    
    this.listaCarrossel.innerHTML = '';
    const banners = JSON.parse(localStorage.getItem(this.keyCarrossel)) || [];

    if (banners.length === 0) {
      this.listaCarrossel.innerHTML = '<p style="text-align:center;color:#777;">Nenhum banner no carrossel.</p>';
      return;
    }

    banners.forEach((b) => {
      const card = document.createElement('div');
      card.className = 'produto-card';
      card.innerHTML = `
        <img src="${b.imagem}" alt="${b.titulo || 'Banner'}" style="height: 150px; object-fit: cover;">
        <h3>${b.titulo || 'Sem título'}</h3>
        <p><strong>Link:</strong> ${b.link || 'Nenhum'}</p>
        <p><strong>Status:</strong> ${b.ativo ? '✅ Ativo' : '❌ Inativo'}</p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
          <button class="btn-editar" onclick="editarBanner('${b.id}')">✏️ Editar</button>
          <button class="btn-excluir" onclick="removerBanner('${b.id}')">🗑️ Excluir</button>
        </div>
      `;
      this.listaCarrossel.appendChild(card);
    });
  }

  carregarCampanhasPainel() {
    if (!this.listaCampanhas) return;
    
    this.listaCampanhas.innerHTML = '';
    const campanhas = JSON.parse(localStorage.getItem(this.keyCampanhas)) || [];

    if (campanhas.length === 0) {
      this.listaCampanhas.innerHTML = '<p style="text-align:center;color:#777;">Nenhuma campanha cadastrada.</p>';
      return;
    }

    campanhas.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'produto-card';
      card.innerHTML = `
        <h3>${this.getEmojiTema(c.tema)} ${c.nome}</h3>
        <p><strong>Descrição:</strong> ${c.descricao || 'Nenhuma'}</p>
        <p><strong>Período:</strong> ${new Date(c.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(c.dataFim).toLocaleDateString('pt-BR')}</p>
        <p><strong>Tema:</strong> ${this.getNomeTema(c.tema)}</p>
        <p><strong>Status:</strong> ${c.ativo ? '✅ Ativa' : '❌ Inativa'}</p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
          <button class="btn-editar" onclick="editarCampanha('${c.id}')">✏️ Editar</button>
          <button class="btn-excluir" onclick="removerCampanha('${c.id}')">🗑️ Excluir</button>
        </div>
      `;
      this.listaCampanhas.appendChild(card);
    });
  }

  getEmojiTema(tema) {
    const emojis = {
      'natal': '🎄',
      'verao': '☀️',
      'primavera': '🌺',
      'outono': '🍁',
      'blackfriday': '🖤',
      'cybermonday': '💻',
      'personalizado': '🎨'
    };
    return emojis[tema] || '🎯';
  }

  getNomeTema(tema) {
    const nomes = {
      'natal': 'Natal',
      'verao': 'Verão',
      'primavera': 'Primavera',
      'outono': 'Outono',
      'blackfriday': 'Black Friday',
      'cybermonday': 'Cyber Monday',
      'personalizado': 'Personalizado'
    };
    return nomes[tema] || 'Personalizado';
  }
}

window.voltarCoresPadrao = function() {
  document.documentElement.style.setProperty('--cor-primaria', '#FF4500');
  document.documentElement.style.setProperty('--cor-secundaria', '#FF6347');
  document.documentElement.style.setProperty('--cor-destaque', '#FFFFFF');
  
  document.body.classList.remove('theme-natal', 'theme-verao', 'theme-primavera', 
                                'theme-outono', 'theme-blackfriday', 'theme-cybermonday');
  
  window.dispatchEvent(new Event('coresPadraoAtivadas'));
  window.dispatchEvent(new Event('storage'));
  alert('🎨 Cores padrão ativadas! O site voltou ao tema laranja avermelhado e branco.');
};

window.removerProduto = function (id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  
  const key = 'produtosAfiliados';
  const produtos = JSON.parse(localStorage.getItem(key)) || [];
  const idx = produtos.findIndex(x => x.id === id);
  
  if (idx !== -1) {
    produtos.splice(idx, 1);
    localStorage.setItem(key, JSON.stringify(produtos));
    window.dispatchEvent(new Event('produtosAtualizados'));
    window.dispatchEvent(new Event('storage'));
    alert('✅ Produto excluído com sucesso!');
  }
};

window.editarProduto = function (id) {
  const key = 'produtosAfiliados';
  const produtos = JSON.parse(localStorage.getItem(key)) || [];
  const p = produtos.find(x => x.id === id);
  
  if (!p) return alert('Produto não encontrado.');

  document.getElementById('nomeProduto').value = p.nome || '';
  document.getElementById('descricaoProduto').value = p.descricao || '';
  document.getElementById('precoOriginal').value = p.precoOriginal || '';
  document.getElementById('precoPromocional').value = p.precoPromocional || '';
  document.getElementById('linkAfiliado').value = p.linkAfiliado || '';
  document.getElementById('imagemProduto').value = p.imagem || '';
  document.getElementById('categoriaProduto').value = p.categoria || 'outros';
  document.getElementById('badgePromocao').value = p.badgePromocao || '';
  document.getElementById('badgeFrete').value = p.badgeFrete || '';

  const idx = produtos.findIndex(x => x.id === id);
  if (idx !== -1) produtos.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(produtos));
  window.dispatchEvent(new Event('produtosAtualizados'));
  window.dispatchEvent(new Event('storage'));
  alert('✏️ Modifique os dados do produto e clique em "Adicionar Produto" para salvar as alterações.');
};

window.removerBanner = function (id) {
  if (!confirm('Tem certeza que deseja excluir este banner?')) return;
  
  const key = 'carrosselBanners';
  const banners = JSON.parse(localStorage.getItem(key)) || [];
  const idx = banners.findIndex(x => x.id === id);
  
  if (idx !== -1) {
    banners.splice(idx, 1);
    localStorage.setItem(key, JSON.stringify(banners));
    window.dispatchEvent(new Event('carrosselAtualizado'));
    window.dispatchEvent(new Event('storage'));
    alert('✅ Banner excluído com sucesso!');
  }
};

window.editarBanner = function (id) {
  const key = 'carrosselBanners';
  const banners = JSON.parse(localStorage.getItem(key)) || [];
  const b = banners.find(x => x.id === id);
  
  if (!b) return alert('Banner não encontrado.');

  document.getElementById('imagemBanner').value = b.imagem || '';
  document.getElementById('linkBanner').value = b.link || '';
  document.getElementById('tituloBanner').value = b.titulo || '';
  document.getElementById('ativoBanner').checked = b.ativo !== false;

  const idx = banners.findIndex(x => x.id === id);
  if (idx !== -1) banners.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(banners));
  window.dispatchEvent(new Event('carrosselAtualizado'));
  window.dispatchEvent(new Event('storage'));
  alert('✏️ Modifique os dados do banner e clique em "Adicionar Banner" para salvar as alterações.');
};

window.removerCampanha = function (id) {
  if (!confirm('Tem certeza que deseja excluir esta campanha?')) return;
  
  const key = 'campanhasSazonais';
  const campanhas = JSON.parse(localStorage.getItem(key)) || [];
  const idx = campanhas.findIndex(x => x.id === id);
  
  if (idx !== -1) {
    campanhas.splice(idx, 1);
    localStorage.setItem(key, JSON.stringify(campanhas));
    window.dispatchEvent(new Event('campanhasAtualizadas'));
    window.dispatchEvent(new Event('storage'));
    alert('✅ Campanha excluída com sucesso!');
  }
};

window.editarCampanha = function (id) {
  const key = 'campanhasSazonais';
  const campanhas = JSON.parse(localStorage.getItem(key)) || [];
  const c = campanhas.find(x => x.id === id);
  
  if (!c) return alert('Campanha não encontrada.');

  document.getElementById('nomeCampanha').value = c.nome || '';
  document.getElementById('descricaoCampanha').value = c.descricao || '';
  document.getElementById('imagemCampanha').value = c.imagem || '';
  document.getElementById('linkCampanha').value = c.link || '';
  document.getElementById('dataInicioCampanha').value = c.dataInicio || '';
  document.getElementById('dataFimCampanha').value = c.dataFim || '';
  document.getElementById('temaCampanha').value = c.tema || 'personalizado';
  document.getElementById('corPersonalizada').value = c.corPersonalizada || '#FF4500';
  document.getElementById('ativoCampanha').checked = c.ativo !== false;

  const idx = campanhas.findIndex(x => x.id === id);
  if (idx !== -1) campanhas.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(campanhas));
  window.dispatchEvent(new Event('campanhasAtualizadas'));
  window.dispatchEvent(new Event('storage'));
  alert('✏️ Modifique os dados da campanha e clique em "Criar Campanha" para salvar as alterações.');
};

document.addEventListener('DOMContentLoaded', () => {
  new ClickShopAdmin();
});