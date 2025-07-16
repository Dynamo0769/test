document.addEventListener('DOMContentLoaded', () => {

    // --- Component & Data Loading ---
    async function loadComponent(url, placeholderId) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            document.getElementById(placeholderId).innerHTML = await response.text();
        } catch (error) { console.error(`Error loading component: ${error}`); }
    }

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
            return await response.json();
        } catch (error) { console.error(error); return null; }
    }

    // --- Dynamic Page Builders ---
    async function buildProductGrid(products) {
        const container = document.getElementById('product-grid-container');
        if (!container) return;
        container.innerHTML = products.map(p => `
            <div class="product-card">
                <img src="${p.imageUrl}" alt="${p.name}">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>${p.features[0]}</p>
                    <a href="product-details.html?id=${p.id}" class="btn-details">More Details</a>
                </div>
            </div>`).join('');
    }

    // --- Script Initializers & Page Routing ---
    const page = window.location.pathname.split('/').pop() || 'index.html';

    async function loadPage() {
        // Determine which header to load
        let headerUrl = 'components/header-public.html'; // Default for public pages
        if (page === 'dashboard.html' || page === 'product-details.html') {
            headerUrl = 'components/header-dashboard.html';
        }

        // Load header and footer if placeholders exist
        if (document.getElementById('header-placeholder')) {
            await loadComponent(headerUrl, 'header-placeholder');
        }
        if (document.getElementById('footer-placeholder')) {
            await loadComponent('components/footer.html', 'footer-placeholder');
        }

        // Run page-specific logic AFTER components are loaded
        if (page === 'index.html' || page === '' || page === 'dashboard.html') {
            const products = await fetchData('data/products.json');
            if (products) await buildProductGrid(products);
        }
        // Add other page-specific logic here later (login, register, product-details)
        
        // Initialize universal scripts
        if (document.querySelector('.main-nav')) {
            // Add any navigation-related scripts here
        }
    }

    loadPage();
});
