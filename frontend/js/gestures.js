// =======================================================
//  SISTEMA DE GESTOS PARA ACESSIBILIDADE - TALKMENU
//  Totalmente refeito usando Hammer.js
// =======================================================

class GestureController {
  constructor() {
    this.activeCarousel = "menu"; // 'menu' ou 'order'
    this.readerMode = false; // NOVO: modo leitor controlado
    this.init();
  }

  // --------------------------------------
  init() {
    this.menuCarousel = document.getElementById("menuCarousel");
    this.orderCarousel = document.getElementById("orderCarousel");

    this.setupHammer();
    this.setupTapDetection();
    this.bindSwipeAreas();

    console.log("%cGestures inicializados com sucesso", "color: #0f0");
  }

  // =========================================================================
  // HAMMER — incluindo swipe vertical para centralizar seções
  // =========================================================================

  setupHammer() {
    this.hamm = new Hammer.Manager(document.body);
    this.hamm.set({ enable: true });

    // long press
    this.hamm.add(new Hammer.Press({ time: 600 }));
    this.hamm.on("press", () => this.toggleReaderMode());

    // swipe vertical
    this.hamm.add(
      new Hammer.Swipe({
        direction: Hammer.DIRECTION_VERTICAL,
        threshold: 8,
        velocity: 0.2,
      })
    );

    this.hamm.on("swipedown", () => this.scrollToMenu());
    this.hamm.on("swipeup", () => this.scrollToOrder());
  }

  // =========================================================================
  // TAP / MULTITAP — DETECÇÃO DE TOQUES
  // =========================================================================

setupTapDetection() {
  let tap1 = [];
  let tap2 = [];

  let tapTimeout1 = null;
  let tapTimeout2 = null;

  const TAP_DELAY = 450; // ← TEMPO PADRÃO DE ACESSIBILIDADE

  document.addEventListener("touchstart", (ev) => {
    const fingers = ev.touches.length;
    const now = Date.now();

    if (fingers === 1) {
      tap1.push(now);
      tap1 = tap1.slice(-3);
    }

    if (fingers === 2) {
      tap2.push(now);
      tap2 = tap2.slice(-2);
    }
  });

  document.addEventListener("touchend", () => {
    const now = Date.now();

    tap1 = tap1.filter(t => now - t < TAP_DELAY);
    tap2 = tap2.filter(t => now - t < TAP_DELAY);

    // =====================================================
    //  TRIPLE TAP — PRIORIDADE (450ms)
    // =====================================================

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

    // =====================================================
    //  DOUBLE TAP — CONFIRMADO APÓS 450ms SEM TERCEIRO TOQUE
    // =====================================================

    if (tap1.length === 2) {
      clearTimeout(tapTimeout1);
      tapTimeout1 = setTimeout(() => {
        if (tap1.length === 2) {
          this.actionDoubleTapOne();
        }
      }, TAP_DELAY);
      return;
    }

    // =====================================================
    //  DOUBLE TAP 2 DEDOS — ACESSIBILIDADE
    // =====================================================

    if (tap2.length === 2) {
      clearTimeout(tapTimeout2);
      tapTimeout2 = setTimeout(() => {
        if (tap2.length === 2) {
          this.actionDoubleTapTwo();
        }
      }, TAP_DELAY);
      return;
    }
  });
}

  // =========================================================================
  // SWIPE HORIZONTAL — navegação nos carrosséis
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

    this.hammMenu.on("swipe", (ev) => this.handleSwipe(ev, "menu"));
    this.hammOrder.on("swipe", (ev) => this.handleSwipe(ev, "order"));
  }

  handleSwipe(ev, target) {
    const dir = ev.deltaX > 0 ? "right" : "left";
    this.actionSwipe(dir, target);
  }

  // =========================================================================
  // AÇÕES — LONG PRESS / DOUBLE / TRIPLE TAP
  // =========================================================================

  toggleReaderMode() {
    this.readerMode = !this.readerMode;
    if (this.readerMode) {
      this.speak("Modo leitor ativado. Use gestos para navegar.");
      this.speakInstructions();
    } else {
      this.speak("Modo leitor desativado.");
    }
  }

  speakInstructions() {
    const instructions = `
      Instruções dos gestos: 
      Deslize para cima para navegar pelo pedido.
      Deslize para baixo para navegar pelo cardápio.
      Deslize para os lados para navegar entre os itens.
      Toque duplo com um dedo para adicionar item ao pedido.
      Toque triplo com um dedo para enviar o pedido.
      Toque duplo com dois dedos para remover item do pedido.
      Pressione longo para ouvir estas instruções novamente.
    `;
    this.speak(instructions);
  }

  actionDoubleTapOne() {
    if (this.readerMode) {
      this.speak("Adicionando item ao pedido.");
    }
    window.addItemFromGesture();
  }

  actionTripleTapOne() {
    if (this.readerMode) {
      this.speak("Enviando pedido.");
    }
    window.sendOrder();
  }

  actionDoubleTapTwo() {
    if (this.readerMode) {
      this.speak("Removendo item do pedido.");
    }
    window.deleteCurrentOrderItem();
  }

  // =========================================================================
  // SWIPE VERTICAL — CENTRALIZAR CARDÁPIO OU PEDIDO
  // =========================================================================

  scrollToMenu() {
    const section = this.menuCarousel.closest(".menu-carousel");
    section?.scrollIntoView({ behavior: "smooth", block: "center" });
    this.activeCarousel = "menu";
    if (this.readerMode) {
      this.speak("Cardápio centralizado.");
    }
  }

  scrollToOrder() {
    const section = this.orderCarousel.closest(".order-carousel");
    section?.scrollIntoView({ behavior: "smooth", block: "center" });
    this.activeCarousel = "order";
    if (this.readerMode) {
      this.speak("Pedido centralizado.");
    }
  }

  // =========================================================================
  // SWIPE HORIZONTAL — NAVEGAÇÃO ENTRE CARDS
  // =========================================================================

  actionSwipe(direction, targetCarousel) {
    targetCarousel = targetCarousel || this.activeCarousel;

    if (targetCarousel === "menu") {
      if (!window.menuItems.length) return;

      if (direction === "left") {
        window.currentMenuIndex =
          (window.currentMenuIndex + 1) % window.menuItems.length;
      } else {
        window.currentMenuIndex =
          (window.currentMenuIndex - 1 + window.menuItems.length) %
          window.menuItems.length;
      }

      window.updateMenuCarousel();
      
      if (this.readerMode) {
        const c = this.getCurrentCardInfo();
        if (c) this.speak(`Navegando para ${c.name}, preço ${c.price} reais.`);
      }
      return;
    }

    if (!window.orderItems.length) {
      if (this.readerMode) {
        this.speak("Nenhum item no pedido para navegar.");
      }
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

    window.requestAnimationFrame(() => {
      const track = document.getElementById("orderCarousel");
      if (track) track.offsetWidth;
      window.updateOrderCarouselNavigation();
    });

    if (this.readerMode) {
      const item = window.orderItems[window.currentOrderIndex];
      if (item) this.speak(`Navegando para pedido: ${item.name}`);
    }
  }

  // =========================================================================
  // UTILITÁRIOS
  // =========================================================================

  speak(text) {
    speechSynthesis.cancel();
    
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }

  getCurrentCardInfo() {
    const item = window.menuItems[window.currentMenuIndex];
    return item ? { name: item.name, price: item.price } : null;
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  window.gestureController = new GestureController();
});