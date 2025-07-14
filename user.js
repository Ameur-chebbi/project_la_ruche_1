import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bqzaabymdpepkrhtgbty.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxemFhYnltZHBlcGtyaHRnYnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjgwNDUsImV4cCI6MjA2NzgwNDA0NX0.Dj-IT1aMnHsfvO3KNeCFw3RNn-k4OeNUielzaf28DAA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function fetchUser(identifiant) {
    const { data, error } = await supabase
        .from('inscriptions')
        .select('*')
        .eq('identifiant', identifiant)
        .single();
    if (error || !data) {
        document.getElementById('userInfo').innerHTML = '<p>Utilisateur non trouvé.</p>';
        return;
    }
    renderUserInfo(data);
}

function renderUserInfo(user) {
    document.getElementById('userInfo').innerHTML = `
        <h2>${user.nom} ${user.prenom}</h2>
        <p><strong>Identifiant:</strong> ${user.identifiant}</p>
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
    `;
}

const identifiant = getQueryParam('id');
if (identifiant) {
    fetchUser(identifiant);
} else {
    document.getElementById('userInfo').innerHTML = '<p>Aucun identifiant fourni.</p>';
}