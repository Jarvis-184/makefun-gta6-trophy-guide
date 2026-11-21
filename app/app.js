let trophies = [];
let completedTrophies = JSON.parse(localStorage.getItem('gta6-trophies-completed')) || [];

async function init() {
    const response = await fetch('data/trophies.json');
    const data = await response.json();
    trophies = data.trophies;
    render();
    document.getElementById('search').addEventListener('input', render);
    document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        render();
    }));
}

function toggleTrophy(name) {
    if (completedTrophies.includes(name)) {
        completedTrophies = completedTrophies.filter(t => t !== name);
    } else {
        completedTrophies.push(name);
    }
    localStorage.setItem('gta6-trophies-completed', JSON.stringify(completedTrophies));
    render();
}

function render() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const activeTier = document.querySelector('.filter-btn.active').dataset.tier;
    const container = document.getElementById('trophies-container');
    container.innerHTML = '';
    
    const filtered = trophies.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm) || t.description.toLowerCase().includes(searchTerm);
        const matchesTier = activeTier === 'all' || t.grade === activeTier;
        return matchesSearch && matchesTier;
    });

    filtered.forEach(t => {
        const card = document.createElement('div');
        card.className = 'trophy-card';
        card.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" ${completedTrophies.includes(t.name) ? 'checked' : ''} onchange="toggleTrophy('${t.name.replace(/'/g, "\\'")}')">
            </div>
            <span class="grade ${t.grade}">${t.grade}</span>
            <h3>${t.name}</h3>
            <p>${t.description}</p>
            <p><small>${t.guide}</small></p>
        `;
        container.appendChild(card);
    });

    document.getElementById('progress-bar-fill').style.width = `${(completedTrophies.length / trophies.length) * 100}%`;
    document.getElementById('progress-text').innerText = `${completedTrophies.length} / ${trophies.length} Trophies`;
}

init();
