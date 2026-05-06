// CONFIGURATION SUPABASE (Infos issues de tes captures d'écran)
const supabaseUrl = 'https://gosoworwchygixikllgl.supabase.co';
const supabaseKey = 'sb_publishable_Xm_Pcvjtta8a3JsAscMFPw_vIGxYyvb';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// VARIABLES D'ÉTAT
let currentUser = null;

// AU CHARGEMENT DE LA PAGE
document.addEventListener('DOMContentLoaded', () => {
    // Si on est sur l'index, on charge les scores
    if (document.getElementById('roi-content')) {
        loadHomeData();
    }
});

// FONCTION DE CONNEXION
async function login() {
    const userVal = document.getElementById('username').value.trim();
    const passVal = document.getElementById('password').value.trim();

    if (!userVal || !passVal) {
        alert("Remplis tous les champs !");
        return;
    }

    try {
        const { data, error } = await _supabase
            .from('users')
            .select('*')
            .eq('username', userVal)
            .eq('password', passVal)
            .single();

        if (error || !data) {
            alert("Identifiants incorrects...");
        } else {
            currentUser = data;
            localStorage.setItem('tennisUser', JSON.stringify(data));
            alert(`Bienvenue ${data.username} !`);
            // Redirection ou mise à jour de l'interface
            window.location.reload(); 
        }
    } catch (err) {
        console.error(err);
        alert("Erreur de connexion au serveur.");
    }
}

// CHARGEMENT DES DONNÉES DE L'ACCUEIL (Top/Flop/Clubs)
async function loadHomeData() {
    try {
        const { data: users, error } = await _supabase
            .from('users')
            .select('*')
            .order('coins', { ascending: false });

        if (error) throw error;

        if (users && users.length > 0) {
            // 1. ROI DE LA PERF (Le premier)
            document.getElementById('roi-content').innerHTML = `👑 ${users[0].username} (${users[0].coins} coins)`;
            
            // 2. TOP & FLOP DU JOUR
            document.getElementById('top-day').innerText = users[0].username;
            document.getElementById('flop-day').innerText = users[users.length - 1].username;

            // 3. GUERRE DES CLUBS
            let clubScores = {};
            users.forEach(u => {
                if(u.club) {
                    clubScores[u.club] = (clubScores[u.club] || 0) + u.coins;
                }
            });

            let clubHtml = "";
            const sortedClubs = Object.entries(clubScores).sort((a,b) => b[1] - a[1]);
            
            sortedClubs.forEach(([name, score]) => {
                clubHtml += `
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px; background:#222; padding:8px; border-radius:5px;">
                        <span>📍 ${name}</span>
                        <span style="color:#e7ff00; font-weight:bold;">${score} pts</span>
                    </div>`;
            });
            document.getElementById('club-scores').innerHTML = clubHtml || "Aucun club en lice";
        }
    } catch (err) {
        console.error("Erreur chargement accueil:", err);
    }
}

// GESTIONNAIRE DE NAVIGATION (Simple)
function showPage(pageId) {
    // Cache toutes les sections
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Affiche la section demandée
    document.getElementById(pageId).classList.add('active');
}
