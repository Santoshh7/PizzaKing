// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Menu Tabs Functionality
    const menuTabs = document.querySelectorAll('.menu-tab');
    const menuCategories = document.querySelectorAll('.menu-category');

    // Add click event listener to each menu tab
    menuTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            menuTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get the category from the data attribute
            const category = this.getAttribute('data-category');
            
            // Hide all menu categories
            menuCategories.forEach(cat => cat.classList.remove('active'));
            
            // Show the selected category
            const activeCategory = document.getElementById(category);
            activeCategory.classList.add('active');
            
            // Re-initialize Add to Cart buttons in the active category
            initializeAddToCartButtons(activeCategory);
        });
    });
    
    // Category buttons functionality - connect to menu tabs
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target tab from the data attribute
            const targetTab = this.getAttribute('data-tab');
            
            // Find the corresponding menu tab and click it
            const menuTab = document.querySelector(`.menu-tab[data-category="${targetTab}"]`);
            if (menuTab) {
                // Scroll to menu section with offset for fixed header
                const menuSection = document.getElementById('menu');
                if (menuSection) {
                    window.scrollTo({
                        top: menuSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                    
                    // Slight delay before activating the tab to ensure scroll completed
                    setTimeout(() => {
                        menuTab.click();
                    }, 500);
                }
            }
        });
    });
    
    // Category item hover effect with tilt
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('mousemove', handleTilt);
        item.addEventListener('mouseleave', resetTilt);
    });
    
    function handleTilt(e) {
        const card = this;
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Calculate tilt based on mouse position
        const tiltX = (centerY - mouseY) / 10;
        const tiltY = (mouseX - centerX) / 10;
        
        // Apply tilt effect
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-10px)`;
    }
    
    function resetTilt() {
        this.style.transform = 'translateY(0)';
        this.style.transition = 'transform 0.5s ease';
    }
    
    // Function to initialize Add to Cart buttons in a specific container
    function initializeAddToCartButtons(container) {
        const buttons = container.querySelectorAll('.add-to-cart-btn');
        
        buttons.forEach(button => {
            // Remove existing click event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new click event listener
            newButton.addEventListener('click', addToCartHandler);
        });
    }
    
    // Handler function for Add to Cart button clicks
    function addToCartHandler() {
        const itemCard = this.closest('.item-card');
        const itemName = itemCard.querySelector('h3').textContent;
        const itemDescription = itemCard.querySelector('.item-description').textContent;
        
        // Check if item has size options
        const sizesElement = itemCard.querySelector('.item-sizes');
        
        if (sizesElement) {
            // Item has size options, show size selection modal
            showSizeSelectionModal(itemCard);
        } else {
            // No size options, add directly to cart
            addItemToCart(itemCard);
        }
    }

    // Function to show size selection modal
    function showSizeSelectionModal(itemCard) {
        const itemName = itemCard.querySelector('h3').textContent;
        const itemImage = itemCard.querySelector('img').src;
        const sizesElement = itemCard.querySelector('.item-sizes');
        const sizeOptions = sizesElement.querySelectorAll('.size');
        
        // Create modal elements
        const modal = document.createElement('div');
        modal.classList.add('size-selection-modal');
        
        // Get size information
        let sizeOptionsHTML = '';
        sizeOptions.forEach((sizeOption, index) => {
            const isChecked = index === 0 ? 'checked' : '';
            const sizeText = sizeOption.textContent;
            const sizeValue = sizeText.split(':')[0].trim();
            const sizePrice = parseFloat(sizeText.split('$')[1].trim());
            
            sizeOptionsHTML += `
                <div class="size-option">
                    <input type="radio" name="pizza-size" id="size-${index}" value="${sizeValue}" data-price="${sizePrice}" ${isChecked}>
                    <label for="size-${index}">${sizeText}</label>
                </div>
            `;
        });
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Choose Size for ${itemName}</h3>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="item-preview">
                        <img src="${itemImage}" alt="${itemName}">
                    </div>
                    <div class="size-options">
                        ${sizeOptionsHTML}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn secondary-btn cancel-btn">Cancel</button>
                    <button class="btn primary-btn confirm-btn">Add to Cart</button>
                </div>
            </div>
        `;
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.classList.add('modal-overlay');
        
        // Add to DOM
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
            overlay.classList.add('active');
        }, 10);
        
        // Event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const confirmBtn = modal.querySelector('.confirm-btn');
        
        // Close modal function
        const closeModal = () => {
            modal.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.removeChild(overlay);
            }, 300);
        };
        
        // Close modal events
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // Confirm selection
        confirmBtn.addEventListener('click', () => {
            const selectedSize = modal.querySelector('input[name="pizza-size"]:checked');
            const size = selectedSize.value;
            const price = parseFloat(selectedSize.getAttribute('data-price'));
            
            // Add item to cart with selected size
            addItemToCart(itemCard, size, price);
            closeModal();
        });
    }

    // Function to add item to cart
    function addItemToCart(itemCard, selectedSize = null, selectedPrice = null) {
        const itemName = itemCard.querySelector('h3').textContent;
        const itemDescription = itemCard.querySelector('.item-description').textContent;
        const itemImage = itemCard.querySelector('img').src;
        
        // Get price - handle both single price and size variations
        let itemPrice = 0;
        let itemSize = '';
        
        if (selectedSize && selectedPrice) {
            // Size was selected in modal
            itemPrice = selectedPrice;
            itemSize = selectedSize;
        } else {
            // Direct price from item card
            const priceElement = itemCard.querySelector('.item-price');
            
            try {
                if (priceElement) {
                    // Direct price element found
                    const priceText = priceElement.textContent.trim();
                    // Handle cases like "From $100"
                    if (priceText.includes('From')) {
                        itemPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                    } else {
                        itemPrice = parseFloat(priceText.replace('$', '').replace('₹', '').trim());
                    }
                }
            } catch (error) {
                console.error('Error extracting price:', error);
                itemPrice = 0; // Default to 0 if there's an error
            }
        }
        
        // Fallback to a default price if extraction failed
        if (isNaN(itemPrice) || itemPrice === 0) {
            console.warn(`Could not extract price for ${itemName}, using default value`);
            itemPrice = 100; // Default price as fallback
        }
        
        // Create item object with size if available
        const item = {
            id: Date.now().toString(), // Generate unique ID
            name: itemName + (itemSize ? ` (${itemSize})` : ''),
            description: itemDescription,
            price: itemPrice,
            image: itemImage,
            size: itemSize,
            quantity: 1
        };
        
        // Check if item with same name and size already exists in cart
        const existingItemIndex = cart.findIndex(cartItem => 
            cartItem.name === item.name && cartItem.size === item.size
        );
        
        if (existingItemIndex !== -1) {
            // If item exists, increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // If item doesn't exist, add to cart
            cart.push(item);
        }
        
        // Save cart to localStorage
        localStorage.setItem('pizzaKingCart', JSON.stringify(cart));
        
        // Update cart UI
        updateCartCount();
        showAddedToCartMessage(item.name);
        
        // If cart is open, update cart items
        if (cartSidebar.classList.contains('active')) {
            renderCartItems();
        }
    }

    // Cart Functionality
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const overlay = document.querySelector('.overlay');
    const closeCart = document.querySelector('.close-cart');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItems = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const totalPriceElement = document.querySelector('.total-price');
    const cartCountElement = document.querySelector('.cart-count');
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    
    // Initialize cart from localStorage if available
    let cart = JSON.parse(localStorage.getItem('pizzaKingCart')) || [];
    
    // Update cart count on page load
    updateCartCount();
    
    // Initialize total price display
    if (totalPriceElement) {
        totalPriceElement.textContent = '$0.00';
    }
    
    // Open cart sidebar
    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        cartSidebar.classList.add('active');
        overlay.classList.add('active');
        renderCartItems();
    });
    
    // Close cart sidebar
    closeCart.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Close cart when clicking on overlay
    overlay.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Continue shopping button
    continueShoppingBtn.addEventListener('click', function() {
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Initialize Add to Cart buttons for all menu items at page load
    const allAddToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    allAddToCartButtons.forEach(button => {
        button.addEventListener('click', addToCartHandler);
    });
    
    // Render cart items
    function renderCartItems() {
        // Clear previous items except empty message
        const cartItemElements = cartItems.querySelectorAll('.cart-item');
        cartItemElements.forEach(item => item.remove());
        
        // Show/hide empty cart message
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            totalPriceElement.textContent = '$0.00';
            return;
        } else {
            emptyCartMessage.style.display = 'none';
        }
        
        // Calculate total price
        let totalPrice = 0;
        
        // Add each item to cart
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Insert before the empty cart message
            cartItems.insertBefore(cartItemElement, emptyCartMessage);
        });
        
        // Update total price
        totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        
        // Add event listeners to quantity buttons and remove buttons
        addQuantityEventListeners();
    }
    
    // Add event listeners to quantity buttons and remove buttons
    function addQuantityEventListeners() {
        // Increase quantity
        const increaseButtons = document.querySelectorAll('.increase');
        increaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemIndex = cart.findIndex(item => item.id === itemId);
                
                if (itemIndex !== -1) {
                    cart[itemIndex].quantity += 1;
                    localStorage.setItem('pizzaKingCart', JSON.stringify(cart));
                    renderCartItems();
                    updateCartCount();
                }
            });
        });
        
        // Decrease quantity
        const decreaseButtons = document.querySelectorAll('.decrease');
        decreaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemIndex = cart.findIndex(item => item.id === itemId);
                
                if (itemIndex !== -1) {
                    if (cart[itemIndex].quantity > 1) {
                        cart[itemIndex].quantity -= 1;
                    } else {
                        cart.splice(itemIndex, 1);
                    }
                    
                    localStorage.setItem('pizzaKingCart', JSON.stringify(cart));
                    renderCartItems();
                    updateCartCount();
                }
            });
        });
        
        // Remove item
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const itemIndex = cart.findIndex(item => item.id === itemId);
                
                if (itemIndex !== -1) {
                    cart.splice(itemIndex, 1);
                    localStorage.setItem('pizzaKingCart', JSON.stringify(cart));
                    renderCartItems();
                    updateCartCount();
                }
            });
        });
    }
    
    // Update cart count
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
    
    // Show added to cart message
    function showAddedToCartMessage(itemName) {
        // Create a toast message
        const toast = document.createElement('div');
        toast.classList.add('toast-message');
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${itemName} added to cart</span>
        `;
        
        // Add toast to body
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide and remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // Close mobile menu when clicking on overlay
    overlay.addEventListener('click', function() {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

    // Checkout button functionality
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty. Add some items before checking out.');
            return;
        }
        
        // Here you would normally redirect to a checkout page
        // For demo purposes, we'll just show an alert
        alert('Proceeding to checkout...');
        
        // You could redirect to a checkout page like this:
        // window.location.href = 'checkout.html';
    });

    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100, // Offset for fixed header
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    overlay.classList.remove('active');
                }
            }
        });
    });

    // Check active link on page load
    setActiveNavLink();

    // Add animations to sections as we scroll
    function checkScroll() {
        const animatableSections = document.querySelectorAll('section');
        animatableSections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.75) {
                section.classList.add('animate');
            }
        });
    }

    // Check sections on page load
    checkScroll();

    // Check sections on scroll 
    window.addEventListener('scroll', checkScroll);

    // Add active class to nav links based on scroll position
    function setActiveNavLink() {
        let currentSection = '';
        const navLinksItems = document.querySelectorAll('.nav-links a');
        const sectionElements = document.querySelectorAll('section[id]');
        
        sectionElements.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 150) && window.pageYOffset < (sectionTop + sectionHeight - 150)) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinksItems.forEach(link => {
            link.classList.remove('active');
            if(link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Add scroll event listener
    window.addEventListener('scroll', setActiveNavLink);
}); 