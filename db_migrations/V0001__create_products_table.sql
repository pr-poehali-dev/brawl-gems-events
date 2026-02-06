CREATE TABLE IF NOT EXISTS t_p88482155_brawl_gems_events.products (
    id SERIAL PRIMARY KEY,
    seller_name VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    images TEXT[],
    card_number VARCHAR(19),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE INDEX idx_products_status ON t_p88482155_brawl_gems_events.products(status);
CREATE INDEX idx_products_created ON t_p88482155_brawl_gems_events.products(created_at DESC);