1. Тест на добавление записи:
```python
def test_add_record():
    file_path = "test_expenses.txt"
    expense_tracker = ExpenseTracker(file_path)

    expense_tracker.add_record()

    with open(file_path, 'r') as file:
        lines = file.readlines()
        assert len(lines) == 1

    # Проверка содержимого добавленной записи
    record = lines[0].strip().split(',')
    assert record[0] == "01.01.2022"  # Проверяемая дата
    assert record[1] == "расход"  # Проверяемая категория
    assert float(record[2]) == 100.0  # Проверяемая сумма
    assert record[3] == "Покупка продуктов"  # Проверяемое описание
```

2. Тест на изменение записи:
```python
def test_edit_record():
    file_path = "test_expenses.txt"
    expense_tracker = ExpenseTracker(file_path)

    # Добавляем запись для редактирования
    expense_tracker.add_record()

    # Редактируем добавленную запись
    expense_tracker.edit_record()

    with open(file_path, 'r') as file:
        lines = file.readlines()
        assert len(lines) == 1

    # Проверка содержимого отредактированной записи
    record = lines[0].strip().split(',')
    assert record[0] == "02.01.2022"  # Проверяемая новая дата
    assert record[1] == "доход"  # Проверяемая новая категория
    assert float(record[2]) == 200.0  # Проверяемая новая сумма
    assert record[3] == "Зарплата"  # Проверяемое новое описание
```

3. Тест на поиск записей:
```python
def test_search_records():
    file_path = "test_expenses.txt"
    expense_tracker = ExpenseTracker(file_path)

    # Добавляем несколько записей для поиска
    expense_tracker.add_record()
    expense_tracker.add_record()

    # Ищем записи по ключевому слову "продуктов"
    found_records = expense_tracker.search_records("продуктов")

    assert len(found_records) == 1

    # Проверка содержимого найденной записи
    record = found_records[0]
    assert record.date == "01.01.2022"
    assert record.category == "расход"
    assert record.amount == 100.0
    assert record.description == "Покупка продуктов"
```