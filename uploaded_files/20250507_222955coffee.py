
import requests
from bs4 import BeautifulSoup
import pandas as pd

# URL страницы
url = 'https://tastycoffee.ru/personal'

# Отправляем GET-запрос на страницу
response = requests.get(url)

# Проверяем успешность запроса
if response.status_code == 200:
    # Создаем объект BeautifulSoup для парсинга HTML
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Найдем все элементы, содержащие информацию о кофе
    # Пример: находим все карточки товара
    coffee_items = soup.find_all('div', class_='coffee-item-class')  # Замените 'coffee-item-class' на реальный класс элементов карточек

    # Списки для хранения данных
    coffee_names = []
    coffee_prices = []

    # Извлекаем данные из каждого элемента
    for item in coffee_items:
        name = item.find('span', class_='coffee-name-class').text.strip()  # Замените 'coffee-name-class' на реальный класс названия кофе
        price = item.find('span', class_='coffee-price-class').text.strip()  # Замените 'coffee-price-class' на реальный класс цены

        coffee_names.append(name)
        coffee_prices.append(price)

    # Создаем DataFrame из собранных данных
    data = pd.DataFrame({
        'Название кофе': coffee_names,
        'Цена': coffee_prices
    })

    # Сохраняем DataFrame в Excel файл
    data.to_excel('coffee_prices.xlsx', index=False)
    print('Данные успешно сохранены в coffee_prices.xlsx')
else:
    print('Ошибка при получении страницы:', response.status_code)
