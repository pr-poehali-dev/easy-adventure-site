-- Создание таблицы настроек сайта
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL DEFAULT 'EasyAdventure',
    site_description TEXT DEFAULT 'Профессиональная прокачка аккаунтов Henshin Impact',
    contact_telegram VARCHAR(255) DEFAULT 't.me/VirtMG',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы услуг
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы заявок
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id),
    phone VARCHAR(50) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    telegram VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных настроек
INSERT INTO site_settings (site_name, site_description, contact_telegram) 
VALUES ('EasyAdventure', 'Профессиональная прокачка аккаунтов Henshin Impact', 't.me/VirtMG');

-- Вставка примеров услуг
INSERT INTO services (title, description, requirements, price) VALUES
('Прокачка до AR 30', 'Полная прокачка вашего аккаунта до ранга приключений 30. Выполнение квестов и прохождение подземелий', 'Логин и пароль от аккаунта\nОтсутствие активных 2FA', 1500.00),
('Прокачка до AR 45', 'Прокачка аккаунта до ранга приключений 45. Разблокировка всех регионов и ключевых механик', 'Логин и пароль от аккаунта\nОтсутствие привязки к телефону', 3000.00),
('Фарм ресурсов', 'Сбор необходимых материалов для прокачки персонажей и оружия', 'Список необходимых ресурсов\nДоступ к аккаунту', 800.00);