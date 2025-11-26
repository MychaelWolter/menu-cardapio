// =======================================================
//  SISTEMA DE GESTOS PARA ACESSIBILIDADE - TALKMENU
//  Totalmente refeito usando Hammer.js
//  Agora com sistema de confirmação de envio em 2 etapas
// =======================================================

class GestureController {
  constructor() {
    this.activeCarousel = "menu"; // 'menu' ou 'order'
    this.waitingConfirmSend = false;
    this.pressInProgress = false; // NOVO: Controla se já há um press em andamento
    this.isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    this.ensureGlobalVariables();
    this.init();

    // NOVO: Forçar inicialização do speech synthesis
    setTimeout(() => {
      this.speak("Sistema de gestos carregado");
    }, 1000);
  }

  // --------------------------------------
  // Garantir que as variáveis globais existam
  ensureGlobalVariables() {
    if (!window.menuItems) window.menuItems = [];
    if (!window.orderItems) window.orderItems = [];
    if (!window.currentMenuIndex) window.currentMenuIndex = 0;
    if (!window.currentOrderIndex) window.currentOrderIndex = 0;

    // Funções fallback para evitar erros
    if (!window.addItemFromGesture) {
      window.addItemFromGesture = () => {
        this.speak("Função de adicionar item não disponível ainda.");
        console.warn("addItemFromGesture não disponível");
      };
    }

    if (!window.deleteCurrentOrderItem) {
      window.deleteCurrentOrderItem = () => {
        this.speak("Função de remover item não disponível.");
        console.warn("deleteCurrentOrderItem não disponível");
      };
    }

    if (!window.sendOrder) {
      window.sendOrder = () => {
        this.speak("Função de enviar pedido não disponível.");
        console.warn("sendOrder não disponível");
      };
    }

    if (!window.updateMenuCarousel) {
      window.updateMenuCarousel = () => {
        console.warn("updateMenuCarousel não disponível");
      };
    }

    if (!window.updateOrderCarouselNavigation) {
      window.updateOrderCarouselNavigation = () => {
        console.warn("updateOrderCarouselNavigation não disponível");
      };
    }
  }

  init() {
    this.menuCarousel = document.getElementById("menuCarousel");
    this.orderCarousel = document.getElementById("orderCarousel");

    this.setupHammer();
    this.setupTapDetection();
    this.bindSwipeAreas();

    console.log("%cGestures inicializados com sucesso", "color: #0f0");
  }

  // =======================================================
  //  CANCELAR CONFIRMAÇÃO SE O USUÁRIO FIZER OUTRO GESTO
  // =======================================================
  cancelSendConfirmation() {
    if (this.waitingConfirmSend) {
      this.waitingConfirmSend = false;
      this.speak("Confirmação de envio cancelada.");
    }
  }

  // =========================================================================
  // HAMMER - VERSÃO FINAL SEM CONFLITO COM 2 DEDOS
  // =========================================================================

  setupHammer() {
    // MANAGER GLOBAL
    this.hamm = new Hammer.Manager(document.body);

    // ----------------------------
    // PRESS 1 DEDO → INSTRUÇÕES
    // ----------------------------
    const pressOneFinger = new Hammer.Press({
      time: 600,
      pointers: 1,
      threshold: 10,
    });

    // ----------------------------
    // SWIPES VERTICAIS
    // ----------------------------
    const swipeVertical = new Hammer.Swipe({
      direction: Hammer.DIRECTION_VERTICAL,
      threshold: 5,
      velocity: 0.1,
    });

    // ----------------------------
    // ADICIONA RECOGNIZERS
    // ----------------------------
    this.hamm.add([pressOneFinger, swipeVertical]);

    // IMPORTANTE: NÃO usar requireFailure — isso que travava tudo.
    pressOneFinger.recognizeWith(swipeVertical);

    // ----------------------------
    // PRESS COM 2 DEDOS → CUSTOM (PAN + TIMER) - APENAS PARA ANDROID
    // ----------------------------
    if (!this.isIOS) {
      let twoFingerTimer = null;
      let twoFingerActive = false;

      this.hamm.on("hammer.input", (ev) => {
        // Reset quando começa qualquer gesto novo
        if (ev.isFirst) {
          if (twoFingerTimer) {
            clearTimeout(twoFingerTimer);
            twoFingerTimer = null;
          }
          twoFingerActive = false;
        }

        // Detectou DOIS dedos parados → inicia timer (APENAS ANDROID)
        if (ev.pointers && ev.pointers.length === 2) {
          if (!twoFingerActive) {
            twoFingerActive = true;

            twoFingerTimer = setTimeout(() => {
              this.actionLongPressTwoFingers();
              twoFingerActive = false;
            }, 800); // mesmo tempo que você usava
          }
        }

        // Se começar a mover → cancela o press de 2 dedos
        if (ev.eventType === Hammer.INPUT_MOVE) {
          if (twoFingerActive) {
            clearTimeout(twoFingerTimer);
            twoFingerTimer = null;
            twoFingerActive = false;
          }
        }

        // Se tirar o dedo → cancela
        if (ev.isFinal) {
          if (twoFingerActive) {
            clearTimeout(twoFingerTimer);
            twoFingerTimer = null;
            twoFingerActive = false;
          }
        }
      });
    }

    // ----------------------------
    // PRESS 1 DEDO EVENTO NORMAL
    // ----------------------------
    this.hamm.on("press", (ev) => {
      if (ev.pointers.length === 1) {
        this.speakInstructions();
      }
    });

    // ----------------------------
    // SWIPES VERTICAIS
    // ----------------------------
    this.hamm.on("swipeup swipedown", (ev) => {
      this.cancelSendConfirmation();

      if (ev.type === "swipeup") {
        this.scrollToOrder();
      } else {
        this.scrollToMenu();
      }
    });
  }

