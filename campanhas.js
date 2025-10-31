class ClickShopCampanhas {
  constructor() {
    this.key = 'campanhasSazonais';
    this.campanhas = [];
    this.inicializar();
  }

  inicializar() {
    this.carregarCampanhas();
    this.renderizarBannerCampanha();

    // Ouvir eventos de atualização
    window.addEventListener('storage', () => {
      this.carregarCampanhas();
      this.renderizarBannerCampanha();
    });
    
    window.addEventListener('campanhasAtualizadas', () => {
      this.carregarCampanhas();
      this.renderizarBannerCampanha();
    });

    window.addEventListener('coresPadraoAtivadas', () => {
      this.aplicarCoresPadrao();
    });
  }

  carregarCampanhas() {
    const campanhasSalvas = localStorage.getItem(this.key);
    this.campanhas = campanhasSalvas ? JSON.parse(campanhasSalvas) : [];
    this.campanhas = this.campanhas.filter(campanha => campanha.ativo !== false);
  }

  renderizarBannerCampanha() {
    const container = document.getElementById('bannerCampanha');
    if (!container) return;

    const campanhaAtiva = this.encontrarCampanhaAtiva();
    
    if (!campanhaAtiva) {
      container.innerHTML = '';
      this.aplicarCoresPadrao();
      return;
    }

    container.innerHTML = `
      <div class="banner-campanha" style="${this.gerarEstilosCampanha(campanhaAtiva)}">
        <h2>${campanhaAtiva.nome}</h2>
        ${campanhaAtiva.descricao ? `<p>${campanhaAtiva.descricao}</p>` : ''}
        ${campanhaAtiva.link ? `<a href="${campanhaAtiva.link}" target="_blank">Ver Ofertas</a>` : ''}
      </div>
    `;

    this.aplicarTemaCampanha(campanhaAtiva);
  }

  encontrarCampanhaAtiva() {
    const agora = new Date();
    return this.campanhas.find(campanha => {
      const inicio = new Date(campanha.dataInicio);
      const fim = new Date(campanha.dataFim);
      return agora >= inicio && agora <= fim;
    });
  }

  gerarEstilosCampanha(campanha) {
    const temas = {
      'natal': 'background: linear-gradient(135deg, #d50000, #388e3c);',
      'verao': 'background: linear-gradient(135deg, #1976d2, #ffeb3b);',
      'primavera': 'background: linear-gradient(135deg, #e91e63, #4caf50);',
      'outono': 'background: linear-gradient(135deg, #ff9800, #795548);',
      'blackfriday': 'background: linear-gradient(135deg, #000000, #ff4500);',
      'cybermonday': 'background: linear-gradient(135deg, #0d47a1, #00bcd4);',
      'personalizado': `background: ${campanha.corPersonalizada || '#FF4500'};`
    };
    return temas[campanha.tema] || temas['personalizado'];
  }

  aplicarTemaCampanha(campanha) {
    const root = document.documentElement;
    const temas = {
      'natal': { primaria: '#d50000', secundaria: '#388e3c', destaque: '#ffffff' },
      'verao': { primaria: '#1976d2', secundaria: '#ffeb3b', destaque: '#000000' },
      'primavera': { primaria: '#e91e63', secundaria: '#4caf50', destaque: '#ffffff' },
      'outono': { primaria: '#ff9800', secundaria: '#795548', destaque: '#ffffff' },
      'blackfriday': { primaria: '#000000', secundaria: '#ff4500', destaque: '#ffffff' },
      'cybermonday': { primaria: '#0d47a1', secundaria: '#00bcd4', destaque: '#ffffff' },
      'personalizado': { 
        primaria: campanha.corPersonalizada || '#FF4500', 
        secundaria: this.clarificarCor(campanha.corPersonalizada || '#FF4500'),
        destaque: '#ffffff'
      }
    };

    const tema = temas[campanha.tema] || temas['personalizado'];
    
    root.style.setProperty('--cor-primaria', tema.primaria);
    root.style.setProperty('--cor-secundaria', tema.secundaria);
    root.style.setProperty('--cor-destaque', tema.destaque);

    document.body.classList.add(`theme-${campanha.tema}`);
  }

  aplicarCoresPadrao() {
    const root = document.documentElement;
    root.style.setProperty('--cor-primaria', '#FF4500');
    root.style.setProperty('--cor-secundaria', '#FF6347');
    root.style.setProperty('--cor-destaque', '#FFFFFF');

    document.body.classList.remove('theme-natal', 'theme-verao', 'theme-primavera', 
                                  'theme-outono', 'theme-blackfriday', 'theme-cybermonday');
  }

  clarificarCor(cor) {
    const hex = cor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const novoR = Math.min(255, r + 40);
    const novoG = Math.min(255, g + 40);
    const novoB = Math.min(255, b + 40);
    
    return `#${novoR.toString(16).padStart(2, '0')}${novoG.toString(16).padStart(2, '0')}${novoB.toString(16).padStart(2, '0')}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ClickShopCampanhas();
});