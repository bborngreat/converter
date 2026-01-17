/**
 * CurrencyFlow - Real-time Currency & Crypto Converter
 * Using ExchangeRate-API for 161+ currencies including GHS
 * And CoinGecko for cryptocurrencies
 */

document.addEventListener('DOMContentLoaded', function() {
    // ==================== CONFIGURATION ====================
    const EXCHANGE_API_KEY = '4e8f073c8ee9e39edba6a89d';
    const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`;
    const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
    
    // ==================== DOM ELEMENTS ====================
    const amountInput = document.getElementById('amount');
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const swapBtn = document.getElementById('swap-btn');
    const convertBtn = document.getElementById('convert-btn');
    const resultDiv = document.getElementById('result');
    const favoritesList = document.getElementById('favorites-list');
    const cryptoGrid = document.getElementById('crypto-grid');
    const actionButtons = document.querySelectorAll('.action-btn');
    
    // ==================== STATE ====================
    let exchangeRates = {};
    let cryptoRates = {};
    let favorites = JSON.parse(localStorage.getItem('currencyFavorites')) || [];
    let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    let isLoading = false;
    
    // ==================== CURRENCY DATA ====================
    // Comprehensive currency list WITHOUT emojis
    const currencies = [
        // Major Global Currencies
        { code: 'USD', name: 'US Dollar', type: 'fiat' },
        { code: 'EUR', name: 'Euro', type: 'fiat' },
        { code: 'GBP', name: 'British Pound', type: 'fiat' },
        { code: 'JPY', name: 'Japanese Yen', type: 'fiat' },
        { code: 'CAD', name: 'Canadian Dollar', type: 'fiat' },
        { code: 'AUD', name: 'Australian Dollar', type: 'fiat' },
        { code: 'CHF', name: 'Swiss Franc', type: 'fiat' },
        { code: 'CNY', name: 'Chinese Yuan', type: 'fiat' },
        
        // African Currencies (including GHS!)
        { code: 'GHS', name: 'Ghanaian Cedi', type: 'fiat' },
        { code: 'NGN', name: 'Nigerian Naira', type: 'fiat' },
        { code: 'KES', name: 'Kenyan Shilling', type: 'fiat' },
        { code: 'ZAR', name: 'South African Rand', type: 'fiat' },
        { code: 'EGP', name: 'Egyptian Pound', type: 'fiat' },
        { code: 'ETB', name: 'Ethiopian Birr', type: 'fiat' },
        { code: 'MAD', name: 'Moroccan Dirham', type: 'fiat' },
        { code: 'TZS', name: 'Tanzanian Shilling', type: 'fiat' },
        { code: 'UGX', name: 'Ugandan Shilling', type: 'fiat' },
        { code: 'RWF', name: 'Rwandan Franc', type: 'fiat' },
        { code: 'XOF', name: 'CFA Franc (BCEAO)', type: 'fiat' },
        { code: 'XAF', name: 'CFA Franc (BEAC)', type: 'fiat' },
        { code: 'GNF', name: 'Guinean Franc', type: 'fiat' },
        { code: 'SDG', name: 'Sudanese Pound', type: 'fiat' },
        { code: 'DZD', name: 'Algerian Dinar', type: 'fiat' },
        { code: 'TND', name: 'Tunisian Dinar', type: 'fiat' },
        { code: 'LYD', name: 'Libyan Dinar', type: 'fiat' },
        { code: 'MUR', name: 'Mauritian Rupee', type: 'fiat' },
        { code: 'SCR', name: 'Seychellois Rupee', type: 'fiat' },
        { code: 'BIF', name: 'Burundian Franc', type: 'fiat' },
        { code: 'CDF', name: 'Congolese Franc', type: 'fiat' },
        { code: 'DJF', name: 'Djiboutian Franc', type: 'fiat' },
        { code: 'ERN', name: 'Eritrean Nakfa', type: 'fiat' },
        { code: 'SLL', name: 'Sierra Leonean Leone', type: 'fiat' },
        
        // Asian & Pacific Currencies
        { code: 'INR', name: 'Indian Rupee', type: 'fiat' },
        { code: 'KRW', name: 'South Korean Won', type: 'fiat' },
        { code: 'SGD', name: 'Singapore Dollar', type: 'fiat' },
        { code: 'NZD', name: 'New Zealand Dollar', type: 'fiat' },
        { code: 'HKD', name: 'Hong Kong Dollar', type: 'fiat' },
        { code: 'MYR', name: 'Malaysian Ringgit', type: 'fiat' },
        { code: 'THB', name: 'Thai Baht', type: 'fiat' },
        { code: 'IDR', name: 'Indonesian Rupiah', type: 'fiat' },
        { code: 'PHP', name: 'Philippine Peso', type: 'fiat' },
        { code: 'VND', name: 'Vietnamese Dong', type: 'fiat' },
        { code: 'PKR', name: 'Pakistani Rupee', type: 'fiat' },
        { code: 'BDT', name: 'Bangladeshi Taka', type: 'fiat' },
        { code: 'LKR', name: 'Sri Lankan Rupee', type: 'fiat' },
        
        // Middle Eastern Currencies
        { code: 'AED', name: 'UAE Dirham', type: 'fiat' },
        { code: 'SAR', name: 'Saudi Riyal', type: 'fiat' },
        { code: 'QAR', name: 'Qatari Riyal', type: 'fiat' },
        { code: 'OMR', name: 'Omani Rial', type: 'fiat' },
        { code: 'KWD', name: 'Kuwaiti Dinar', type: 'fiat' },
        { code: 'BHD', name: 'Bahraini Dinar', type: 'fiat' },
        { code: 'JOD', name: 'Jordanian Dinar', type: 'fiat' },
        { code: 'LBP', name: 'Lebanese Pound', type: 'fiat' },
        { code: 'ILS', name: 'Israeli Shekel', type: 'fiat' },
        
        // European Currencies
        { code: 'SEK', name: 'Swedish Krona', type: 'fiat' },
        { code: 'NOK', name: 'Norwegian Krone', type: 'fiat' },
        { code: 'DKK', name: 'Danish Krone', type: 'fiat' },
        { code: 'PLN', name: 'Polish Zloty', type: 'fiat' },
        { code: 'CZK', name: 'Czech Koruna', type: 'fiat' },
        { code: 'HUF', name: 'Hungarian Forint', type: 'fiat' },
        { code: 'RON', name: 'Romanian Leu', type: 'fiat' },
        { code: 'BGN', name: 'Bulgarian Lev', type: 'fiat' },
        { code: 'HRK', name: 'Croatian Kuna', type: 'fiat' },
        { code: 'RSD', name: 'Serbian Dinar', type: 'fiat' },
        
        // Americas
        { code: 'MXN', name: 'Mexican Peso', type: 'fiat' },
        { code: 'BRL', name: 'Brazilian Real', type: 'fiat' },
        { code: 'ARS', name: 'Argentine Peso', type: 'fiat' },
        { code: 'CLP', name: 'Chilean Peso', type: 'fiat' },
        { code: 'COP', name: 'Colombian Peso', type: 'fiat' },
        { code: 'PEN', name: 'Peruvian Sol', type: 'fiat' },
        { code: 'UYU', name: 'Uruguayan Peso', type: 'fiat' },
        { code: 'PYG', name: 'Paraguayan Guarani', type: 'fiat' },
        { code: 'BOB', name: 'Bolivian Boliviano', type: 'fiat' },
        
        // Cryptocurrencies
        { code: 'BTC', name: 'Bitcoin', type: 'crypto' },
        { code: 'ETH', name: 'Ethereum', type: 'crypto' },
        { code: 'BNB', name: 'Binance Coin', type: 'crypto' },
        { code: 'XRP', name: 'Ripple', type: 'crypto' },
        { code: 'ADA', name: 'Cardano', type: 'crypto' },
        { code: 'SOL', name: 'Solana', type: 'crypto' },
        { code: 'DOGE', name: 'Dogecoin', type: 'crypto' },
        { code: 'DOT', name: 'Polkadot', type: 'crypto' },
        { code: 'MATIC', name: 'Polygon', type: 'crypto' },
        { code: 'LTC', name: 'Litecoin', type: 'crypto' },
        { code: 'USDT', name: 'Tether', type: 'crypto' },
        { code: 'USDC', name: 'USD Coin', type: 'crypto' }
    ];
    
    // Top cryptocurrencies for the crypto grid
    const topCryptos = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', code: 'BTC' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', code: 'ETH' },
        { id: 'binancecoin', symbol: 'bnb', name: 'Binance Coin', code: 'BNB' },
        { id: 'ripple', symbol: 'xrp', name: 'Ripple', code: 'XRP' },
        { id: 'cardano', symbol: 'ada', name: 'Cardano', code: 'ADA' },
        { id: 'solana', symbol: 'sol', name: 'Solana', code: 'SOL' },
        { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', code: 'DOGE' },
        { id: 'polkadot', symbol: 'dot', name: 'Polkadot', code: 'DOT' },
        { id: 'matic-network', symbol: 'matic', name: 'Polygon', code: 'MATIC' },
        { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', code: 'LTC' },
        { id: 'tether', symbol: 'usdt', name: 'Tether', code: 'USDT' },
        { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin', code: 'USDC' }
    ];
    
    // Crypto to CoinGecko ID mapping
    const cryptoMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binancecoin',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'SOL': 'solana',
        'DOGE': 'dogecoin',
        'DOT': 'polkadot',
        'MATIC': 'matic-network',
        'LTC': 'litecoin',
        'USDT': 'tether',
        'USDC': 'usd-coin'
    };
    
    // Crypto icon classes
    const cryptoIcons = {
        'btc': 'fab fa-bitcoin',
        'eth': 'fab fa-ethereum',
        'bnb': 'fas fa-coins',
        'xrp': 'fas fa-circle',
        'ada': 'fas fa-hexagon',
        'sol': 'fas fa-bolt',
        'doge': 'fab fa-reddit-alien',
        'dot': 'fas fa-circle-dot',
        'matic': 'fas fa-layer-group',
        'ltc': 'fab fa-ltc',
        'usdt': 'fas fa-dollar-sign',
        'usdc': 'fas fa-dollar-sign'
    };
    
    // ==================== INITIALIZATION ====================
    init();
    
    async function init() {
        console.log('Initializing CurrencyFlow...');
        
        // Show loading state
        showLoading(true);
        
        // Setup UI
        populateCurrencyDropdowns();
        setupEventListeners();
        
        // Load data
        await Promise.all([
            fetchExchangeRates(),
            fetchCryptoRates()
        ]);
        
        // Load saved state
        loadFavorites();
        
        // Perform initial conversion
        await convert();
        
        // Hide loading
        showLoading(false);
        
        console.log('App initialized successfully!');
    }
    
    // ==================== UI FUNCTIONS ====================
    function populateCurrencyDropdowns() {
        // Clear existing options
        fromCurrency.innerHTML = '';
        toCurrency.innerHTML = '';
        
        // Sort currencies for better UX
        const sortedCurrencies = [...currencies].sort((a, b) => {
            // Put popular currencies first
            const popular = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'GHS', 'NGN'];
            const aIndex = popular.indexOf(a.code);
            const bIndex = popular.indexOf(b.code);
            
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            
            // Then sort alphabetically by name
            return a.name.localeCompare(b.name);
        });
        
        // Add all currencies to dropdowns
        sortedCurrencies.forEach(currency => {
            const option1 = new Option(
                `${currency.code} - ${currency.name}`,
                currency.code
            );
            const option2 = new Option(
                `${currency.code} - ${currency.name}`,
                currency.code
            );
            
            fromCurrency.appendChild(option1);
            toCurrency.appendChild(option2);
        });
        
        // Set sensible defaults
        fromCurrency.value = 'USD';
        toCurrency.value = 'GHS'; // Default to GHS since you wanted it!
        
        console.log(`Loaded ${currencies.length} currencies into dropdowns`);
    }
    
    function setupEventListeners() {
        // Convert button
        convertBtn.addEventListener('click', convert);
        
        // Swap button
        swapBtn.addEventListener('click', swapCurrencies);
        
        // Amount input - convert on Enter key or after typing stops
        amountInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                convert();
            } else {
                debounceConvert();
            }
        });
        
        // Currency select changes
        fromCurrency.addEventListener('change', debounceConvert);
        toCurrency.addEventListener('change', debounceConvert);
        
        // Action buttons
        actionButtons.forEach(btn => {
            btn.addEventListener('click', handleActionButton);
        });
    }
    
    // ==================== API FUNCTIONS ====================
    async function fetchExchangeRates() {
        try {
            console.log('Fetching exchange rates from ExchangeRate-API...');
            
            const response = await fetch(EXCHANGE_API_URL);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.result === 'success') {
                exchangeRates = data.conversion_rates;
                exchangeRates['USD'] = 1; // Ensure USD rate exists
                
                console.log(`Loaded ${Object.keys(exchangeRates).length} exchange rates`);
                console.log('Sample rates:', {
                    'USD to GHS': exchangeRates['GHS'],
                    'USD to EUR': exchangeRates['EUR'],
                    'USD to NGN': exchangeRates['NGN']
                });
                
                showNotification('Exchange rates updated!', 'success');
                return true;
            } else {
                throw new Error(data['error-type'] || 'Unknown API error');
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            
            // Use fallback rates if API fails
            exchangeRates = getFallbackRates();
            showNotification('Using fallback rates (limited currency support)', 'warning');
            
            return false;
        }
    }
    
    async function fetchCryptoRates() {
        try {
            console.log('Fetching cryptocurrency rates...');
            
            const ids = topCryptos.map(c => c.id).join(',');
            const url = `${COINGECKO_API_URL}?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`CoinGecko API Error: ${response.status}`);
            }
            
            cryptoRates = await response.json();
            
            // Add crypto rates to exchangeRates for conversion (priced in USD)
            topCryptos.forEach(crypto => {
                if (cryptoRates[crypto.id]?.usd) {
                    exchangeRates[crypto.code] = 1 / cryptoRates[crypto.id].usd; // USD per crypto
                }
            });
            
            // Update crypto display
            displayCryptoCards();
            
            console.log('Crypto rates loaded successfully');
            return true;
        } catch (error) {
            console.error('Error fetching crypto rates:', error);
            showNotification('Cryptocurrency rates failed to load', 'error');
            return false;
        }
    }
    
    // ==================== CONVERSION LOGIC ====================
    async function convert() {
        if (isLoading) return;
        
        const amount = parseFloat(amountInput.value);
        const from = fromCurrency.value;
        const to = toCurrency.value;
        
        // Input validation
        if (isNaN(amount) || amount <= 0) {
            showError('Please enter a valid amount greater than 0');
            return;
        }
        
        if (from === to) {
            showResult(amount, from, amount, to, 1);
            return;
        }
        
        // Show loading
        showLoading(true, 'Converting...');
        
        try {
            let rate, convertedAmount;
            
            // Check if it's a crypto conversion
            const isCryptoFrom = cryptoMap[from];
            const isCryptoTo = cryptoMap[to];
            
            if (isCryptoFrom || isCryptoTo) {
                // Handle crypto conversions
                const result = await convertWithCrypto(amount, from, to);
                rate = result.rate;
                convertedAmount = result.convertedAmount;
            } else {
                // Fiat to fiat conversion
                rate = calculateFiatRate(from, to);
                convertedAmount = amount * rate;
            }
            
            // Display result
            showResult(amount, from, convertedAmount, to, rate);
            
            // Add to history
            addToHistory(amount, from, convertedAmount, to, rate);
            
        } catch (error) {
            console.error('Conversion error:', error);
            showError(`Conversion failed: ${error.message}`);
        } finally {
            showLoading(false);
        }
    }
    
    function calculateFiatRate(from, to) {
        // All rates in exchangeRates are relative to USD
        const fromRate = exchangeRates[from];
        const toRate = exchangeRates[to];
        
        if (!fromRate || !toRate) {
            throw new Error(`Unsupported currency pair: ${from} to ${to}`);
        }
        
        // Convert from -> USD -> to
        return toRate / fromRate;
    }
    
    async function convertWithCrypto(amount, from, to) {
        let fromRate, toRate;
        
        // Get from currency rate (in USD)
        if (cryptoMap[from]) {
            // It's a cryptocurrency
            const cryptoId = cryptoMap[from];
            if (!cryptoRates[cryptoId]?.usd) {
                // Fetch fresh rate if not available
                await fetchCryptoRates();
            }
            fromRate = 1 / cryptoRates[cryptoId]?.usd; // USD per crypto
        } else {
            // It's a fiat currency
            fromRate = exchangeRates[from];
        }
        
        // Get to currency rate (in USD)
        if (cryptoMap[to]) {
            // It's a cryptocurrency
            const cryptoId = cryptoMap[to];
            if (!cryptoRates[cryptoId]?.usd) {
                // Fetch fresh rate if not available
                await fetchCryptoRates();
            }
            toRate = 1 / cryptoRates[cryptoId]?.usd; // USD per crypto
        } else {
            // It's a fiat currency
            toRate = exchangeRates[to];
        }
        
        if (!fromRate || !toRate) {
            throw new Error(`Unable to convert ${from} to ${to}`);
        }
        
        // Calculate rate and converted amount
        const rate = toRate / fromRate;
        const convertedAmount = amount * rate;
        
        return { rate, convertedAmount };
    }
    
    // ==================== UI UPDATE FUNCTIONS ====================
    function showResult(amount, from, convertedAmount, to, rate) {
        const formattedAmount = formatNumber(amount, from);
        const formattedConverted = formatNumber(convertedAmount, to);
        
        resultDiv.innerHTML = `
            <div class="result-content">
                <div class="from-amount">${formattedAmount} ${from}</div>
                <div class="equals">=</div>
                <div class="converted-amount">${formattedConverted} ${to}</div>
                <div class="conversion-rate">
                    1 ${from} = ${formatNumber(rate, to)} ${to}
                </div>
                <div class="conversion-time">
                    <small><i class="fas fa-clock"></i> ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                </div>
            </div>
        `;
    }
    
    function showError(message) {
        resultDiv.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <div>${message}</div>
            </div>
        `;
    }
    
    function showLoading(show, message = 'Loading...') {
        isLoading = show;
        
        if (show) {
            convertBtn.innerHTML = `<span class="loading"></span> ${message}`;
            convertBtn.disabled = true;
        } else {
            convertBtn.innerHTML = `<i class="fas fa-calculator"></i> Convert Now`;
            convertBtn.disabled = false;
        }
    }
    
    function displayCryptoCards() {
        cryptoGrid.innerHTML = '';
        
        topCryptos.forEach(crypto => {
            const data = cryptoRates[crypto.id];
            if (!data?.usd) return;
            
            const price = data.usd;
            const change = data.usd_24h_change || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSymbol = change >= 0 ? '+' : '';
            const iconClass = cryptoIcons[crypto.symbol] || 'fas fa-coins';
            
            const cryptoCard = document.createElement('div');
            cryptoCard.className = 'crypto-card';
            cryptoCard.innerHTML = `
                <div class="crypto-header">
                    <div>
                        <div class="crypto-name">${crypto.name}</div>
                        <div class="crypto-symbol">${crypto.symbol.toUpperCase()}</div>
                    </div>
                    <div class="crypto-icon">
                        <i class="${iconClass}"></i>
                    </div>
                </div>
                <div class="crypto-price">$${price.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: price < 1 ? 6 : 2 
                })}</div>
                <div class="crypto-change ${changeClass}">
                    <i class="fas fa-${change >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                    ${changeSymbol}${Math.abs(change).toFixed(2)}%
                </div>
                <button class="use-crypto-btn" data-code="${crypto.code}">
                    Use ${crypto.code}
                </button>
            `;
            
            // Add click handler for the "Use" button
            const useBtn = cryptoCard.querySelector('.use-crypto-btn');
            useBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                fromCurrency.value = crypto.code;
                amountInput.value = '1';
                convert();
            });
            
            cryptoGrid.appendChild(cryptoCard);
        });
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    function swapCurrencies() {
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
        
        // Add swap animation
        swapBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            swapBtn.style.transform = 'rotate(0deg)';
        }, 300);
        
        convert();
    }
    
    function formatNumber(num, currencyCode) {
        // Determine decimal places based on currency
        let options = {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        };
        
        // Crypto or very small currencies need more precision
        if (cryptoMap[currencyCode] || Math.abs(num) < 0.01) {
            options.maximumFractionDigits = 8;
        }
        
        // Japanese Yen doesn't use decimal places
        if (currencyCode === 'JPY') {
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
        }
        
        return num.toLocaleString(undefined, options);
    }
    
    function getFallbackRates() {
        // Comprehensive fallback rates including GHS and African currencies
        return {
            'USD': 1,
            'EUR': 0.92,
            'GBP': 0.79,
            'JPY': 148.5,
            'CAD': 1.35,
            'AUD': 1.52,
            'CHF': 0.88,
            'CNY': 7.18,
            
            // African currencies
            'GHS': 12.5,    // Ghanaian Cedi
            'NGN': 900,     // Nigerian Naira
            'KES': 160,     // Kenyan Shilling
            'ZAR': 19,      // South African Rand
            'EGP': 31,      // Egyptian Pound
            'ETB': 56.5,    // Ethiopian Birr
            'MAD': 10.1,    // Moroccan Dirham
            'TZS': 2500,    // Tanzanian Shilling
            'UGX': 3700,    // Ugandan Shilling
            'RWF': 1280,    // Rwandan Franc
            'XOF': 610,     // CFA Franc (BCEAO)
            'XAF': 610,     // CFA Franc (BEAC)
            
            // Other major currencies
            'INR': 83,
            'KRW': 1330,
            'SGD': 1.34,
            'NZD': 1.64,
            'HKD': 7.82,
            'MYR': 4.71,
            'THB': 35.5,
            'IDR': 15600,
            'PHP': 56,
            'VND': 24300,
            'PKR': 280,
            'BDT': 110,
            'LKR': 320,
            
            // Middle East
            'AED': 3.67,
            'SAR': 3.75,
            'QAR': 3.64,
            'OMR': 0.385,
            'KWD': 0.308,
            'BHD': 0.377,
            
            // Americas
            'MXN': 17.1,
            'BRL': 4.95,
            'ARS': 820,
            'CLP': 920,
            'COP': 3900,
            'PEN': 3.71
        };
    }
    
    function debounceConvert() {
        clearTimeout(window.convertDebounce);
        window.convertDebounce = setTimeout(convert, 800);
    }
    
    // ==================== FAVORITES & HISTORY ====================
    function addToHistory(amount, from, convertedAmount, to, rate) {
        const conversion = {
            id: Date.now(),
            amount,
            from,
            convertedAmount,
            to,
            rate,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };
        
        conversionHistory.unshift(conversion);
        
        // Keep only last 100 conversions
        if (conversionHistory.length > 100) {
            conversionHistory = conversionHistory.slice(0, 100);
        }
        
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
    }
    
    function loadFavorites() {
        favoritesList.innerHTML = '';
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="empty-state">
                    <i class="far fa-star"></i>
                    <p>No favorites yet</p>
                    <small>Convert something and click "Favorite" to save it</small>
                </div>
            `;
            return;
        }
        
        favorites.forEach((fav, index) => {
            const favElement = document.createElement('div');
            favElement.className = 'favorite-item';
            favElement.innerHTML = `
                <div class="fav-content">
                    <div class="fav-pair">
                        <span class="fav-from">${formatNumber(fav.amount, fav.from)} ${fav.from}</span>
                        <i class="fas fa-arrow-right"></i>
                        <span class="fav-to">${formatNumber(fav.convertedAmount, fav.to)} ${fav.to}</span>
                    </div>
                    <div class="fav-details">
                        <span class="fav-rate">1 ${fav.from} = ${formatNumber(fav.rate, fav.to)} ${fav.to}</span>
                        <span class="fav-date">${fav.date}</span>
                    </div>
                </div>
                <div class="fav-actions">
                    <button class="fav-use-btn" title="Use this conversion">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="fav-remove-btn" data-index="${index}" title="Remove from favorites">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Use favorite
            favElement.querySelector('.fav-use-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                amountInput.value = fav.amount;
                fromCurrency.value = fav.from;
                toCurrency.value = fav.to;
                convert();
            });
            
            // Remove favorite
            favElement.querySelector('.fav-remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFavorite(index);
            });
            
            favoritesList.appendChild(favElement);
        });
    }
    
    function addToFavorites() {
        const amount = parseFloat(amountInput.value);
        const from = fromCurrency.value;
        const to = toCurrency.value;
        
        if (isNaN(amount) || amount <= 0) {
            showNotification('Please enter a valid amount first', 'error');
            return;
        }
        
        // Get the current conversion result
        const resultText = resultDiv.querySelector('.converted-amount');
        if (!resultText) {
            showNotification('Please convert something first', 'error');
            return;
        }
        
        // Extract rate from result
        const rateText = resultDiv.querySelector('.conversion-rate').textContent;
        const rateMatch = rateText.match(/1 \w+ = ([\d,.]+)/);
        const rate = rateMatch ? parseFloat(rateMatch[1].replace(/,/g, '')) : null;
        
        if (!rate) {
            showNotification('Could not save favorite', 'error');
            return;
        }
        
        const convertedAmount = amount * rate;
        
        // Check if already in favorites
        const exists = favorites.some(fav => 
            Math.abs(fav.amount - amount) < 0.01 &&
            fav.from === from &&
            fav.to === to
        );
        
        if (exists) {
            showNotification('Already in favorites!', 'warning');
            return;
        }
        
        const favorite = {
            id: Date.now(),
            amount,
            from,
            convertedAmount,
            to,
            rate,
            date: new Date().toLocaleDateString()
        };
        
        favorites.unshift(favorite);
        
        // Keep only last 20 favorites
        if (favorites.length > 20) {
            favorites = favorites.slice(0, 20);
        }
        
        localStorage.setItem('currencyFavorites', JSON.stringify(favorites));
        loadFavorites();
        
        showNotification('Added to favorites!', 'success');
    }
    
    function removeFavorite(index) {
        favorites.splice(index, 1);
        localStorage.setItem('currencyFavorites', JSON.stringify(favorites));
        loadFavorites();
        showNotification('Removed from favorites', 'info');
    }
    
    function clearHistory() {
        if (conversionHistory.length === 0) {
            showNotification('No history to clear', 'info');
            return;
        }
        
        if (confirm('Clear all conversion history?')) {
            conversionHistory = [];
            localStorage.setItem('conversionHistory', JSON.stringify([]));
            showNotification('History cleared', 'success');
        }
    }
    
    // ==================== ACTION BUTTON HANDLER ====================
    function handleActionButton(e) {
        const action = e.currentTarget.dataset.action;
        
        switch(action) {
            case 'favorite':
                addToFavorites();
                break;
                
            case 'history':
                if (conversionHistory.length > 0) {
                    showHistoryModal();
                } else {
                    showNotification('No conversion history yet', 'info');
                }
                break;
                
            case 'reset':
                amountInput.value = '1';
                fromCurrency.value = 'USD';
                toCurrency.value = 'GHS';
                resultDiv.innerHTML = `
                    <div class="result-placeholder">
                        <i class="fas fa-coins"></i>
                        <p>Enter amount and select currencies to convert</p>
                    </div>
                `;
                showNotification('Reset to defaults', 'info');
                break;
        }
    }
    
    // ==================== NOTIFICATION SYSTEM ====================
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                  type === 'error' ? 'exclamation-circle' : 
                                  type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Style it
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00FF88' : 
                         type === 'error' ? '#FF6B6B' : 
                         type === 'warning' ? '#F59E0B' : '#3B82F6'};
            color: #0A0A0F;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 350px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        document.body.appendChild(notification);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // Add animation styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: #0A0A0F;
                    cursor: pointer;
                    font-size: 1rem;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                .notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ==================== HISTORY MODAL ====================
    function showHistoryModal() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'history-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-history"></i> Conversion History</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body" id="history-list">
                    ${conversionHistory.length === 0 ? 
                        '<div class="empty-history">No conversion history yet</div>' : 
                        conversionHistory.map(conv => `
                            <div class="history-item">
                                <div class="history-conversion">
                                    <span class="history-from">${formatNumber(conv.amount, conv.from)} ${conv.from}</span>
                                    <i class="fas fa-arrow-right"></i>
                                    <span class="history-to">${formatNumber(conv.convertedAmount, conv.to)} ${conv.to}</span>
                                </div>
                                <div class="history-details">
                                    <span class="history-rate">1 ${conv.from} = ${formatNumber(conv.rate, conv.to)} ${conv.to}</span>
                                    <span class="history-time">${new Date(conv.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>
                        `).join('')}
                </div>
                <div class="modal-footer">
                    <button class="modal-btn clear-history-btn">
                        <i class="fas fa-trash"></i> Clear History
                    </button>
                    <button class="modal-btn close-modal-btn">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;
        
        // Style modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: rgba(25, 25, 35, 0.95);
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--light-text);
        `;
        
        document.body.appendChild(modal);
        
        // Close button
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Clear history button
        modal.querySelector('.clear-history-btn').addEventListener('click', () => {
            clearHistory();
            modal.remove();
        });
        
        // Close button
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            modal.remove();
        });
    }
    
    // ==================== AUTO REFRESH ====================
    // Refresh rates every 5 minutes
    setInterval(async () => {
        await fetchExchangeRates();
        await fetchCryptoRates();
        
        // Re-convert with new rates
        if (parseFloat(amountInput.value) > 0) {
            convert();
        }
    }, 5 * 60 * 1000); // 5 minutes
    
    // ==================== CONSOLE HELPER ====================
    console.log(`
    =============================================
    CurrencyFlow Converter Initialized
    =============================================
    Version: 2.0 (Dark Glassmorphism Theme)
    Supported Currencies: ${currencies.length}
    Top Cryptos: ${topCryptos.length}
    API: ExchangeRate-API + CoinGecko
    Theme: Dark Glassmorphism
    =============================================
    `);
});
