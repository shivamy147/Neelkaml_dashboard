from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union
from datetime import datetime
import uuid


class StoreInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    fixedcost: Optional[float] = 0
    address: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class StoreInfoResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Union[StoreInfo, List[StoreInfo]]] = None
    count: Optional[int] = None
