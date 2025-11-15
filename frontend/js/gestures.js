// =======================================================
//  SISTEMA DE GESTOS PARA ACESSIBILIDADE - TALKMENU
//  Totalmente refeito usando Hammer.js
//  Sem conflitos de double/triple tap
//  Alternância global entre carrosséis com scroll automático
// =======================================================

class GestureController {
  constructor() {
    this.activeCarousel = "menu"; // 'menu' ou 'order'

    // evita conflitos entre double/triple tap
    this.blockDoubleTap1 = false;
    this.blockDoubleTap2 = false;

    this.init();
  }

  // --------------------------------------
  // Inicialização
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
  // CONFIGURAÇÃO GERAL DO HAMMER
  // =========================================================================

  setupHammer() {
    this.hamm = new Hammer.Manager(document.body);
    this.hamm.set({ enable: true });
    this.hamm.add(new Hammer.Press({ time: 600 }));

    this.hamm.on("press", () => this.actionLongPress());
  }

  // =========================================================================
  // DETECÇÃO PERSONALIZADA DE TAP / MULTI-TAP
  // =========================================================================

  setupTapDetection() {
    let tapTimes = [];
    let touchPoints = 0;

    let doubleTapTimeout1 = null;
    let doubleTapTimeout2 = null;

    document.addEventListener("touchstart", (ev) => {
      touchPoints = ev.touches.length;

      tapTimes.push(Date.now());
      tapTimes = tapTimes.slice(-3); // mantém últimos 3 taps
    });

    document.addEventListener("touchend", () => {
      const now = Date.now();
      tapTimes = tapTimes.filter((t) => now - t < 350);

      // -----------------------------------------------
      //        1 DEDO — Double e Triple Tap
      // -----------------------------------------------
      if (touchPoints === 1) {
        if (tapTimes.length === 2) {
          this.blockDoubleTap1 = false;
          clearTimeout(doubleTapTimeout1);

          doubleTapTimeout1 = setTimeout(() => {
            if (!this.blockDoubleTap1) {
              this.actionDoubleTapOne();
            }
          }, 380);
        }

        if (tapTimes.length === 3) {
          this.blockDoubleTap1 = true;
          clearTimeout(doubleTapTimeout1);
          this.actionTripleTapOne();
          tapTimes = [];
        }
      }

      // -----------------------------------------------
      //        2 DEDOS — Double e Triple Tap
      // -----------------------------------------------
      if (touchPoints === 2) {
        if (tapTimes.length === 2) {
          this.blockDoubleTap2 = false;
          clearTimeout(doubleTapTimeout2);

          doubleTapTimeout2 = setTimeout(() => {
            if (!this.blockDoubleTap2) {
              this.actionDoubleTapTwo();
            }
          }, 380);
        }

        if (tapTimes.length === 3) {
          this.blockDoubleTap2 = true;
          clearTimeout(doubleTapTimeout2);

          this.actionTripleTapTwo();
          tapTimes = [];
        }
      }

      touchPoints = 0;
    });
  }

  // =========================================================================
  // SWIPE → CARDÁPIO E PEDIDO
  // =========================================================================

  bindSwipeAreas() {
    if (!this.menuCarousel || !this.orderCarousel) {
      console.warn("Carrosséis não encontrados.");
      return;
    }

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
  // AÇÕES — LONG PRESS / TAPS / TRIPLE TAP
  // =========================================================================

  actionLongPress() {
    this.speak("Modo leitor ativado.");

    const c = this.getCurrentCardInfo();
    if (c) this.speak(`Item ${c.name}, preço ${c.price} reais.`);
  }

  actionDoubleTapOne() {
    window.addItemFromGesture();
  }

  actionTripleTapOne() {
    window.sendOrder();
    this.speak("Pedido enviado.");
  }

  actionDoubleTapTwo() {
    window.deleteCurrentOrderItem();
  }

  // =========================================================================
  // TRIPLE TAP 2 DEDOS — ALTERNAR CARROSSEL COM SCROLL GLOBAL
  // =========================================================================

  actionTripleTapTwo() {
    const menuSection = this.menuCarousel.closest(".menu-carousel");
    const orderSection = this.orderCarousel.closest(".order-carousel");

    if (this.activeCarousel === "menu") {
      this.activeCarousel = "order";
      this.speak("Carrossel do pedido ativado.");

      orderSection?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      this.activeCarousel = "menu";
      this.speak("Carrossel do cardápio ativado.");

      menuSection?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  // =========================================================================
  // SWIPE — NAVEGAÇÃO DOS DOIS CARROSSEIS
  // =========================================================================

  actionSwipe(direction, targetCarousel) {
    targetCarousel = targetCarousel || this.activeCarousel;

    // -------------------------
    // CARDÁPIO
    // -------------------------
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
      return;
    }

    // -------------------------
    // PEDIDO
    // -------------------------
    if (!window.orderItems.length) {
      this.speak("Nenhum item no pedido para navegar.");
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
      if (track) track.offsetWidth; // força animação
      window.updateOrderCarouselNavigation();
    });

    const item = window.orderItems[window.currentOrderIndex];
    if (item) this.speak(`Pedido: ${item.name}`);
  }

  // =========================================================================
  // UTILITÁRIOS
  // =========================================================================

  speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
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
