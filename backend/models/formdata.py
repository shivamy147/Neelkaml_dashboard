from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union
from datetime import datetime
import uuid


class Product(BaseModel):
    product_name: Optional[str] = None
    size: Optional[str] = None
    height: Optional[str] = None
    size_inches: Optional[str] = None


class FormData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date_of_visit: str
    day: Optional[str] = None
    store_name: Optional[str] = None
    customer_name: str
    mobile_number: str
    pincode: Optional[str] = None
    store_remark: Optional[str] = None
    categories: Optional[str] = None
    net_sale_value: Optional[float] = 0
    executive_name: str
    source_of_walkings: Optional[str] = None
    expected_booking_date: Optional[str] = None
    sales_order_number: Optional[str] = None
    delivery_date: Optional[str] = None
    product: Optional[Product] = None
    individual: Optional[int] = 0
    family: Optional[int] = 0
    reason_if_not_interested: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class FormDataResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Union[FormData, List[FormData]]] = None
    count: Optional[int] = None
