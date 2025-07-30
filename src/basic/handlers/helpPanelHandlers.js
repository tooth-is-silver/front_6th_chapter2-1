export function setupHelpPanelHandlers(manualToggle, manualOverlay, manualColumn) {
  function handleToggleClick() {
    manualOverlay.classList.toggle("hidden");
    manualColumn.classList.toggle("translate-x-full");
  }

  function handleOverlayClick(e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add("hidden");
      manualColumn.classList.add("translate-x-full");
    }
  }

  manualToggle.onclick = handleToggleClick;
  manualOverlay.onclick = handleOverlayClick;

  return {
    handleToggleClick,
    handleOverlayClick,
  };
}