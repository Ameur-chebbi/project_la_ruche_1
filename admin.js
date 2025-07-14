import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bqzaabymdpepkrhtgbty.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxemFhYnltZHBlcGtyaHRnYnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjgwNDUsImV4cCI6MjA2NzgwNDA0NX0.Dj-IT1aMnHsfvO3KNeCFw3RNn-k4OeNUielzaf28DAA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userList = document.getElementById('userList');
const userDetails = document.getElementById('userDetails');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchGouvernorat = document.getElementById('searchGouvernorat');
const searchCadreContact = document.getElementById('searchCadreContact');
const searchProfession = document.getElementById('searchProfession');
const searchType = document.getElementById('searchType');

async function fetchUsers(search = '') {
    let value = '';
    let field = 'nom';
    if (searchType && searchType.value) {
        field = searchType.value;
    }
    if (field === 'nom') {
        value = searchInput.value.trim();
    } else if (field === 'gouvernorat') {
        value = searchGouvernorat.value;
    } else if (field === 'cadre_contact') {
        value = searchCadreContact.value;
    } else if (field === 'profession') {
        value = searchProfession.value;
    }
    if (!value) {
        userList.innerHTML = '';
        return;
    }
    let query = supabase.from('inscriptions').select('*').order('date_du_contact', { ascending: false }).limit(20);
    query = query.ilike(field, `%${value}%`);
    const { data, error } = await query;
    if (error) {
        userList.innerHTML = '<li>Erreur de chargement</li>';
        return;
    }
    renderUserList(data);
}

function renderUserList(users) {
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.nom} ${user.prenom}`;
        li.style.cursor = 'pointer';
        li.onclick = () => {
            window.location.href = `user.html?id=${encodeURIComponent(user.identifiant)}`;
        };
        userList.appendChild(li);
    });
}

function showUserDetails(user) {
    userDetails.style.display = 'block';
    userDetails.innerHTML = `
        <h2>${user.nom} ${user.prenom}</h2>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Téléphone:</strong> ${user.telephone}</p>
        <p><strong>Date de naissance:</strong> ${user.date_naissance}</p>
        <p><strong>Gouvernorat:</strong> ${user.gouvernorat}</p>
        <p><strong>Délégation:</strong> ${user.delegation}</p>
        <p><strong>Niveau d'étude:</strong> ${user.niveau_etude}</p>
        <p><strong>Profession:</strong> ${user.profession}</p>
        <p><strong>Cadre de contact:</strong> ${user.cadre_contact}</p>
        <p><strong>Précisions:</strong> ${user.precisions || ''}</p>
        <p><strong>Date du contact:</strong> ${user.date_du_contact}</p>
        <p><strong>Date du contact suivant:</strong> ${user.date_du_contact_suivant}</p>
        <p><strong>Agent:</strong> ${user.agent || ''}</p>
        <p><strong>Rôle:</strong> ${user.role}</p>
        <button onclick="this.parentElement.style.display='none'">Fermer</button>
    `;
}


function updateSearchFields() {
    if (!searchType) return;
    const type = searchType.value;
    searchInput.style.display = type === 'nom' ? 'block' : 'none';
    searchGouvernorat.style.display = type === 'gouvernorat' ? 'block' : 'none';
    searchCadreContact.style.display = type === 'cadre_contact' ? 'block' : 'none';
    searchProfession.style.display = type === 'profession' ? 'block' : 'none';
}

searchType.addEventListener('change', () => {
    updateSearchFields();
    // Reset all fields
    searchInput.value = '';
    searchGouvernorat.value = '';
    searchCadreContact.value = '';
    searchProfession.value = '';
    userList.innerHTML = '';
});

searchBtn.addEventListener('click', () => {
    fetchUsers();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchUsers();
    }
});
searchGouvernorat.addEventListener('change', () => fetchUsers());
searchCadreContact.addEventListener('change', () => fetchUsers());
searchProfession.addEventListener('change', () => fetchUsers());

// Initial state
updateSearchFields();

// Do not fetch users on page load