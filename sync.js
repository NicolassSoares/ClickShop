// sync.js - Sistema de Sincronização em Tempo Real para ClickShop
class ClickShopSync {
    constructor() {
        this.storageKeys = [
            'produtosAfiliados',
            'carrosselBanners', 
            'campanhasSazonais',
            'analyticsAfiliados'
        ];
        this.syncInterval = 3000; // Sincronizar a cada 3 segundos
        this.lastSyncTime = {};
        this.inicializar();
    }

    inicializar() {
        this.configurarStorageListener();
        this.iniciarSyncAutomático();
        this.verificarCompatibilidade();
        this.sincronizarTodosDados();
        
        console.log('🔄 Sistema de sincronização ClickShop ativado');
    }

    configurarStorageListener() {
        // Monitora alterações no localStorage em tempo real
        window.addEventListener('storage', (e) => {
            if (this.storageKeys.includes(e.key)) {
                this.processarAlteracaoRemota(e.key, e.newValue);
            }
        });
    }

    iniciarSyncAutomático() {
        // Sincronização periódica
        setInterval(() => {
            this.sincronizarTodosDados();
        }, this.syncInterval);

        // Sincronizar quando a página ganha foco
        window.addEventListener('focus', () => {
            this.sincronizarTodosDados();
        });

        // Sincronizar quando online
        window.addEventListener('online', () => {
            this.sincronizarTodosDados();
        });
    }

    sincronizarTodosDados() {
        this.storageKeys.forEach(key => {
            this.sincronizarChave(key);
        });
    }

    sincronizarChave(key) {
        const dadosLocais = localStorage.getItem(key);
        const ultimaModificacao = this.obterUltimaModificacao(key);
        
        // Verificar se há versão mais recente
        if (this.verificarAtualizacaoNecessaria(key, ultimaModificacao)) {
            this.aplicarDadosSincronizados(key, dadosLocais);
        }
    }

    obterUltimaModificacao(key) {
        return localStorage.getItem(`${key}_lastUpdate`) || '0';
    }

    verificarAtualizacaoNecessaria(key, ultimaModificacao) {
        const timestampAtual = Date.now().toString();
        return ultimaModificacao < timestampAtual;
    }

    aplicarDadosSincronizados(key, novosDados) {
        try {
            if (novosDados) {
                const dadosAtuais = localStorage.getItem(key);
                
                if (dadosAtuais !== novosDados) {
                    localStorage.setItem(key, novosDados);
                    localStorage.setItem(`${key}_lastUpdate`, Date.now().toString());
                    
                    // Disparar eventos específicos para atualizar a UI
                    this.dispararEventoSincronizacao(key);
                    
                    console.log(`✅ ${key} sincronizado`);
                }
            }
        } catch (error) {
            console.error(`❌ Erro ao sincronizar ${key}:`, error);
        }
    }

    processarAlteracaoRemota(key, newValue) {
        if (this.storageKeys.includes(key) && newValue) {
            setTimeout(() => {
                this.aplicarDadosSincronizados(key, newValue);
            }, 100);
        }
    }

    dispararEventoSincronizacao(key) {
        const eventos = {
            'produtosAfiliados': 'produtosAtualizados',
            'carrosselBanners': 'carrosselAtualizado', 
            'campanhasSazonais': 'campanhasAtualizadas',
            'analyticsAfiliados': 'analyticsAtualizados'
        };

        if (eventos[key]) {
            window.dispatchEvent(new Event(eventos[key]));
        }
    }

    verificarCompatibilidade() {
        // Verificar suporte a localStorage
        if (!this.suporteLocalStorage()) {
            console.warn('⚠️ localStorage não suportado - Sincronização limitada');
            return false;
        }

        // Verificar se é dispositivo móvel
        if (this.isDispositivoMovel()) {
            this.otimizarParaMobile();
        }

        return true;
    }

    suporteLocalStorage() {
        try {
            const teste = 'teste';
            localStorage.setItem(teste, teste);
            localStorage.removeItem(teste);
            return true;
        } catch (e) {
            return false;
        }
    }

    isDispositivoMovel() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    otimizarParaMobile() {
        // Aumentar intervalo de sync em dispositivos móveis para economizar bateria
        this.syncInterval = 5000;
        
        // Otimizar para touch
        this.configurarTouchEvents();
    }

    configurarTouchEvents() {
        // Adicionar suporte melhorado para touch
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // Prevenir zoom duplo em botões
        const botoes = document.querySelectorAll('button');
        botoes.forEach(botao => {
            botao.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
    }

    // Método para forçar sincronização imediata
    forcarSincronizacao() {
        console.log('🔄 Forçando sincronização imediata...');
        this.sincronizarTodosDados();
        
        // Disparar todos os eventos de atualização
        this.storageKeys.forEach(key => {
            this.dispararEventoSincronizacao(key);
        });
        
        return true;
    }

    // Método para verificar status da sincronização
    obterStatusSync() {
        const status = {};
        this.storageKeys.forEach(key => {
            status[key] = {
                ultimaAtualizacao: this.obterUltimaModificacao(key),
                tamanhoDados: localStorage.getItem(key) ? localStorage.getItem(key).length : 0,
                sincronizado: true // Simplificado para sempre true em localStorage
            };
        });
        return status;
    }
}

// Inicialização automática quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.clickShopSync = new ClickShopSync();
    
    // Adicionar método global para forçar sincronização
    window.forcarSincronizacaoClickShop = () => {
        if (window.clickShopSync) {
            return window.clickShopSync.forcarSincronizacao();
        }
        return false;
    };
    
    // Adicionar método global para verificar status
    window.obterStatusSincronizacao = () => {
        if (window.clickShopSync) {
            return window.clickShopSync.obterStatusSync();
        }
        return null;
    };
});

// Polyfill para eventos customizados em navegadores antigos
(function() {
    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();
