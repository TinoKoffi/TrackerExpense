 // ====== AIDE : STOCKAGE ======
  const USERS_KEY = 'mt_users';
  const SESSION_KEY = 'mt_session';

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getUserTransactions(username) {
    const users = getUsers();
    return users[username]?.transactions || [];
  }

  function saveUserTransactions(username, transactions) {
    const users = getUsers();
    if (users[username]) {
      users[username].transactions = transactions;
      saveUsers(users);
    }
  }

  function getSession() {
    return localStorage.getItem(SESSION_KEY);
  }

  function setSession(username) {
    localStorage.setItem(SESSION_KEY, username);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }



  // ====== LOGIQUE D'AUTHENTIFICATION ======
  function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach((t, i) => {
      t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
    });
    document.getElementById('login-form').classList.toggle('active', tab === 'login');
    document.getElementById('register-form').classList.toggle('active', tab === 'register');
    clearErrors();
  }

  function clearErrors() {
    ['login-error', 'register-error', 'register-success'].forEach(id => {
      const el = document.getElementById(id);
      el.style.display = 'none';
      el.textContent = '';
    });
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
  }

  function showSuccess(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
  }

  function handleRegister() {
    clearErrors();
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!username || username.length < 3) return showError('register-error', 'Le pseudo doit faire au moins 3 caractères.');
    if (!/^[a-z0-9_]+$/.test(username)) return showError('register-error', 'Pseudo : lettres, chiffres et _ uniquement.');
    if (password.length < 4) return showError('register-error', 'Mot de passe trop court (min. 4 caractères).');
    if (password !== confirm) return showError('register-error', 'Les mots de passe ne correspondent pas.');

    const users = getUsers();
    if (users[username]) return showError('register-error', 'Ce pseudo est déjà pris, choisis-en un autre.');

    // Hash simple (suffisant pour localStorage)
    users[username] = { password: btoa(password), transactions: [] };
    saveUsers(users);

    showSuccess('register-success', '✅ Compte créé ! Tu peux maintenant te connecter.');
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-confirm').value = '';

    setTimeout(() => switchTab('login'), 1500);
  }

  function handleLogin() {
    clearErrors();
    const username = document.getElementById('login-username').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    if (!username || !password) return showError('login-error', 'Remplis tous les champs.');

    const users = getUsers();
    if (!users[username]) return showError('login-error', 'Utilisateur introuvable.');
    if (users[username].password !== btoa(password)) return showError('login-error', 'Mot de passe incorrect.');

    setSession(username);
    // après connexion, rediriger vers la page intermédiaire (choix de sections)
    window.location.href = 'welcome.html';
  }

  function handleLogout() {
    clearSession();
    currentUser = null;
    transactions = [];
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'block';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
  }

  // retourne à la page intermédiaire sans fermer la session
  function goBackToWelcome() {
    window.location.href = 'welcome.html';
  }

  // ====== LOGIQUE DE L'APPLICATION ======
  let currentUser = null;
  let transactions = [];
  let currentType = 'income';

  function launchApp(username) {
    currentUser = username;
    transactions = getUserTransactions(username);
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    document.getElementById('current-username').textContent = username;
    updateTransactionList();
    updateSummary();
  }

  function setType(type) {
    currentType = type;
    document.getElementById('btn-income').classList.toggle('active', type === 'income');
    document.getElementById('btn-expense').classList.toggle('active', type === 'expense');
  }

  document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const description = document.getElementById('description').value.trim();
    const rawAmount = parseFloat(document.getElementById('amount').value);

    if (!description || isNaN(rawAmount) || rawAmount <= 0) return;

    const amount = currentType === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    transactions.push({
      id: Date.now(),
      description,
      amount,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    });

    saveUserTransactions(currentUser, transactions);
    updateTransactionList();
    updateSummary();

    // montrer la popup selon le type
    // showToast(currentType);
    // this.reset();
  });

  

  /* Exemple : Toast / popup (désactivé) */
  //   function showToast(type){
  //     // récupère l'élément toast ou le crée s'il n'existe pas
  //     // let toast = document.getElementById('toast');
  //     // if(!toast){
  //     //   toast = document.createElement('div');
  //     //   toast.id = 'toast';
  //     //   toast.className = 'toast';
  //     //   toast.setAttribute('role','status');
  //     //   toast.setAttribute('aria-live','polite');
  //     //   document.body.appendChild(toast);
  //     // }
  //
  //     // emoji et texte selon le type
  //     // const emoji = type === 'income' ? '😊' : '😢';
  //     // const text = type === 'income' ? 'Ahh le warri est calé' : 'Ah champion c\'est gaté hein';
  //
  //     // met à jour le contenu et affiche
  //     // toast.className = 'toast ' + type;
  //     // toast.innerHTML = `<div class="emoji">${emoji}</div><div class="msg">${text}</div>`;
  //     // show
  //     // requestAnimationFrame(()=> toast.classList.add('show'));
  //     // auto-hide
  //     // clearTimeout(toast._hideTimer);
  //     // toast._hideTimer = setTimeout(()=>{
  //     //   toast.classList.remove('show');
  //     // }, 3200);
  //   }

  function updateTransactionList() {
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';

    if (transactions.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>Aucune transaction encore.<br>Ajoute ta première !</p></div>`;
      return;
    }

    [...transactions].reverse().forEach(t => {
      const li = document.createElement('li');
      li.className = `transaction ${t.amount > 0 ? 'income' : 'expense'}`;
      li.innerHTML = `
        <div>
          <div class="t-desc">${t.description}</div>
          ${t.date ? `<div class="t-date">${t.date}</div>` : ''}
        </div>
        <div class="t-right">
          <span class="t-amount">${formatCurrency(t.amount)}</span>
          <button class="delete-btn" onclick="removeTransaction(${t.id})" title="Supprimer">✕</button>
        </div>
      `;
      list.appendChild(li);
    });
  }

  function updateSummary() {
    const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);

    document.getElementById('balance').textContent = formatCurrency(balance);
    document.getElementById('income-amount').textContent = formatCurrency(income);
    document.getElementById('expense-amount').textContent = formatCurrency(Math.abs(expenses));
  }

  function formatCurrency(n) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
  }

  function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveUserTransactions(currentUser, transactions);
    updateTransactionList();
    updateSummary();
  }

  // ====== AUTO-CONNEXION ======
  const session = getSession();
  if (session && getUsers()[session]) {
    // Si l'utilisateur arrive depuis la page intermédiaire, ouvrir l'app directement
    const urlParams = new URLSearchParams(location.search);
    const from = urlParams.get('from');
    const shouldOpenApp = location.hash === '#app' || from === 'welcome';
    if (shouldOpenApp) {
      launchApp(session);
    } else {
      // sinon, envoyer vers la page intermédiaire
      if (location.pathname.endsWith('new.html') || location.pathname === '/' || location.pathname === '') {
        window.location.href = 'welcome.html';
      }
    }
  }