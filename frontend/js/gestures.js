// =======================================================
//  SISTEMA DE GESTOS PARA ACESSIBILIDADE - TALKMENU
//  Totalmente refeito usando Hammer.js
// =======================================================

class GestureController {
  constructor() {
    this.activeCarousel = "menu"; // 'menu' ou 'order'
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
    this.hamm.on("press", () => this.actionLongPress());

    // swipe vertical (NOVO)
    this.hamm.add(
      new Hammer.Swipe({
        direction: Hammer.DIRECTION_VERTICAL,
        threshold: 8,
        velocity: 0.2,
      })
    );

    this.hamm.on("swipeup", () => this.scrollToMenu());
    this.hamm.on("swipedown", () => this.scrollToOrder());
  }

  // =========================================================================
  // TAP / MULTITAP — SEM 3 TOQUES COM 2 DEDOS
  // =========================================================================

  setupTapDetection() {
    let fingers = 0;

    let tap1 = [];
    let tap2 = [];

    let timeout1 = null;
    let timeout2 = null;

    document.addEventListener("touchstart", (ev) => {
      fingers = ev.touches.length;

      if (fingers === 1) {
        tap1.push(Date.now());
        tap1 = tap1.slice(-3);
      }

      if (fingers === 2) {
        tap2.push(Date.now());
        tap2 = tap2.slice(-3);
      }
    });

    document.addEventListener("touchend", () => {
      const now = Date.now();

      tap1 = tap1.filter(t => now - t < 350);
      tap2 = tap2.filter(t => now - t < 350);

      // ==============================
      //   TAP COM 1 DEDO
      // ==============================

      // TRIPLE TAP 1 DEDO
      if (fingers === 1 && tap1.length === 3) {
        clearTimeout(timeout1);
        this.actionTripleTapOne();
        tap1 = [];
        return;
      }

      // DOUBLE TAP 1 DEDO
      if (fingers === 1 && tap1.length === 2) {
        clearTimeout(timeout1);
        timeout1 = setTimeout(() => {
          if (tap1.length === 2) this.actionDoubleTapOne();
        }, 300);
      }

      // ==============================
      //   TAP COM 2 DEDOS
      // ==============================

      // (TRIPLE TAP COM 2 DEDOS REMOVIDO)

      if (fingers === 2 && tap2.length === 2) {
        clearTimeout(timeout2);
        timeout2 = setTimeout(() => {
          if (tap2.length === 2) this.actionDoubleTapTwo();
        }, 300);
      }

      fingers = 0;
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
  // SWIPE VERTICAL — CENTRALIZAR CARDÁPIO OU PEDIDO (NOVO)
  // =========================================================================

  scrollToMenu() {
    const section = this.menuCarousel.closest(".menu-carousel");
    section?.scrollIntoView({ behavior: "smooth", block: "center" });
    this.activeCarousel = "menu";
    this.speak("Cardápio centralizado.");
  }

  scrollToOrder() {
    const section = this.orderCarousel.closest(".order-carousel");
    section?.scrollIntoView({ behavior: "smooth", block: "center" });
    this.activeCarousel = "order";
    this.speak("Pedido centralizado.");
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
      return;
    }

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
      if (track) track.offsetWidth;
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
