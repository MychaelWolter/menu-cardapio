// gestures.js - Sistema de Gestos para Acessibilidade

class TouchGestureManager {
  constructor() {
    this.gestures = {
      // Gestos definidos
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

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showGestureModeIndicator();
    this.announceInstructions();
  }

  setupEventListeners() {
    document.addEventListener("touchstart", this.handleTouchStart.bind(this));
    document.addEventListener("touchend", this.handleTouchEnd.bind(this));
    document.addEventListener("touchmove", this.handleTouchMove.bind(this));

    // Também adicionar suporte a teclado para fallback
    document.addEventListener("keydown", this.handleKeyPress.bind(this));
  }

  handleTouchStart(event) {
    if (!this.isGestureMode) return;

    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.lastTouchTime = Date.now();

    // Iniciar detecção de long press
    this.longPressTimeout = setTimeout(() => {
      this.executeGesture(this.gestures.DELETE_ITEM);
    }, 1000);
  }

  handleTouchEnd(event) {
    if (!this.isGestureMode) return;

    clearTimeout(this.longPressTimeout);

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastTouchTime;

    // Detectar número de toques
    if (event.touches.length === 0) {
      this.tapCount++;

      if (this.tapCount === 1) {
        this.tapTimeout = setTimeout(() => {
          // Single tap - navegação básica
          if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            this.speakCurrentElement();
          }
          this.tapCount = 0;
        }, 300);
      } else if (this.tapCount === 2) {
        clearTimeout(this.tapTimeout);
        if (timeDiff < 500) {
          this.executeGesture(this.gestures.ADD_ITEM);
        }
        this.tapCount = 0;
      } else if (this.tapCount === 3) {
        clearTimeout(this.tapTimeout);
        if (timeDiff < 800) {
          this.executeGesture(this.gestures.CONFIRM_ORDER);
        }
        this.tapCount = 0;
      }
    }
  }

  handleTouchMove(event) {
    if (!this.isGestureMode) return;

    clearTimeout(this.longPressTimeout);

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;

      // Detectar swipe horizontal (navegação do cardápio)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
        if (deltaX > 0) {
          this.executeGesture(this.gestures.NAVIGATE_MENU, "right");
        } else {
          this.executeGesture(this.gestures.NAVIGATE_MENU, "left");
        }
        event.preventDefault();
      }

      // Detectar swipe vertical (ajuda)
      if (Math.abs(deltaY) > 50 && Math.abs(deltaX) < 30) {
        if (deltaY < 0) {
          this.executeGesture(this.gestures.HELP);
        }
      }
    }

    // Swipe com dois dedos - iniciar leitura
    if (event.touches.length === 2) {
      const currentTime = Date.now();
      if (currentTime - this.lastTouchTime < 300) {
        this.executeGesture(this.gestures.START_READING);
      }
    }
  }

handleKeyPress(event) {
  // IMPORTANTE: Não processar gestos se o usuário está digitando em inputs
  const activeElement = document.activeElement;
  const isInputFocused = activeElement.tagName === 'INPUT' || 
                         activeElement.tagName === 'TEXTAREA' || 
                         activeElement.tagName === 'SELECT';
  
  if (isInputFocused) {
    return; // Deixa o usuário digitar normalmente nos inputs
  }

  // Apenas processar gestos de teclado quando nenhum input está focado
  switch(event.key) {
    case '1':
      event.preventDefault();
      this.executeGesture(this.gestures.START_READING);
      break;
    case '2':
      event.preventDefault();
      this.clearInputs(); // Nova função para limpar inputs
      break;
    case '3':
      event.preventDefault();
      this.executeGesture(this.gestures.DELETE_ITEM);
      break;
    case '4':
      event.preventDefault();
      this.executeGesture(this.gestures.CONFIRM_ORDER);
      break;
    case 'ArrowRight':
      event.preventDefault();
      this.executeGesture(this.gestures.NAVIGATE_MENU, 'right');
      break;
    case 'ArrowLeft':
      event.preventDefault();
      this.executeGesture(this.gestures.NAVIGATE_MENU, 'left');
      break;
    case 'h':
      event.preventDefault();
      this.executeGesture(this.gestures.HELP);
      break;
  }
}

