class ClickShopCarrossel {
  constructor() {
    this.key = 'carrosselBanners';
    this.banners = [];
    this.currentIndex = 0;
    this.interval = null;
    this.inicializar();
  }

  inicializar() {
    const isPrincipalPage = window.location.pathname.includes('index.html') || 
                           window.location.pathname.endsWith('/') ||
                           window.location.pathname === '' ||
                           window.location.pathname.includes('Principal.html');
    
    if (!isPrincipalPage) return;

    this.carregarBanners();
    this.renderizarCarrossel();

    window.addEventListener('carrosselAtualizado', () => {
      this.carregarBanners();
      this.renderizarCarrossel();
    });
  }

  carregarBanners() {
    const bannersSalvos = localStorage.getItem(this.key);
    this.banners = bannersSalvos ? JSON.parse(bannersSalvos) : [];
    this.banners = this.banners.filter(banner => banner.ativo !== false);
  }

  renderizarCarrossel() {
    const container = document.getElementById('carrosselContainer');
    if (!container) return;

    if (this.banners.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#777;padding:20px;">Nenhum banner cadastrado</p>';
      return;
    }

    container.innerHTML = `
      <div class="carrossel">
        <button class="carrossel-btn carrossel-prev">&#10094;</button>
        <button class="carrossel-btn carrossel-next">&#10095;</button>
        <div class="carrossel-track">
          ${this.banners.map(banner => `
            <div class="carrossel-slide">
              <a href="${banner.link || 'javascript:void(0)'}" 
                 ${banner.link ? 'target="_blank"' : ''}
                 onclick="${!banner.link ? 'return false;' : ''}">
                <img src="${banner.imagem}" alt="${banner.titulo || 'Banner'}" 
                     onerror="this.src='https://via.placeholder.com/1200x400/FF4500/ffffff?text=ClickShop+Banner'">
                ${banner.titulo ? `<div class="carrossel-titulo">${banner.titulo}</div>` : ''}
              </a>
            </div>
          `).join('')}
        </div>
        <div class="carrossel-indicators">
          ${this.banners.map((_, index) => `
            <button class="carrossel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
          `).join('')}
        </div>
      </div>
    `;

    this.currentIndex = 0;
    this.atualizarCarrossel();

    const prevBtn = container.querySelector('.carrossel-prev');
    const nextBtn = container.querySelector('.carrossel-next');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    container.querySelectorAll('.carrossel-indicator').forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        this.goToSlide(parseInt(e.target.dataset.index));
      });
    });

    this.iniciarAutoPlay();
  }

  atualizarCarrossel() {
    const track = document.querySelector('.carrossel-track');
    const indicators = document.querySelectorAll('.carrossel-indicator');
    
    if (track && this.banners.length > 0) {
      track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }
    
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentIndex);
    });
  }

  next() {
    if (this.banners.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    this.atualizarCarrossel();
  }

  prev() {
    if (this.banners.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length;
    this.atualizarCarrossel();
  }

  goToSlide(index) {
    if (this.banners.length === 0) return;
    this.currentIndex = index;
    this.atualizarCarrossel();
  }

  iniciarAutoPlay() {
    this.pararAutoPlay();
    if (this.banners.length > 1) {
      this.interval = setInterval(() => {
        this.next();
      }, 5000);
    }
  }

  pararAutoPlay() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ClickShopCarrossel();
});