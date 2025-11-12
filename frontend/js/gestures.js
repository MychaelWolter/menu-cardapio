// gestures.js - Sistema de Gestos para Acessibilidade

class TouchGestureManager {
  constructor() {
    this.gestures = {
      START_READING: "doubleTapTwoFingers",
      ADD_ITEM: "doubleTap",
      NAVIGATE_MENU: "swipeHorizontal",
      DELETE_ITEM: "longPress",
      CONFIRM_ORDER: "tripleTap",
      HELP: "swipeUp",
    };

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.lastTouchTime = 0;
    this.tapCount = 0;
    this.tapTimeout = null;
    this.longPressTimeout = null;
    this.isGestureMode = true;

    // Variáveis de controle
    this.lastGestureTime = 0;
    this.gestureCooldown = 300;
    this.isTwoFingerTouch = false;
    this.isGestureInProgress = false;
    this.startTouches = [];

    this.ensureGlobalVariables();
    this.init();
  }

  ensureGlobalVariables() {
    if (typeof menuItems === "undefined") {
      window.menuItems = [];
    }
    if (typeof currentMenuIndex === "undefined") {
      window.currentMenuIndex = 0;
    }
    if (typeof orderItems === "undefined") {
      window.orderItems = [];
    }
    if (typeof currentOrderIndex === "undefined") {
      window.currentOrderIndex = 0;
    }
  }

  init() {
    this.setupEventListeners();
    this.showGestureModeIndicator();
    setTimeout(() => {
      this.announceInstructions();
    }, 1000);
  }