  // =========================================================================
  // TAP / MULTITAP — TOQUES (COM DOUBLE TAP 2 DEDOS PARA iOS)
  // =========================================================================

  setupTapDetection() {
    let tap1 = [];
    let tap2 = []; // NOVO: Array para toques com 2 dedos
    let tapTimeout1 = null;
    let tapTimeout2 = null; // NOVO: Timeout para double tap 2 dedos

    const TAP_DELAY = 450;

    document.addEventListener("touchstart", (ev) => {
      const fingers = ev.touches.length;
      const now = Date.now();

      // TOQUES COM 1 DEDO
      if (fingers === 1) {
        tap1.push(now);
        tap1 = tap1.slice(-3); // Mantém apenas os 3 últimos toques
      }

      // NOVO: TOQUES COM 2 DEDOS - APENAS PARA iOS
      if (this.isIOS && fingers === 2) {
        tap2.push(now);
        tap2 = tap2.slice(-2); // Mantém apenas os 2 últimos toques
      }
    });

    document.addEventListener("touchend", () => {
      const now = Date.now();

      // Filtra toques recentes
      tap1 = tap1.filter((t) => now - t < TAP_DELAY);
      tap2 = tap2.filter((t) => now - t < TAP_DELAY);

      // TRIPLE TAP - ENVIAR PEDIDO
      if (tap1.length === 3) {
        clearTimeout(tapTimeout1);
        tapTimeout1 = setTimeout(() => {
          if (tap1.length === 3) {
            this.actionTripleTapOne();
            tap1 = [];
          }
        }, TAP_DELAY);
        return;
      }

      // DOUBLE TAP ONE FINGER - ADICIONAR ITEM
      if (tap1.length === 2) {
        clearTimeout(tapTimeout1);
        tapTimeout1 = setTimeout(() => {
          if (tap1.length === 2) {
            this.actionDoubleTapOne();
          }
        }, TAP_DELAY);
        return;
      }

      // NOVO: DOUBLE TAP 2 DEDOS - APENAS PARA iOS (REMOVER ITEM)
      if (this.isIOS && tap2.length === 2) {
        clearTimeout(tapTimeout2);
        tapTimeout2 = setTimeout(() => {
          if (tap2.length === 2) {
            this.actionDoubleTapTwo();
            tap2 = [];
          }
        }, TAP_DELAY);
        return;
      }
    });
  }

  // =========================================================================
  // SWIPE HORIZONTAL — navegação
  // =========================================================================

