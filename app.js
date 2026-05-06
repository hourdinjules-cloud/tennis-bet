// --- CONFIGURATION ---
const supabaseUrl = 'https://gosoworwchygixikllgl.supabase.co'; 
const supabaseKey = 'sb_publishable_Xm_Pcvjtta8a3JsAscMFPw_vIGxYyvb'; 
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

let user = null;
let selectedMatchId = null;
let selectedPlayer = "";

// --- CONNEXION ---
async function login() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    
    const { data, error } = await _supabase.from('users').select('*').eq('username', u).eq('password', p).single();
    
    if(data) {
        user = data;
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('u-name').innerText = user.username;
        document.getElementById('u-coins').innerText = user.coins;
        nav('home', document.querySelector('.nav-item')); // Charge l'accueil
    } else {
        alert("Identifiants incorrects !");
    }
}

// --- NAVIGATION ---
function nav(page, element) {
    document.querySelectorAll('.sub-page').forEach(p => p.classList.add('hidden'));
    document.getElementById(page + '-page').classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(element) element.classList.add('active');

    if(page === 'home') loadHome();
    if(page === 'bet') loadMatches();
    if(page === 'rank') loadLeaderboard();
}

// --- LOGIQUE ACCUEIL ---
async function loadHome() {
    const { data: users } = await _supabase.from('users').select('*').order('coins', {ascending: false});
    
    if (users && users.length > 0) {
        document.getElementById('roi-content').innerText = `👑 ${users[0].username} (${users[0].rank})`;
        document.getElementById('top-day').innerText = users[0].username;
        document.getElementById('flop-day').innerText = users[users.length - 1].username;

        let clubs = {};
        users.forEach(u => {
            if(u.club) clubs[u.club] = (clubs[u.club] || 0) + u.coins;
        });

        let clubHtml = "";
        for (let c in clubs) {
            clubHtml += `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom: 1px solid #222;">
                            <span>📍 ${c}</span> <b>${clubs[c]} 🪙</b>
                         </div>`;
        }
        document.getElementById('club-scores').innerHTML = clubHtml || "Aucun club enregistré.";
    }
}

// --- LOGIQUE PARIS ---
async function loadMatches() {
    const { data } = await _supabase.from('matches').select('*');
    const container = document.getElementById('matches-list');
    container.innerHTML = "";
    
    data.forEach(m => {
        container.innerHTML += `
            <div class="match-card">
                <p style="margin:0 0 10px 0; font-size:0.8rem; color:#888;">${m.tournament}</p>
                <button class="odds-btn" onclick="openBet('${m.id}', '${m.player1}')"><span>${m.player1}</span> <span style="color:#FFD700">1.85</span></button>
                <button class="odds-btn" onclick="openBet('${m.id}', '${m.player2}')"><span>${m.player2}</span> <span style="color:#FFD700">1.85</span></button>
            </div>`;
    });
}

function openBet(id, player) {
    selectedMatchId = id;
    selectedPlayer = player;
    document.getElementById('bet-target').innerText = "Parier sur " + player;
    document.getElementById('mise-val').value = 1;
    document.getElementById('bet-modal').classList.remove('hidden');
}

function updateMise(change) {
    const input = document.getElementById('mise-val');
    let val = parseInt(input.value) + change;
    if(val >= 1 && val <= user.coins) input.value = val;
}

async function confirmBet() {
    const mise = parseInt(document.getElementById('mise-val').value);
    const { error } = await _supabase.from('users').update({ coins: user.coins - mise }).eq('id', user.id);
    
    if(!error) {
        user.coins -= mise;
        document.getElementById('u-coins').innerText = user.coins;
        alert("Pari confirmé ! Bonne chance.");
        closeModal();
    }
}

function closeModal() { document.getElementById('bet-modal').classList.add('hidden'); }

// --- LOGIQUE CLASSEMENT ---
async function loadLeaderboard() {
    const { data } = await _supabase.from('users').select('*').order('coins', {ascending: false});
    const container = document.getElementById('leaderboard');
    container.innerHTML = data.map((u, i) => `
        <div style="display:flex; justify-content:space-between; padding:15px; border-bottom:1px solid #222; background:${u.id === user.id ? '#1a1a1a' : 'transparent'}">
            <span>${i+1}. ${u.username} <small style="color:#666">(${u.rank})</small></span>
            <span style="color:#FFD700; font-weight:bold;">${u.coins} 🪙</span>
        </div>
    `).join('');
}

// --- ADMIN ---
function checkAdmin() {
    const code = document.getElementById('admin-token').value;
    if(code === "MIREMONT2026") { // TON CODE SECRET ADMIN ICI
        document.getElementById('admin-controls').classList.remove('hidden');
    } else { alert("Code incorrect"); }
}

async function createMatch() {
    const t = document.getElementById('m-tournoi').value;
    const j1 = document.getElementById('m-j1').value;
    const j2 = document.getElementById('m-j2').value;
    await _supabase.from('matches').insert([{ tournament: t, player1: j1, player2: j2 }]);
    alert("Match publié !");
    nav('bet');
}