  setupEventListeners() {
    // Usar passive: true para melhor performance, exceto onde precisamos preventDefault()
    document.addEventListener("touchstart", this.handleTouchStart.bind(this), {
      passive: true,
    });
    document.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: true,
    });
    document.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: false,
    });
    document.addEventListener("touchcancel", this.handleTouchCancel.bind(this));

    document.addEventListener("keydown", this.handleKeyPress.bind(this));
    this.preventZoom();
  }

  preventZoom() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      );
    }

    document.addEventListener("gesturestart", (e) => e.preventDefault());
    document.addEventListener("gesturechange", (e) => e.preventDefault());
    document.addEventListener("gestureend", (e) => e.preventDefault());
  }

  handleTouchStart(event) {
    if (!this.isGestureMode) return;

    const currentTime = Date.now();

    // Cooldown entre gestos
    if (currentTime - this.lastGestureTime < this.gestureCooldown) {
      return;
    }

    // Salvar informações dos toques iniciais
    this.startTouches = Array.from(event.touches).map((touch) => ({
      clientX: touch.clientX,
      clientY: touch.clientY,
      identifier: touch.identifier,
    }));

    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.lastTouchTime = currentTime;

    // Detectar dois dedos
    if (event.touches.length === 2) {
      this.isTwoFingerTouch = true;
      this.twoFingerStartTime = currentTime;
    }

    // Iniciar long press
    this.longPressTimeout = setTimeout(() => {
      if (this.isGestureMode && !this.isGestureInProgress) {
        this.isGestureInProgress = true;
        this.executeGesture(this.gestures.DELETE_ITEM);
        this.lastGestureTime = Date.now();
      }
    }, 800);
  }

  handleTouchEnd(event) {
    if (!this.isGestureMode) return;

    const currentTime = Date.now();
    clearTimeout(this.longPressTimeout);

    // Cooldown entre gestos
    if (currentTime - this.lastGestureTime < this.gestureCooldown) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Se foi um tap (movimento mínimo) e não há gesto em progresso
    if (distance < 20 && !this.isGestureInProgress) {
      this.handleTap(event);
    }

    this.isGestureInProgress = false;
    this.isTwoFingerTouch = false;
    this.lastGestureTime = currentTime;
  }

  handleTap(event) {
    const currentTime = Date.now();
    const timeSinceLastTap = currentTime - this.lastTouchTime;

    // Reset tap count se passou muito tempo
    if (timeSinceLastTap > 500) {
      this.tapCount = 0;
    }

    this.tapCount++;
    this.lastTouchTime = currentTime;

    // Clear previous timeout
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
    }

    // Aguardar por mais toques
    this.tapTimeout = setTimeout(() => {
      this.processTapSequence();
    }, 300);
  }

  processTapSequence() {
    console.log(`🔹 Processando ${this.tapCount} toque(s)`);

    switch (this.tapCount) {
      case 1:
        this.speakCurrentElement();
        break;

      case 2:
        if (this.isTwoFingerTouch) {
          console.log("🎧 Double tap com DOIS dedos - INICIAR LEITURA");
          this.executeGesture(this.gestures.START_READING);
        } else {
          console.log("➕ Double tap com UM dedo - ADICIONAR ITEM");
          this.executeGesture(this.gestures.ADD_ITEM);
        }
        break;

      case 3:
        console.log("✅ Triple tap - CONFIRMAR PEDIDO");
        this.executeGesture(this.gestures.CONFIRM_ORDER);
        break;
    }

    this.tapCount = 0;
  }

  handleTouchMove(event) {
    if (!this.isGestureMode || this.isGestureInProgress) return;

    const currentTime = Date.now();

    // Cooldown entre gestos
    if (currentTime - this.lastGestureTime < this.gestureCooldown) {
      return;
    }

    clearTimeout(this.longPressTimeout);

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;

      // Threshold para detecção de swipe
      const swipeThreshold = 60;

      // Detectar swipe horizontal
      if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaY) < 40) {
        this.isGestureInProgress = true;
        if (deltaX > 0) {
          console.log("➡️ Swipe direito - NAVEGAR DIREITA");
          this.executeGesture(this.gestures.NAVIGATE_MENU, "right");
        } else {
          console.log("⬅️ Swipe esquerdo - NAVEGAR ESQUERDA");
          this.executeGesture(this.gestures.NAVIGATE_MENU, "left");
        }
        this.lastGestureTime = currentTime;
        event.preventDefault();
        return;
      }

      // Detectar swipe vertical para cima
      if (Math.abs(deltaY) > swipeThreshold && Math.abs(deltaX) < 40) {
        this.isGestureInProgress = true;
        if (deltaY < 0) {
          console.log("⬆️ Swipe para cima - AJUDA");
          this.executeGesture(this.gestures.HELP);
          this.lastGestureTime = currentTime;
          event.preventDefault();
          return;
        }
      }
    }
  }

  handleTouchCancel() {
    clearTimeout(this.longPressTimeout);
    clearTimeout(this.tapTimeout);
    this.isTwoFingerTouch = false;
    this.tapCount = 0;
    this.isGestureInProgress = false;
  }

  handleKeyPress(event) {
    const activeElement = document.activeElement;
    const isInputFocused =
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.tagName === "SELECT";

    if (isInputFocused) return;

    switch (event.key) {
      case "1":
        event.preventDefault();
        this.executeGesture(this.gestures.START_READING);
        break;
      case "2":
        event.preventDefault();
        this.clearInputs();
        break;
      case "3":
        event.preventDefault();
        this.executeGesture(this.gestures.DELETE_ITEM);
        break;
      case "4":
        event.preventDefault();
        this.executeGesture(this.gestures.CONFIRM_ORDER);
        break;
      case "ArrowRight":
        event.preventDefault();
        this.executeGesture(this.gestures.NAVIGATE_MENU, "right");
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.executeGesture(this.gestures.NAVIGATE_MENU, "left");
        break;
      case "h":
      case "H":
        event.preventDefault();
        this.executeGesture(this.gestures.HELP);
        break;
      case "Escape":
        event.preventDefault();
        this.toggleGestureMode();
        break;
    }
  }

  clearInputs() {
    const itemIdInput = document.getElementById("itemId");
    const quantityInput = document.getElementById("quantity");

    if (itemIdInput && quantityInput) {
      itemIdInput.value = "";
      quantityInput.value = "1";
      itemIdInput.focus();
      this.speak("Campos limpos. Pronto para novo item.");
    }
  }

  executeGesture(gestureType, direction = null) {
    if (!this.isGestureMode) {
      console.log("❌ Modo gestos desativado");
      return;
    }

    console.log(`🎯 EXECUTANDO GESTO: ${gestureType}`, direction);
    this.showGestureFeedback(gestureType, direction);

    switch (gestureType) {
      case this.gestures.START_READING:
        this.announceInstructions();
        break;
      case this.gestures.ADD_ITEM:
        this.addCurrentItemToOrder();
        break;
      case this.gestures.NAVIGATE_MENU:
        this.navigateMenu(direction);
        break;
      case this.gestures.DELETE_ITEM:
        this.deleteCurrentOrderItem();
        break;
      case this.gestures.CONFIRM_ORDER:
        this.confirmOrder();
        break;
      case this.gestures.HELP:
        this.showHelp();
        break;
    }
  }

  showGestureFeedback(gestureType, direction) {
    const messages = {
      [this.gestures.START_READING]: "🎧 Iniciando leitura",
      [this.gestures.ADD_ITEM]: "➕ Adicionando item",
      [this.gestures.NAVIGATE_MENU]: `📱 Navegando ${
        direction === "right" ? "direita" : "esquerda"
      }`,
      [this.gestures.DELETE_ITEM]: "🗑️ Removendo item",
      [this.gestures.CONFIRM_ORDER]: "✅ Confirmando pedido",
      [this.gestures.HELP]: "❓ Ajuda",
    };

    const message = messages[gestureType] || "Gesto executado";
    this.showTemporaryIndicator(message);
    this.speak(message);
  }

  showGestureModeIndicator() {
    let indicator = document.getElementById("gestureIndicator");

    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "gestureIndicator";
      indicator.className = "gesture-indicator";
      document.body.appendChild(indicator);
    }

    indicator.textContent = this.isGestureMode
      ? "👆 Gestos Ativo"
      : "👆 Gestos Inativo";
    indicator.style.background = this.isGestureMode ? "#9c1c28" : "#95a5a6";
    indicator.style.display = "block";

    // Ocultar após 3 segundos
    setTimeout(() => {
      if (indicator.textContent.includes("Gestos")) {
        indicator.style.display = "none";
      }
    }, 3000);
  }

  showTemporaryIndicator(message, duration = 2000) {
    this.showGestureModeIndicator();
    const indicator = document.getElementById("gestureIndicator");

    if (indicator) {
      indicator.textContent = message;
      indicator.style.display = "block";

      setTimeout(() => {
        if (indicator.textContent === message) {
          indicator.style.display = "none";
        }
      }, duration);
    }
  }

  // ===== AÇÕES DOS GESTOS =====

  announceInstructions() {
    const instructions = `Modo gestos ativo. Toque duplo com um dedo para adicionar item, arraste para os lados para navegar, toque longo para remover.`;
    this.speak(instructions);
  }

  addCurrentItemToOrder() {
    console.log("📦 Tentando adicionar item ao pedido...");

    if (window.menuItems && window.menuItems.length > 0) {
      const currentItem = window.menuItems[window.currentMenuIndex];

      // Simular adição se a função não existir
      if (typeof window.addItemToOrder === "function") {
        window.addItemToOrder();
      } else {
        // Fallback
        if (!window.orderItems) window.orderItems = [];
        const newItem = {
          ...currentItem,
          id: Date.now(),
          quantity: 1,
        };
        window.orderItems.push(newItem);
        console.log("✅ Item adicionado:", newItem);
      }

      this.speak(`Item ${currentItem.name} adicionado ao pedido`);
    } else {
      this.speak("Nenhum item disponível no cardápio");
    }
  }

  navigateMenu(direction) {
    if (!window.menuItems || window.menuItems.length === 0) {
      this.speak("Nenhum item no cardápio");
      return;
    }

    const oldIndex = window.currentMenuIndex;

    if (direction === "right") {
      window.currentMenuIndex =
        (window.currentMenuIndex + 1) % window.menuItems.length;
    } else {
      window.currentMenuIndex =
        (window.currentMenuIndex - 1 + window.menuItems.length) %
        window.menuItems.length;
    }

    console.log(`📱 Navegando de ${oldIndex} para ${window.currentMenuIndex}`);

    // Atualizar UI se a função existir
    if (typeof window.updateMenuCarousel === "function") {
      window.updateMenuCarousel();
    }

    const currentItem = window.menuItems[window.currentMenuIndex];
    this.speak(
      `${currentItem.name}. ${
        currentItem.description
      }. R$ ${currentItem.price.toFixed(2)}`
    );
  }

  deleteCurrentOrderItem() {
    console.log("🗑️ Tentando remover item...");

    if (window.orderItems && window.orderItems.length > 0) {
      const deletedItem = window.orderItems[window.currentOrderIndex];
      window.orderItems.splice(window.currentOrderIndex, 1);

      // Atualizar UI se as funções existirem
      if (typeof window.updateOrderCarousel === "function")
        window.updateOrderCarousel();
      if (typeof window.updateTotal === "function") window.updateTotal();

      this.speak(`Item ${deletedItem.name} removido`);
      console.log("✅ Item removido. Pedido atual:", window.orderItems);
    } else {
      this.speak("Nenhum item para remover");
    }
  }

  confirmOrder() {
    console.log("📤 Confirmando pedido...");

    if (window.orderItems && window.orderItems.length > 0) {
      if (typeof window.sendOrder === "function") {
        window.sendOrder();
      } else {
        // Simular confirmação
        console.log("🎉 Pedido confirmado:", window.orderItems);
        window.orderItems = [];
      }
      this.speak("Pedido confirmado com sucesso!");
    } else {
      this.speak("Adicione itens antes de confirmar o pedido");
    }
  }

  showHelp() {
    const helpMessage = `
      Ajuda: Cardápio com ${window.menuItems?.length || 0} itens. 
      Pedido com ${window.orderItems?.length || 0} itens.
      Modo gestos ${this.isGestureMode ? "ativo" : "inativo"}.
    `;
    this.speak(helpMessage);
  }

  speak(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
    console.log("🔊 Falando:", text);
  }

  speakCurrentElement() {
    const activeElement = document.activeElement;
    const text =
      activeElement?.textContent || activeElement?.value || "Elemento atual";
    this.speak(text);
  }

  toggleGestureMode() {
    this.isGestureMode = !this.isGestureMode;
    this.showGestureModeIndicator();
    this.speak(
      this.isGestureMode ? "Modo gestos ativado" : "Modo gestos desativado"
    );

    // Atualizar botão
    const button = document.querySelector(".gesture-toggle-button");
    if (button) {
      button.style.background = this.isGestureMode ? "#9c1c28" : "#95a5a6";
      button.textContent = this.isGestureMode ? "👆 Gestos" : "👆 Normal";
    }
  }
}

