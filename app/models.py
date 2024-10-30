from pydantic import BaseModel


class Item(BaseModel):
    product_id: int
    name: str
    category: str
    price: float
