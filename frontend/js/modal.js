// ===== SISTEMA DE MODAL PERSONALIZADO =====

class CustomModal {
  // Modal de alerta (substitui alert)
  static async alert(message, title = 'Atenção') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      
      overlay.innerHTML = `
        <div class="modal-container">
          <div class="modal-icon">⚠️</div>
          <h3 class="modal-title">${title}</h3>
          <p class="modal-message">${message}</p>
          <button class="modal-btn modal-btn-ok">OK</button>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      const okBtn = overlay.querySelector('.modal-btn-ok');
      okBtn.focus();
      
      const removeModal = () => {
        document.body.removeChild(overlay);
        resolve(true);
      };
      
      okBtn.addEventListener('click', removeModal);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) removeModal();
      });
    });
  }

  // Modal de confirmação (substitui confirm)
  static async confirm(message, title = 'Confirmação') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      
      overlay.innerHTML = `
        <div class="modal-container">
          <div class="modal-icon">❓</div>
          <h3 class="modal-title">${title}</h3>
          <p class="modal-message">${message}</p>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-cancel">Cancelar</button>
            <button class="modal-btn modal-btn-confirm">Confirmar</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      const confirmBtn = overlay.querySelector('.modal-btn-confirm');
      const cancelBtn = overlay.querySelector('.modal-btn-cancel');
      confirmBtn.focus();
      
      const removeModal = (result) => {
        document.body.removeChild(overlay);
        resolve(result);
      };
      
      confirmBtn.addEventListener('click', () => removeModal(true));
      cancelBtn.addEventListener('click', () => removeModal(false));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) removeModal(false);
      });
    });
  }

  // Modal de sucesso
  static async success(message, title = 'Sucesso') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      
      overlay.innerHTML = `
        <div class="modal-container">
          <div class="modal-icon">✅</div>
          <h3 class="modal-title">${title}</h3>
          <p class="modal-message">${message}</p>
          <button class="modal-btn modal-btn-ok">OK</button>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      const okBtn = overlay.querySelector('.modal-btn-ok');
      okBtn.focus();
      
      const removeModal = () => {
        document.body.removeChild(overlay);
        resolve(true);
      };
      
      okBtn.addEventListener('click', removeModal);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) removeModal();
      });
    });
  }

  // Modal de erro
  static async error(message, title = 'Erro') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      
      overlay.innerHTML = `
        <div class="modal-container">
          <div class="modal-icon">❌</div>
          <h3 class="modal-title">${title}</h3>
          <p class="modal-message">${message}</p>
          <button class="modal-btn modal-btn-ok">OK</button>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      const okBtn = overlay.querySelector('.modal-btn-ok');
      okBtn.focus();
      
      const removeModal = () => {
        document.body.removeChild(overlay);
        resolve(true);
      };
      
      okBtn.addEventListener('click', removeModal);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) removeModal();
      });
    });
  }
}

// Substitui as funções globais
window.showAlert = CustomModal.alert;
window.showConfirm = CustomModal.confirm;
window.showSuccess = CustomModal.success;
window.showError = CustomModal.error;