  bindSwipeAreas() {
    if (!this.menuCarousel || !this.orderCarousel) return;

    const menuContainer =
      this.menuCarousel.closest(".menu-carousel") || this.menuCarousel;

    const orderContainer =
      this.orderCarousel.closest(".order-carousel") || this.orderCarousel;

    menuContainer.style.touchAction = "pan-y";
    orderContainer.style.touchAction = "pan-y";

    this.hammMenu = new Hammer(menuContainer);
    this.hammOrder = new Hammer(orderContainer);

    const config = {
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 6,
      velocity: 0.2,
    };

    this.hammMenu.get("swipe").set(config);
    this.hammOrder.get("swipe").set(config);

    this.hammMenu.on("swipe", (ev) => {
      this.cancelSendConfirmation();
      this.handleSwipe(ev, "menu");
    });

    this.hammOrder.on("swipe", (ev) => {
      this.cancelSendConfirmation();
      this.handleSwipe(ev, "order");
    });
  }

  handleSwipe(ev, target) {
    const dir = ev.deltaX > 0 ? "right" : "left";
    this.actionSwipe(dir, target);
  }

  // =========================================================================
  // AÇÕES — LONG PRESS / DOUBLE / TRIPLE TAP
  // =========================================================================

  speakInstructions() {
    let text = `
    Gestos disponíveis. 
    Deslize para cima para ir ao pedido. 
    Deslize para baixo para voltar ao cardápio. 
    Deslize para os lados para navegar entre os itens. 
    Toque triplo com um dedo para enviar o pedido em duas etapas.

    Se o cardápio estiver selecionado:
    Toque duplo com um dedo para adicionar uma unidade do item em destaque.

    Se o pedido estiver selecionado:
    Toque duplo com um dedo para remover o item em destaque.
    `;

    // INSTRUÇÃO DIFERENTE POR PLATAFORMA
    if (this.isIOS) {
      text += "Toque duplo com dois dedos para remover item.";
    } else {
      text += "Pressione com dois dedos por um segundo para remover item.";
    }

    this.speak(text);
  }

  // ============================================================
  //      DOUBLE TAP 1 DEDO → ADICIONAR ITEM
  // ============================================================

  actionDoubleTapOne() {
    this.cancelSendConfirmation();
    this.speak("Adicionando item..."); // SEMPRE FALA

    // VERIFICAÇÃO DE SEGURANÇA
    if (typeof window.addItemFromGesture === "function") {
      window.addItemFromGesture();
    } else {
      this.speak("Função não disponível no momento.");
      console.error("addItemFromGesture não é uma função");
    }
  }

  // ============================================================
  //      LONG PRESS 2 DEDOS → REMOVER ITEM (ANDROID)
  // ============================================================

  actionLongPressTwoFingers() {
    this.cancelSendConfirmation();

    // VERIFICAÇÃO DE SEGURANÇA - Só permite remover se há itens
    if (!window.orderItems || window.orderItems.length === 0) {
      this.speak("Não há itens para remover.");
      return;
    }

    this.speak("Removendo item..."); // SEMPRE FALA

    if (typeof window.deleteCurrentOrderItem === "function") {
      window.deleteCurrentOrderItem();
    } else {
      this.speak("Função de remover não disponível.");
      console.error("deleteCurrentOrderItem não é uma função");
    }
  }

  // ============================================================
  //      DOUBLE TAP 1 DEDO → ADICIONAR OU REMOVER DEPENDENDO DO CARROSSEL
  // ============================================================

  actionDoubleTapOne() {
    this.cancelSendConfirmation();

    // Se estiver no CARDÁPIO → ADICIONAR item
    if (this.activeCarousel === "menu") {
      this.speak("Adicionando item...");

      if (typeof window.addItemFromGesture === "function") {
        window.addItemFromGesture();
      } else {
        this.speak("Função de adicionar não disponível.");
        console.error("addItemFromGesture não é uma função");
      }

      return;
    }

    // Se estiver no PEDIDO → REMOVER item
    if (this.activeCarousel === "order") {
      if (!window.orderItems || window.orderItems.length === 0) {
        this.speak("Não há itens no pedido para remover.");
        return;
      }

      this.speak("Removendo item...");

      if (typeof window.deleteCurrentOrderItem === "function") {
        window.deleteCurrentOrderItem();
      } else {
        this.speak("Função de remover não disponível.");
        console.error("deleteCurrentOrderItem não é uma função");
      }

      return;
    }
  }

  // ============================================================
  //      TRIPLE TAP 1 DEDO → ENVIAR (AGORA EM 2 ETAPAS)
  // ============================================================

