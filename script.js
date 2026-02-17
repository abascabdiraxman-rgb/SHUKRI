(function() {
    const STORAGE_KEY = 'shukri_products';
    const WHATSAPP_NUMBER = '252614837293';

    function loadProducts() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    function renderStorefront() {
        const products = loadProducts();
        const container = document.getElementById('mainContainer');
        if (!container) return;

        // Keep header and footer but rebuild product grid and total
        const header = container.querySelector('header');
        const footerNote = container.querySelector('.footer-note');
        const grid = document.getElementById('productGrid');
        const totalSection = container.querySelector('.total-section');
        const whatsappBtn = container.getElementById('whatsappBtn');

        // Clear grid
        grid.innerHTML = '';

        if (products.length === 0) {
            grid.innerHTML = '<p style="text-align:center; font-size:1.5rem; color:#8b6c51;">Wax alaab ah hadda ma jirto</p>';
        } else {
            products.forEach(prod => {
                const finalPrice = prod.discount > 0 ? (prod.price * (1 - prod.discount/100)).toFixed(2) : prod.price.toFixed(2);
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.id = prod.id;
                card.dataset.price = finalPrice;
                card.dataset.name = prod.name;
                card.innerHTML = `
                    <img class="product-image" src="${prod.image || 'https://via.placeholder.com/300x300/f7ede4/9b7f69?text=Sawir+ma+jirto'}" alt="${prod.name}">
                    <div class="product-name">${prod.name}</div>
                    <div class="price-block">
                        ${prod.discount > 0 ? `<span class="original-price">$${prod.price.toFixed(2)}</span>` : ''}
                        <span class="discounted-price">$${finalPrice}</span>
                        ${prod.discount > 0 ? `<span class="discount-badge">-${prod.discount}%</span>` : ''}
                    </div>
                    <div class="quantity-control">
                        <button class="quantity-btn" data-action="decr">−</button>
                        <input type="number" class="quantity-input" value="0" min="0" max="99" step="1" data-id="${prod.id}">
                        <button class="quantity-btn" data-action="incr">+</button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // Attach quantity events
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                if (!card) return;
                const input = card.querySelector('.quantity-input');
                let val = parseInt(input.value) || 0;
                if (e.target.dataset.action === 'incr') val = Math.min(99, val + 1);
                else if (e.target.dataset.action === 'decr') val = Math.max(0, val - 1);
                input.value = val;
                updateTotal();
            });
        });
        document.querySelectorAll('.quantity-input').forEach(inp => {
            inp.addEventListener('input', updateTotal);
        });

        function updateTotal() {
            let total = 0;
            document.querySelectorAll('.product-card').forEach(card => {
                const qty = parseInt(card.querySelector('.quantity-input').value) || 0;
                const price = parseFloat(card.dataset.price);
                total += qty * price;
            });
            document.getElementById('totalAmount').innerText = total.toFixed(2) + '$';
        }

        document.getElementById('whatsappBtn').addEventListener('click', () => {
            let message = "Salaan, waxaan dalbanay:\n";
            let total = 0;
            const items = [];
            document.querySelectorAll('.product-card').forEach(card => {
                const qty = parseInt(card.querySelector('.quantity-input').value) || 0;
                if (qty > 0) {
                    const name = card.dataset.name;
                    const price = parseFloat(card.dataset.price);
                    const itemTotal = qty * price;
                    total += itemTotal;
                    items.push(`• ${qty} x ${name} = $${itemTotal.toFixed(2)}`);
                }
            });
            if (items.length === 0) {
                alert("Fadlan dooro ugu yaraan hal alaab.");
                return;
            }
            message += items.join('\n') + `\nWadarta: $${total.toFixed(2)}`;
            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });

        updateTotal();
    }

    // Initial render
    renderStorefront();

    // Listen for storage changes (if admin updates in another tab)
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            renderStorefront();
        }
    });
})();