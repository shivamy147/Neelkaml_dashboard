from .formdata_routes import router as formdata_router, set_controller as set_formdata_controller
from .storeinfo_routes import router as storeinfo_router, set_controller as set_storeinfo_controller
from .statistics_routes import router as statistics_router, set_controller as set_statistics_controller

__all__ = ['formdata_router', 'set_formdata_controller', 'storeinfo_router', 'set_storeinfo_controller', 'statistics_router', 'set_statistics_controller']