  actionTripleTapOne() {
    // VERIFICAÇÃO DE SEGURANÇA
    if (!window.orderItems) {
      this.speak("Sistema de pedidos não carregado.");
      return;
    }

    // PRIMEIRO TOQUE → LER O PEDIDO
    if (!this.waitingConfirmSend) {
      if (window.orderItems.length === 0) {
        this.speak("Não há itens no pedido.");
        return;
      }

      this.waitingConfirmSend = true;

      // leitura com ordem correta:
      // item → quantidade → subtotal → preço final
      let summary = "Confirme o pedido. ";

      window.orderItems.forEach((item) => {
        const subtotal = item.quantity * item.price;
        summary += `${item.name}, ${
          item.quantity
        } unidades, subtotal ${subtotal.toFixed(2)} reais. `;
      });

      const total = window.orderItems.reduce(
        (s, i) => s + i.quantity * i.price,
        0
      );

      summary += `Total final ${total.toFixed(2)} reais. `;
      summary += "Toque triplo novamente para enviar.";

      this.speak(summary);
      return;
    }

    // SEGUNDO TOQUE → ENVIAR DEFINITIVAMENTE
    this.waitingConfirmSend = false;

    this.speak("Pedido enviado.");

    if (typeof window.sendOrder === "function") {
      window.sendOrder();
    } else {
      this.speak("Erro: função de enviar não disponível.");
      console.error("sendOrder não é uma função");
    }
  }

  // =========================================================================
  // SWIPE VERTICAL — CENTRALIZAR
  // =========================================================================

  scrollToMenu() {
    const section = this.menuCarousel.closest(".menu-carousel");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
      this.activeCarousel = "menu";
    }
    this.speak("Cardápio selecionado."); // SEMPRE FALA
  }

  scrollToOrder() {
    const section = this.orderCarousel.closest(".order-carousel");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
      this.activeCarousel = "order";
    }
    this.speak("Pedido selecionado."); // SEMPRE FALA
  }

  // =========================================================================
  // SWIPE HORIZONTAL
  // =========================================================================

  actionSwipe(direction, targetCarousel) {
    targetCarousel = targetCarousel || this.activeCarousel;

    // VERIFICAÇÕES DE SEGURANÇA
    if (!window.menuItems) window.menuItems = [];
    if (!window.orderItems) window.orderItems = [];

    // --- MENU ---
    if (targetCarousel === "menu") {
      if (window.menuItems.length === 0) {
        this.speak("Cardápio vazio.");
        return;
      }

      if (direction === "left") {
        window.currentMenuIndex =
          (window.currentMenuIndex + 1) % window.menuItems.length;
      } else {
        window.currentMenuIndex =
          (window.currentMenuIndex - 1 + window.menuItems.length) %
          window.menuItems.length;
      }

      // VERIFICAÇÃO DE SEGURANÇA
      if (typeof window.updateMenuCarousel === "function") {
        window.updateMenuCarousel();
      }

      const item = window.menuItems[window.currentMenuIndex];
      if (item) {
        this.speak(`${item.name}, preço ${item.price.toFixed(2)} reais.`); // SEMPRE FALA
      }
      return;
    }

    // --- ORDER ---
    if (window.orderItems.length === 0) {
      this.speak("Nenhum item no pedido.");
      return;
    }

    if (direction === "left") {
      window.currentOrderIndex =
        (window.currentOrderIndex + 1) % window.orderItems.length;
    } else {
      window.currentOrderIndex =
        (window.currentOrderIndex - 1 + window.orderItems.length) %
        window.orderItems.length;
    }

    // VERIFICAÇÃO DE SEGURANÇA
    if (typeof window.updateOrderCarouselNavigation === "function") {
      window.requestAnimationFrame(() => {
        window.updateOrderCarouselNavigation();
      });
    }

    const item = window.orderItems[window.currentOrderIndex];
    if (item) {
      this.speak(`Pedido: ${item.name}`); // SEMPRE FALA
    }
  }

  // =========================================================================
  // UTILITÁRIOS
  // =========================================================================

  speak(text) {
    if (!text) return;

    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }
}

// =======================================
// DESBLOQUEAR ÁUDIO VIA BOTÃO
// =======================================
function unlockAudio() {
  const u = new SpeechSynthesisUtterance("Aúdio ativado.");
  u.lang = "pt-BR";
  speechSynthesis.speak(u);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("unlockAudioBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      unlockAudio();

      // Feedback para o usuário
      btn.textContent = "🔊";
      btn.disabled = true;
    });
  }
});

// -----------------------------------------------------------
// INICIALIZAÇÃO
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  window.gestureController = new GestureController();
});