// Adicione esta nova função ao gestures.js
clearInputs() {
  const itemIdInput = document.getElementById('itemId');
  const quantityInput = document.getElementById('quantity');
  
  if (itemIdInput && quantityInput) {
    itemIdInput.value = '';
    quantityInput.value = '';
    itemIdInput.focus();
    this.speak('Campos limpos. Pronto para novo item.');
  }
}

  executeGesture(gestureType, direction = null) {
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

    this.showTemporaryIndicator(messages[gestureType]);
    this.speak(messages[gestureType]);
  }

  showGestureModeIndicator() {
    // Remover indicador anterior se existir
    const existingIndicator = document.getElementById("gestureIndicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }

    const indicator = document.createElement("div");
    indicator.className = "gesture-mode-indicator";
    indicator.textContent = "👆 Modo Gestos Ativo";
    indicator.id = "gestureIndicator";
    indicator.style.display = "block";
    document.body.appendChild(indicator);

    // Ocultar após 2 segundos
    setTimeout(() => {
      indicator.style.display = "none";
    }, 2000);
  }

  showTemporaryIndicator(message, duration = 2000) {
    const indicator = document.getElementById("gestureIndicator");

    if (indicator) {
      indicator.textContent = message;
      indicator.style.background = this.isGestureMode ? "#9c1c28" : "#95a5a6";
      indicator.style.display = "block";

      // Ocultar após o tempo especificado
      setTimeout(() => {
        indicator.style.display = "none";
      }, duration);
    }
  }

  // ===== AÇÕES DOS GESTOS =====

  announceInstructions() {
    const instructions = `
      Bem-vindo ao TalkMenu. Modo de gestos ativado.
      Gestos disponíveis: 
      Dois toques com dois dedos para ouvir instruções.
      Dois toques rápidos com um dedo para adicionar item.
      Arraste para direita ou esquerda para navegar no cardápio.
      Pressione e segure para excluir item.
      Três toques rápidos para enviar pedido.
      Arraste para cima para ajuda.
      Pressione 1, 2, 3, 4 no teclado para alternar entre funções.
    `;

    this.speak(instructions);
  }

  addCurrentItemToOrder() {
    if (window.addItemToOrder && menuItems && menuItems[currentMenuIndex]) {
      const currentItem = menuItems[currentMenuIndex];
      const itemIdInput = document.getElementById("itemId");
      const quantityInput = document.getElementById("quantity");

      if (itemIdInput && quantityInput) {
        itemIdInput.value = currentMenuIndex + 1;
        quantityInput.value = 1;
        window.addItemToOrder();
        this.speak(`Item ${currentItem.name} adicionado ao pedido`);
      }
    } else {
      this.speak("Função de adicionar item não disponível no momento");
    }
  }

  navigateMenu(direction) {
    if (direction === "right") {
      // Próximo item
      currentMenuIndex = (currentMenuIndex + 1) % menuItems.length;
    } else {
      // Item anterior
      currentMenuIndex =
        (currentMenuIndex - 1 + menuItems.length) % menuItems.length;
    }

    updateMenuCarousel();

    const currentItem = menuItems[currentMenuIndex];
    if (currentItem) {
      this.speak(
        `${currentMenuIndex + 1}. ${currentItem.name}. ${
          currentItem.description
        }. Preço: R$ ${currentItem.price.toFixed(2)}`
      );
    }
  }

  deleteCurrentOrderItem() {
    if (orderItems.length > 0 && currentOrderIndex < orderItems.length) {
      const deletedItem = orderItems[currentOrderIndex];
      orderItems.splice(currentOrderIndex, 1);

      if (currentOrderIndex >= orderItems.length && orderItems.length > 0) {
        currentOrderIndex = orderItems.length - 1;
      } else if (orderItems.length === 0) {
        currentOrderIndex = 0;
      }

      updateOrderCarousel();
      updateTotal();

      this.speak(`Item ${deletedItem.name} removido do pedido`);
    } else {
      this.speak("Nenhum item para remover");
    }
  }

  confirmOrder() {
    if (window.sendOrder && orderItems.length > 0) {
      window.sendOrder();
      this.speak("Pedido enviado com sucesso!");
    } else {
      this.speak("Nenhum item no pedido para enviar");
    }
  }

  showHelp() {
    const helpMessage = `
      Ajuda do TalkMenu:
      Você está na tela de cardápio. 
      Use os gestos para navegar e fazer pedidos.
      Cardápio atual tem ${menuItems ? menuItems.length : 0} itens.
      Pedido atual tem ${orderItems ? orderItems.length : 0} itens.
      Total: R$ ${
        document.getElementById("totalAmount")
          ? document.getElementById("totalAmount").textContent
          : "0.00"
      }
    `;

    this.speak(helpMessage);
  }

  speak(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Parar fala anterior
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  }

  speakCurrentElement() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.textContent) {
      this.speak(activeElement.textContent);
    }
  }

  // Método para alternar modo de gestos
  toggleGestureMode() {
    this.isGestureMode = !this.isGestureMode;
    const indicator = document.getElementById("gestureIndicator");

    if (indicator) {
      indicator.textContent = this.isGestureMode
        ? "👆 Modo Gestos Ativo"
        : "👆 Modo Gestos Inativo";
      indicator.style.background = this.isGestureMode ? "#9c1c28" : "#95a5a6";
      indicator.style.display = "block";

      // Ocultar após 2 segundos
      setTimeout(() => {
        indicator.style.display = "none";
      }, 2000);
    }

    this.speak(
      this.isGestureMode ? "Modo gestos ativado" : "Modo gestos desativado"
    );
  }
}