// Inicialização
let gestureManager;

document.addEventListener("DOMContentLoaded", function () {
  gestureManager = new TouchGestureManager();
  createGestureToggleButton();
  addGestureStyles();
});

function createGestureToggleButton() {
  if (document.querySelector(".gesture-toggle-button")) return;

  const button = document.createElement("button");
  button.className = "gesture-toggle-button";
  button.innerHTML = "👆 Gestos";
  button.setAttribute("aria-label", "Alternar modo de gestos");

  // BOTÃO PEQUENO NA DIREITA
  button.style.cssText = `
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 10000;
    padding: 8px 16px;
    border-radius: 20px;
    background: #9c1c28;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
    min-width: 80px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
  `;

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    gestureManager.toggleGestureMode();
  });

  button.addEventListener("touchstart", (e) => {
    e.stopPropagation(); // Não interferir com os gestos
  });

  document.body.appendChild(button);
}

function addGestureStyles() {
  if (document.getElementById("gesture-styles")) return;

  const styles = `
    .gesture-indicator {
      position: fixed;
      bottom: 15px;
      left: 15px;
      background: #9c1c28;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      text-align: center;
      min-width: 80px;
      display: none;
      transition: all 0.3s ease;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    
    .gesture-toggle-button {
      /* Estilo definido inline para consistência */
    }
    
    .gesture-toggle-button:hover {
      transform: scale(1.05);
      background: #7a1620 !important;
    }
    
    .gesture-toggle-button:active {
      transform: scale(0.95);
    }

    .gesture-indicator {
      animation: fadeInOut 0.3s ease;
    }

    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.id = "gesture-styles";
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Exportar para uso global
window.TouchGestureManager = TouchGestureManager;
