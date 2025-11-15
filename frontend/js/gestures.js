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
  // DETECÇÃO PERSONALIZADA DE TOQUES E MULTITOQUES
  // =========================================================================

  setupTapDetection() {
    let tapTimes = [];
    let touchPoints = 0;

    document.addEventListener("touchstart", (ev) => {
      touchPoints = ev.touches.length;
      tapTimes.push(Date.now());
      tapTimes = tapTimes.slice(-3);
    });

    document.addEventListener("touchend", () => {
      const now = Date.now();
      tapTimes = tapTimes.filter((t) => now - t < 350);

      if (touchPoints === 1) {
        if (tapTimes.length === 2) this.actionDoubleTapOne();
        if (tapTimes.length === 3) this.actionTripleTapOne();
      }

      if (touchPoints === 2) {
        if (tapTimes.length === 2) this.actionDoubleTapTwo();
        if (tapTimes.length === 3) this.actionTripleTapTwo();
      }

      touchPoints = 0;
    });
  }

  // =========================================================================
  // SWIPE CONFIG - AJUSTADO PARA MOVIMENTAR AMBOS CARROSSEIS
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

    const swipeConfig = {
      direction: Hammer.DIRECTION_HORIZONTAL,
      threshold: 8,
      velocity: 0.2,
    };

    this.hammMenu.get("swipe").set(swipeConfig);
    this.hammOrder.get("swipe").set(swipeConfig);

    this.hammMenu.on("swipe", (ev) => this.handleSwipe(ev, "menu"));
    this.hammOrder.on("swipe", (ev) => this.handleSwipe(ev, "order"));
  }

  handleSwipe(ev, target) {
    const dir = ev.deltaX > 0 ? "right" : "left";
    this.actionSwipe(dir, target);
  }

  // =========================================================================
  // AÇÕES DE GESTOS
  // =========================================================================

  actionLongPress() {
    this.speak("Modo leitor ativado. Use gestos para navegar e pedir itens.");

    const current = this.getCurrentCardInfo();
    if (current) {
      this.speak(
        `Você está no item ${current.name}. Preço ${current.price} reais.`
      );
    }
  }

  actionDoubleTapOne() {
    window.addItemFromGesture();
  }

  actionTripleTapOne() {
    window.sendOrder();
    this.speak("Pedido enviado.");
  }

  actionDoubleTapTwo() {
    const idx = window.currentOrderIndex;
    const items = window.orderItems;

    if (items.length === 0) {
      this.speak("Não há itens para remover.");
      return;
    }

    items.splice(idx, 1);

    if (window.currentOrderIndex >= items.length) {
      window.currentOrderIndex = Math.max(0, items.length - 1);
    }

    window.updateOrderCarousel();
    window.updateOrderCarouselNavigation();
    window.updateTotal();
    this.speak("Item removido.");
  }

  actionTripleTapTwo() {
    if (this.activeCarousel === "menu") {
      this.activeCarousel = "order";
      this.speak("Carrossel do pedido ativado.");
    } else {
      this.activeCarousel = "menu";
      this.speak("Carrossel do cardápio ativado.");
    }
  }

  // ===============================================================
  // SWIPE → AGORA FUNCIONA PARA O CARROSSEL DO PEDIDO TAMBÉM
  // ===============================================================

  // Substitua por completo a função actionSwipe existente no gestures.js
actionSwipe(direction, targetCarousel) {
  // targetCarousel: 'menu' | 'order'
  targetCarousel = targetCarousel || this.activeCarousel || "menu";

  // --- SWIPE NO CARDÁPIO (mantém comportamento atual) ---
  if (targetCarousel === "menu") {
    if (!window.menuItems || window.menuItems.length === 0) return;

    if (direction === "left") {
      window.currentMenuIndex =
        (window.currentMenuIndex + 1) % window.menuItems.length;
    } else {
      window.currentMenuIndex =
        (window.currentMenuIndex - 1 + window.menuItems.length) %
        window.menuItems.length;
    }

    // Atualiza o menu (recriar cards é ok aqui porque o botão também faz isso)
    if (typeof window.updateMenuCarousel === "function")
      window.updateMenuCarousel();

    return;
  }

  // --- SWIPE NO PEDIDO (não recriar cards para manter animação) ---
  if (!window.orderItems || window.orderItems.length === 0) {
    // nada para navegar
    this.speak("Nenhum item no pedido para navegar");
    return;
  }

  // calcula novo índice
  if (direction === "left") {
    window.currentOrderIndex =
      (window.currentOrderIndex + 1) % window.orderItems.length;
  } else {
    window.currentOrderIndex =
      (window.currentOrderIndex - 1 + window.orderItems.length) %
      window.orderItems.length;
  }

  // Se existe a função que apenas atualiza as classes (como nos botões), use-a.
  // Isso preserva os elementos DOM e permite que as transições CSS aconteçam.
  if (typeof window.updateOrderCarouselNavigation === "function") {
    // Forçar um pequeno reflow antes de aplicar classes pode ajudar em alguns browsers
    // (lê offsetWidth para forçar o layout)
    const track = document.getElementById("orderCarousel");
    if (track) {
      // pequeno timeout 0 para garantir que a mudança de índice foi aplicada
      // e o browser está pronto para a transição
      window.requestAnimationFrame(() => {
        // força reflow
        // eslint-disable-next-line no-unused-expressions
        track.offsetWidth;

        // atualiza apenas as classes; isso gera a animação igual ao clique
        window.updateOrderCarouselNavigation();
      });
    } else {
      // fallback seguro: atualizar completo se track não existir
      if (typeof window.updateOrderCarousel === "function")
        window.updateOrderCarousel();
    }
  } else {
    // Se não houver a função navigation (por alguma razão), usar fallback completo
    if (typeof window.updateOrderCarousel === "function")
      window.updateOrderCarousel();
    // e depois tentar aplicar navigation se existir
    if (typeof window.updateOrderCarouselNavigation === "function")
      window.updateOrderCarouselNavigation();
  }

  // feedback por voz (opcional)
  const cur = window.orderItems[window.currentOrderIndex];
  if (cur) this.speak(`Pedido: ${cur.name}`);
}


  // =========================================================================
  // UTILITÁRIOS
  // =========================================================================

  speak(text) {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    synth.speak(u);
  }

  getCurrentCardInfo() {
    try {
      const item = window.menuItems[window.currentMenuIndex];
      return item ? { name: item.name, price: item.price } : null;
    } catch {
      return null;
    }
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  window.gestureController = new GestureController();
});