// Inicializar gerenciador de gestos quando a página carregar
let gestureManager;

document.addEventListener("DOMContentLoaded", function () {
  gestureManager = new TouchGestureManager();

  // Adicionar botão para alternar modo de gestos
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "👆 Gestos";
  toggleButton.style.position = "fixed";
  toggleButton.style.bottom = "3%";
  toggleButton.style.right = "2%";
  toggleButton.style.zIndex = "1000";
  toggleButton.style.padding = "8px 15px 10px";
  toggleButton.style.borderRadius = "30px";
  toggleButton.style.background = "#9c1c28";
  toggleButton.style.color = "white";
  toggleButton.style.border = "none";
  toggleButton.style.cursor = "pointer";
  toggleButton.style.fontSize = "0.8rem";
  toggleButton.style.fontWeight = "bold";
  toggleButton.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";

  toggleButton.addEventListener("click", () => {
    gestureManager.toggleGestureMode();
  });

  // Mostrar instrução temporária ao interagir com o botão
  toggleButton.addEventListener("mouseenter", () => {
    gestureManager.showTemporaryIndicator(
      "Clique para alternar modo de gestos",
      3000
    );
  });

  toggleButton.addEventListener("touchstart", () => {
    gestureManager.showTemporaryIndicator(
      "Clique para alternar modo de gestos",
      3000
    );
  });

  document.body.appendChild(toggleButton);

  // Adicionar estilo CSS dinamicamente para o indicador
  const style = document.createElement("style");
  style.textContent = `
    .gesture-mode-indicator {
      position: fixed;
      top: 91%;
      left: 10px;
      background: #9c1c28;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: bold;
      z-index: 9999;
      transition: opacity 0.3s ease;
      display: none;
    }
  `;
  document.head.appendChild(style);
});
