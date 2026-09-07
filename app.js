/**
 * MERIDIAN — Accounts Receivable Payment Reconciliation
 * Interactive Prototype Logic
 * 
 * Core flows:
 * 1. Screen 1 (Queue) -> Row 1 click -> Screen 2 (Resolution Workspace)
 * 2. Screen 2: Apply payment -> Inline Post-Apply Card ("Remember this payer?")
 * 3. Screen 2 Inline Confirmation -> Screen 3 (Matched Payment with Explainable Reasoning Block)
 * 4. Screen 3: 1-click Unapply feedback loop -> Return to Queue
 * 5. Screen 4: Saved Payers -> Consequence Deletion Assessment ($312,400 across 14 payments)
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    currentScreen: 'screen-1',
    unappliedCount: 5,
    pendingCash: 106840.50,
    savedPayersCount: 8,
    ashfordApplied: false,
    ashfordRuleSaved: false,
    ashfordRuleDeleted: false,
    invoices: [
      { id: 'INV-4471', amount: 6800.00, selected: true },
      { id: 'INV-4472', amount: 8240.00, selected: true },
      { id: 'INV-4488', amount: 11400.00, selected: true },
      { id: 'INV-4501', amount: 5150.00, selected: true },
      { id: 'INV-4502', amount: 7930.00, selected: true },
      { id: 'INV-4519', amount: 7800.00, selected: true },
    ]
  };

  // DOM Elements
  const tabs = document.querySelectorAll('.nav-tab');
  const screens = document.querySelectorAll('.screen-view');
  const unappliedCountEl = document.getElementById('unapplied-count');
  const savedPayersCountEl = document.getElementById('saved-payers-count');
  const statPendingAmountEl = document.getElementById('stat-pending-amount');

  // Screen 1 Elements
  const rowAshford47k = document.getElementById('row-ashford-47k');
  const btnResolveAshford = document.getElementById('btn-resolve-ashford');
  const btnViewMatchedSample = document.getElementById('btn-view-matched-sample');
  const queueFilterInput = document.getElementById('queue-filter');
  const unappliedTableBody = document.getElementById('unapplied-tbody');

  // Screen 2 Elements
  const btnBackToQueue = document.getElementById('btn-back-to-queue');
  const chipRemittancePreview = document.getElementById('chip-remittance-preview');
  const inputAccountSearch = document.getElementById('input-account-search');
  const accountDropdown = document.getElementById('account-dropdown');
  const btnClearAccount = document.getElementById('btn-clear-account');
  const checkAllInvoices = document.getElementById('check-all-invoices');
  const invoiceCheckboxes = document.querySelectorAll('.inv-checkbox');
  const valTotalApplied = document.getElementById('val-total-applied');
  const valVariance = document.getElementById('val-variance');
  const btnApplyPayment = document.getElementById('btn-apply-payment');
  const actionBarPrimary = document.getElementById('action-bar-primary');
  const inlineRememberPanel = document.getElementById('inline-remember-panel');
  const btnRememberNotNow = document.getElementById('btn-remember-not-now');
  const btnRememberConfirm = document.getElementById('btn-remember-confirm');
  const postConfirmBox = document.getElementById('post-confirm-box');
  const btnGotoScreen3FromConfirm = document.getElementById('btn-goto-screen3-from-confirm');

  // Screen 3 Elements
  const linkToSavedPayers = document.getElementById('link-to-saved-payers');
  const btnTriggerUnapply = document.getElementById('btn-trigger-unapply');
  const btnAuditLogPrint = document.getElementById('btn-audit-log-print');
  const screen3StatusBadge = document.getElementById('screen-3-status-badge');
  const unapplySuccessBanner = document.getElementById('unapply-success-banner');
  const btnGotoQueueFromUnapply = document.getElementById('btn-goto-queue-from-unapply');
  const btnUndoUnapply = document.getElementById('btn-undo-unapply');

  // Screen 4 Elements
  const rowRuleAshford = document.getElementById('row-rule-ashford');
  const btnDeleteAshfordRule = document.getElementById('btn-delete-ashford-rule');

  // Modals
  const modalDeleteRule = document.getElementById('modal-delete-rule');
  const btnModalDelClose = document.getElementById('btn-modal-del-close');
  const btnJustRemove = document.getElementById('btn-just-remove');
  const btnReviewPayments = document.getElementById('btn-review-payments');

  const modalRemittanceViewer = document.getElementById('modal-remittance-viewer');
  const btnCloseRemittance = document.getElementById('btn-close-remittance');
  const btnCloseRemittanceBottom = document.getElementById('btn-close-remittance-bottom');

  // Guide Drawer
  const guideDrawer = document.getElementById('guide-drawer');
  const btnToggleGuide = document.getElementById('btn-toggle-guide');
  const btnCloseGuide = document.getElementById('btn-close-guide');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  /* ========================================================================
     NAVIGATION & SCREEN SWITCHING
     ======================================================================== */
  window.switchView = function(screenId) {
    state.currentScreen = screenId;

    // Update Screens
    screens.forEach(screen => {
      screen.classList.remove('active');
      if (screen.id === screenId) {
        screen.classList.add('active');
      }
    });

    // Update Tabs
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-target') === screenId) {
        tab.classList.add('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetScreen = tab.getAttribute('data-target');
      if (targetScreen) {
        switchView(targetScreen);
      }
    });
  });

  // Breadcrumb back to Screen 1
  if (btnBackToQueue) {
    btnBackToQueue.addEventListener('click', () => {
      switchView('screen-1');
    });
  }

  // Row 1 click in Screen 1 opens Screen 2
  if (rowAshford47k) {
    rowAshford47k.addEventListener('click', (e) => {
      switchView('screen-2');
    });
  }

  if (btnResolveAshford) {
    btnResolveAshford.addEventListener('click', (e) => {
      e.stopPropagation();
      switchView('screen-2');
    });
  }

  if (btnViewMatchedSample) {
    btnViewMatchedSample.addEventListener('click', (e) => {
      e.stopPropagation();
      switchView('screen-3');
      showToast('Viewing matched payment details and auditable match reasoning.', 'info');
    });
  }

  // Screen 3 "saved payer" link navigates to Screen 4
  if (linkToSavedPayers) {
    linkToSavedPayers.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('screen-4');
      showToast('Navigated to Saved Payers. Rule for ASHFORD PMTS LTD is highlighted.', 'info');
      if (rowRuleAshford) {
        rowRuleAshford.scrollIntoView({ behavior: 'smooth', block: 'center' });
        rowRuleAshford.style.outline = '2px solid #6366F1';
        setTimeout(() => { rowRuleAshford.style.outline = 'none'; }, 2000);
      }
    });
  }

  /* ========================================================================
     SCREEN 2: CORE RESOLUTION & INVOICE BALANCING
     ======================================================================== */
  function updateInvoicesBalancing() {
    let sum = 0;
    const rows = document.querySelectorAll('#invoices-tbody .invoice-row');
    rows.forEach((row, index) => {
      const chk = row.querySelector('.inv-checkbox');
      const amt = parseFloat(row.getAttribute('data-amt'));
      if (chk.checked) {
        row.classList.add('selected');
        sum += amt;
      } else {
        row.classList.remove('selected');
      }
    });

    const targetAmount = 47320.00;
    const variance = targetAmount - sum;

    if (valTotalApplied) {
      valTotalApplied.textContent = '$' + sum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (valVariance) {
      if (Math.abs(variance) < 0.01) {
        valVariance.textContent = '$0.00';
        valVariance.className = 'balance-val monospaced zero-variance';
        btnApplyPayment.disabled = false;
        btnApplyPayment.style.opacity = '1';
        btnApplyPayment.style.pointerEvents = 'auto';
      } else {
        const sign = variance > 0 ? '+' : '';
        valVariance.textContent = sign + '$' + variance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        valVariance.className = 'balance-val monospaced text-warning';
        btnApplyPayment.disabled = true;
        btnApplyPayment.style.opacity = '0.5';
        btnApplyPayment.style.pointerEvents = 'none';
      }
    }
  }

  invoiceCheckboxes.forEach(chk => {
    chk.addEventListener('change', () => {
      const allChecked = Array.from(invoiceCheckboxes).every(c => c.checked);
      checkAllInvoices.checked = allChecked;
      updateInvoicesBalancing();
    });
  });

  if (checkAllInvoices) {
    checkAllInvoices.addEventListener('change', () => {
      invoiceCheckboxes.forEach(chk => chk.checked = checkAllInvoices.checked);
      updateInvoicesBalancing();
    });
  }

  // Account search autocomplete
  if (inputAccountSearch && accountDropdown) {
    inputAccountSearch.addEventListener('focus', () => {
      accountDropdown.style.display = 'block';
    });

    inputAccountSearch.addEventListener('input', () => {
      accountDropdown.style.display = 'block';
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const val = item.getAttribute('data-value');
        inputAccountSearch.value = val;
        accountDropdown.style.display = 'none';
        showToast(`Selected customer account: ${val}`, 'info');
      });
    });

    document.addEventListener('click', (e) => {
      if (!inputAccountSearch.contains(e.target) && !accountDropdown.contains(e.target)) {
        accountDropdown.style.display = 'none';
      }
    });
  }

  if (btnClearAccount) {
    btnClearAccount.addEventListener('click', () => {
      inputAccountSearch.value = '';
      inputAccountSearch.focus();
    });
  }

  /* ========================================================================
     THE MOMENT THAT MATTERS: POST-APPLY INLINE CARD
     ======================================================================== */
  if (btnApplyPayment) {
    btnApplyPayment.addEventListener('click', () => {
      // Transition primary button to applied state
      btnApplyPayment.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Applied ($47,320.00)</span>
      `;
      btnApplyPayment.style.backgroundColor = '#059669';
      btnApplyPayment.disabled = true;

      // Show inline card IN PLACE smoothly
      inlineRememberPanel.style.display = 'block';
      inlineRememberPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      showToast('Payment applied to Ashford Holdings Inc. Meridian detected repeated pattern.', 'info');
    });
  }

  // Option 1: "Not now" (Equal weight)
  if (btnRememberNotNow) {
    btnRememberNotNow.addEventListener('click', () => {
      inlineRememberPanel.style.display = 'none';
      state.ashfordApplied = true;
      state.unappliedCount = Math.max(0, state.unappliedCount - 1);
      state.pendingCash -= 47320.00;

      // Update Screen 1 UI
      if (unappliedCountEl) unappliedCountEl.textContent = state.unappliedCount;
      if (statPendingAmountEl) statPendingAmountEl.textContent = '$' + state.pendingCash.toLocaleString('en-US', { minimumFractionDigits: 2 });
      if (rowAshford47k) rowAshford47k.remove();

      showToast('Payment applied manually. No standing rule created.', 'info');
      switchView('screen-1');
    });
  }

  // Option 2: "Remember this payer"
  if (btnRememberConfirm) {
    btnRememberConfirm.addEventListener('click', () => {
      state.ashfordRuleSaved = true;
      state.ashfordApplied = true;
      state.unappliedCount = Math.max(0, state.unappliedCount - 1);
      state.pendingCash -= 47320.00;

      // Update counters
      if (unappliedCountEl) unappliedCountEl.textContent = state.unappliedCount;
      if (statPendingAmountEl) statPendingAmountEl.textContent = '$' + state.pendingCash.toLocaleString('en-US', { minimumFractionDigits: 2 });
      if (rowAshford47k) rowAshford47k.remove();

      // Replace actions with post-confirm message
      document.querySelector('.evidence-actions').style.display = 'none';
      postConfirmBox.style.display = 'flex';

      showToast('Payer rule created: ASHFORD PMTS LTD → Ashford Holdings Inc', 'success');
    });
  }

  if (btnGotoScreen3FromConfirm) {
    btnGotoScreen3FromConfirm.addEventListener('click', () => {
      switchView('screen-3');
      showToast('Showing how automatic matches look with complete reasoning.', 'info');
    });
  }

  /* ========================================================================
     SCREEN 3: MATCHED PAYMENT & 1-CLICK UNAPPLY
     ======================================================================== */
  let wire8891042Unapplied = false;

  if (btnTriggerUnapply) {
    btnTriggerUnapply.addEventListener('click', () => {
      if (wire8891042Unapplied) return;
      wire8891042Unapplied = true;

      // 1-Click execution: No modal, immediate reversal
      state.unappliedCount += 1;
      state.pendingCash += 12880.00;
      if (unappliedCountEl) unappliedCountEl.textContent = state.unappliedCount;
      if (statPendingAmountEl) statPendingAmountEl.textContent = '$' + state.pendingCash.toLocaleString('en-US', { minimumFractionDigits: 2 });

      // Update status badge
      if (screen3StatusBadge) {
        screen3StatusBadge.textContent = 'Unapplied — Reversal recorded';
        screen3StatusBadge.className = 'badge badge-unmatched';
      }

      // Update unapply button
      btnTriggerUnapply.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Unapplied in 1 click</span>
      `;
      btnTriggerUnapply.disabled = true;

      // Reveal confirmation banner
      if (unapplySuccessBanner) {
        unapplySuccessBanner.style.display = 'flex';
        unapplySuccessBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      showToast('Payment WIRE-8891042 unapplied in 1 click! Reversal signal recorded for engine.', 'warning');
    });
  }

  if (btnGotoQueueFromUnapply) {
    btnGotoQueueFromUnapply.addEventListener('click', () => {
      switchView('screen-1');
      const rowAshford5 = document.querySelector('#unapplied-tbody tr[data-payer="ASHFORD PMTS LTD"]:last-child');
      if (rowAshford5) {
        rowAshford5.scrollIntoView({ behavior: 'smooth', block: 'center' });
        rowAshford5.style.outline = '2px solid #EF4444';
        setTimeout(() => { rowAshford5.style.outline = 'none'; }, 2500);
      }
    });
  }

  if (btnUndoUnapply) {
    btnUndoUnapply.addEventListener('click', () => {
      if (!wire8891042Unapplied) return;
      wire8891042Unapplied = false;

      state.unappliedCount = Math.max(5, state.unappliedCount - 1);
      state.pendingCash -= 12880.00;
      if (unappliedCountEl) unappliedCountEl.textContent = state.unappliedCount;
      if (statPendingAmountEl) statPendingAmountEl.textContent = '$' + state.pendingCash.toLocaleString('en-US', { minimumFractionDigits: 2 });

      if (screen3StatusBadge) {
        screen3StatusBadge.textContent = 'Applied automatically — 2 hours ago';
        screen3StatusBadge.className = 'badge badge-success-prominent';
      }

      btnTriggerUnapply.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
        <span>This is wrong — unapply</span>
      `;
      btnTriggerUnapply.disabled = false;

      if (unapplySuccessBanner) {
        unapplySuccessBanner.style.display = 'none';
      }

      showToast('Reversal undone. Payment WIRE-8891042 restored to auto-matched status.', 'info');
    });
  }

  if (btnAuditLogPrint) {
    btnAuditLogPrint.addEventListener('click', () => {
      showToast('Audit log exported: MERIDIAN-AUDIT-WIRE-8891042.csv downloaded', 'info');
    });
  }

  /* ========================================================================
     SCREEN 4: SAVED PAYERS & CONSEQUENCE CONFIRMATION
     ======================================================================== */
  let pendingDeleteTarget = {
    payer: 'ASHFORD PMTS LTD',
    count: '14',
    val: '$312,400',
    rowEl: rowRuleAshford
  };

  window.triggerGenericDelete = function(payerName, countStr, valStr) {
    pendingDeleteTarget = {
      payer: payerName,
      count: countStr.replace(/[^0-9]/g, ''),
      val: valStr,
      rowEl: null
    };

    document.getElementById('del-modal-payer').textContent = payerName;
    document.getElementById('del-modal-count').textContent = pendingDeleteTarget.count;
    document.getElementById('del-modal-val').textContent = valStr;
    document.getElementById('del-modal-count-text').textContent = countStr;
    document.getElementById('del-modal-val-text').textContent = valStr;

    modalDeleteRule.style.display = 'flex';
  };

  if (btnDeleteAshfordRule) {
    btnDeleteAshfordRule.addEventListener('click', () => {
      pendingDeleteTarget = {
        payer: 'ASHFORD PMTS LTD',
        count: '14',
        val: '$312,400',
        rowEl: rowRuleAshford
      };

      document.getElementById('del-modal-payer').textContent = 'ASHFORD PMTS LTD';
      document.getElementById('del-modal-count').textContent = '14';
      document.getElementById('del-modal-val').textContent = '$312,400';
      document.getElementById('del-modal-count-text').textContent = '14 payments';
      document.getElementById('del-modal-val-text').textContent = '$312,400';

      modalDeleteRule.style.display = 'flex';
    });
  }

  if (btnModalDelClose) {
    btnModalDelClose.addEventListener('click', () => {
      modalDeleteRule.style.display = 'none';
    });
  }

  // Consequence Option 1: "Just remove it"
  if (btnJustRemove) {
    btnJustRemove.addEventListener('click', () => {
      modalDeleteRule.style.display = 'none';

      if (pendingDeleteTarget.rowEl) {
        pendingDeleteTarget.rowEl.style.transition = 'opacity 0.25s ease';
        pendingDeleteTarget.rowEl.style.opacity = '0';
        setTimeout(() => {
          pendingDeleteTarget.rowEl.remove();
        }, 250);
      }

      state.savedPayersCount = Math.max(0, state.savedPayersCount - 1);
      if (savedPayersCountEl) savedPayersCountEl.textContent = state.savedPayersCount;
      const statTotalAliases = document.getElementById('stat-total-aliases');
      if (statTotalAliases) statTotalAliases.textContent = `${state.savedPayersCount} rules`;

      showToast(`Removed rule for ${pendingDeleteTarget.payer}. Future payments will require manual review.`, 'warning');
    });
  }

  // Consequence Option 2: "Review the 14 payments"
  if (btnReviewPayments) {
    btnReviewPayments.addEventListener('click', () => {
      modalDeleteRule.style.display = 'none';
      switchView('screen-3');
      showToast(`Displaying matched historical payment for ${pendingDeleteTarget.payer} ($312,400 YTD).`, 'info');
    });
  }

  /* ========================================================================
     DOCUMENT / REMITTANCE VIEWER MODAL
     ======================================================================== */
  if (chipRemittancePreview) {
    chipRemittancePreview.addEventListener('click', () => {
      modalRemittanceViewer.style.display = 'flex';
    });
  }

  if (btnCloseRemittance) {
    btnCloseRemittance.addEventListener('click', () => {
      modalRemittanceViewer.style.display = 'none';
    });
  }

  if (btnCloseRemittanceBottom) {
    btnCloseRemittanceBottom.addEventListener('click', () => {
      modalRemittanceViewer.style.display = 'none';
    });
  }

  /* ========================================================================
     PROTOTYPE GUIDE DRAWER
     ======================================================================== */
  if (btnToggleGuide) {
    btnToggleGuide.addEventListener('click', () => {
      guideDrawer.classList.toggle('open');
    });
  }

  if (btnCloseGuide) {
    btnCloseGuide.addEventListener('click', () => {
      guideDrawer.classList.remove('open');
    });
  }

  /* ========================================================================
     FILTER INPUT IN QUEUE
     ======================================================================== */
  if (queueFilterInput && unappliedTableBody) {
    queueFilterInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const rows = unappliedTableBody.querySelectorAll('tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }

  /* ========================================================================
     TOAST NOTIFICATION HELPER
     ======================================================================== */
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    `;

    if (type === 'success') {
      icon = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      `;
    } else if (type === 'warning') {
      icon = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      `;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 4000);
  }

  // Keyboard accessibility: Escape key closes active modals and guide drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalDeleteRule) modalDeleteRule.style.display = 'none';
      if (modalRemittanceViewer) modalRemittanceViewer.style.display = 'none';
      if (guideDrawer) guideDrawer.classList.remove('open');
    }
  });

});
