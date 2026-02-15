from typing import List, Dict, Optional
from datetime import datetime


class StatisticsController:
    def __init__(self, db):
        self.formdata_collection = db.formdata
        self.storeinfo_collection = db.storeinfo
    
    async def get_dashboard_stats(self, start_date: Optional[str] = None, end_date: Optional[str] = None, store_name: Optional[str] = None) -> Dict:
        """Get comprehensive dashboard statistics"""
        
        # Build query
        query = {}
        if start_date and end_date:
            query["date_of_visit"] = {"$gte": start_date, "$lte": end_date}
        if store_name:
            query["store_name"] = store_name
        
        # Get all form data
        cursor = self.formdata_collection.find(query)
        all_data = await cursor.to_list(length=None)
        
        # Basic metrics - using store_remark for conversion calculation
        total_walkins = len(all_data)
        total_revenue = sum(item.get("net_sale_value", 0) for item in all_data)
        # Count bookings based on store_remark = "Deal closed"
        total_bookings = sum(1 for item in all_data if item.get("store_remark") == "Deal closed")
        conversion_rate = (total_bookings / total_walkins * 100) if total_walkins > 0 else 0
        avg_ticket_size = (total_revenue / total_bookings) if total_bookings > 0 else 0
        
        # Family vs Individual
        family_count = sum(item.get("family", 0) for item in all_data)
        individual_count = sum(item.get("individual", 0) for item in all_data)
        
        # Source distribution
        source_distribution = {}
        for item in all_data:
            source = item.get("source_of_walkings", "Unknown")
            source_distribution[source] = source_distribution.get(source, 0) + 1
        
        # Category performance
        category_performance = {}
        for item in all_data:
            category = item.get("categories", "Unknown")
            if category not in category_performance:
                category_performance[category] = {"total": 0, "revenue": 0}
            category_performance[category]["total"] += 1
            category_performance[category]["revenue"] += item.get("net_sale_value", 0)
        
        # Executive performance - using store_remark for bookings
        executive_performance = {}
        for item in all_data:
            executive = item.get("executive_name", "Unknown")
            if executive not in executive_performance:
                executive_performance[executive] = {"total_leads": 0, "revenue": 0, "bookings": 0}
            executive_performance[executive]["total_leads"] += 1
            executive_performance[executive]["revenue"] += item.get("net_sale_value", 0)
            if item.get("store_remark") == "Deal closed":
                executive_performance[executive]["bookings"] += 1
        
        # Store performance - using store_remark for bookings
        store_performance = {}
        for item in all_data:
            store = item.get("store_name", "Unknown")
            if store not in store_performance:
                store_performance[store] = {"total": 0, "revenue": 0, "bookings": 0}
            store_performance[store]["total"] += 1
            store_performance[store]["revenue"] += item.get("net_sale_value", 0)
            if item.get("store_remark") == "Deal closed":
                store_performance[store]["bookings"] += 1
        
        # Loss analysis - using store_remark and reason_if_not_interested
        loss_analysis = {}
        for item in all_data:
            # Count "Not interested" from store_remark
            if item.get("store_remark") == "Not interested":
                loss_analysis["Not interested"] = loss_analysis.get("Not interested", 0) + 1
            
            # Also include specific reasons from reason_if_not_interested field
            reason = item.get("reason_if_not_interested")
            if reason:
                loss_analysis[reason] = loss_analysis.get(reason, 0) + 1
        
        # Product performance
        product_performance = {}
        for item in all_data:
            product_data = item.get("product", {})
            if product_data and isinstance(product_data, dict):
                product_name = product_data.get("product_name", "Unknown")
                if product_name and product_name != "Unknown":
                    if product_name not in product_performance:
                        product_performance[product_name] = {"count": 0, "revenue": 0}
                    product_performance[product_name]["count"] += 1
                    product_performance[product_name]["revenue"] += item.get("net_sale_value", 0)
        
        # Sales trend by expected booking date - using store_remark for bookings
        sales_trend = {}
        for item in all_data:
            booking_date = item.get("expected_booking_date")
            if booking_date:
                if booking_date not in sales_trend:
                    sales_trend[booking_date] = {"revenue": 0, "bookings": 0}
                sales_trend[booking_date]["revenue"] += item.get("net_sale_value", 0)
                if item.get("store_remark") == "Deal closed":
                    sales_trend[booking_date]["bookings"] += 1
        
        # Location to Conversion analysis
        location_conversion = {}
        for item in all_data:
            address = item.get("customer_residential_address", "Unknown")
            if address and address.strip() != "":
                if address not in location_conversion:
                    location_conversion[address] = {"total_leads": 0, "deals_closed": 0}
                location_conversion[address]["total_leads"] += 1
                if item.get("store_remark") == "Deal closed":
                    location_conversion[address]["deals_closed"] += 1        
        # Customer Lifecycle & Delivery Performance analysis
        delivery_times = []
        for item in all_data:
            if item.get("date_of_visit") and item.get("delivery_date"):
                try:
                    visit_date = datetime.strptime(item.get("date_of_visit"), "%Y-%m-%d")
                    delivery_date = datetime.strptime(item.get("delivery_date"), "%Y-%m-%d")
                    days_diff = (delivery_date - visit_date).days
                    if days_diff >= 0:  # Only include valid positive differences
                        delivery_times.append(days_diff)
                except (ValueError, TypeError):
                    continue
        
        # Calculate delivery metrics
        delivery_performance = {
            "total_deliveries": len(delivery_times),
            "avg_days": round(sum(delivery_times) / len(delivery_times), 1) if delivery_times else 0,
            "min_days": min(delivery_times) if delivery_times else 0,
            "max_days": max(delivery_times) if delivery_times else 0,
            "distribution": {
                "0-3": sum(1 for days in delivery_times if 0 <= days <= 3),
                "4-7": sum(1 for days in delivery_times if 4 <= days <= 7),
                "8-14": sum(1 for days in delivery_times if 8 <= days <= 14),
                "15+": sum(1 for days in delivery_times if days >= 15)
            },
            "on_time": sum(1 for days in delivery_times if days <= 7),
            "delayed": sum(1 for days in delivery_times if days > 7)
        }        
        return {
            "summary": {
                "total_walkins": total_walkins,
                "total_revenue": round(total_revenue, 2),
                "total_bookings": total_bookings,
                "conversion_rate": round(conversion_rate, 2),
                "avg_ticket_size": round(avg_ticket_size, 2),
                "family_count": family_count,
                "individual_count": individual_count
            },
            "source_distribution": [{"name": k, "value": v} for k, v in source_distribution.items()],
            "category_performance": [
                {
                    "category": k,
                    "total": v["total"],
                    "revenue": round(v["revenue"], 2),
                    "avg_value": round(v["revenue"] / v["total"], 2) if v["total"] > 0 else 0
                }
                for k, v in category_performance.items()
            ],
            "executive_performance": [
                {
                    "name": k,
                    "total_leads": v["total_leads"],
                    "bookings": v["bookings"],
                    "revenue": round(v["revenue"], 2),
                    "conversion_rate": round((v["bookings"] / v["total_leads"] * 100), 2) if v["total_leads"] > 0 else 0
                }
                for k, v in executive_performance.items()
            ],
            "store_performance": [
                {
                    "store": k,
                    "total": v["total"],
                    "bookings": v["bookings"],
                    "revenue": round(v["revenue"], 2),
                    "conversion_rate": round((v["bookings"] / v["total"] * 100), 2) if v["total"] > 0 else 0
                }
                for k, v in store_performance.items()
            ],
            "loss_analysis": [{"reason": k, "count": v} for k, v in sorted(loss_analysis.items(), key=lambda x: x[1], reverse=True)],
            "product_performance": [
                {
                    "product": k,
                    "count": v["count"],
                    "revenue": round(v["revenue"], 2)
                }
                for k, v in sorted(product_performance.items(), key=lambda x: x[1]["revenue"], reverse=True)
            ],
            "sales_trend": [
                {
                    "date": k,
                    "revenue": round(v["revenue"], 2),
                    "bookings": v["bookings"]
                }
                for k, v in sorted(sales_trend.items())
            ],
            "location_conversion": [
                {
                    "location": k,
                    "total_leads": v["total_leads"],
                    "deals_closed": v["deals_closed"],
                    "conversion_rate": round((v["deals_closed"] / v["total_leads"] * 100), 2) if v["total_leads"] > 0 else 0
                }
                for k, v in sorted(location_conversion.items(), key=lambda x: (x[1]["deals_closed"] / x[1]["total_leads"]) if x[1]["total_leads"] > 0 else 0, reverse=True)
            ],
            "delivery_performance": delivery_performance
        }
    
    async def get_stores_overview(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict:
        """Get overview of all stores"""
        stores = []
        cursor = self.storeinfo_collection.find()
        async for document in cursor:
            document["id"] = str(document.pop("_id"))
            stores.append(document)
        
        # Build query for date filtering
        query = {}
        if start_date and end_date:
            query["date_of_visit"] = {"$gte": start_date, "$lte": end_date}
        
        # Get sales data for each store
        for store in stores:
            # Get all formdata for this store
            store_query = {"store_name": store["name"]}
            if start_date and end_date:
                store_query["date_of_visit"] = {"$gte": start_date, "$lte": end_date}
            
            cursor = self.formdata_collection.find(store_query)
            store_data = await cursor.to_list(length=None)
            
            total_sales = sum(item.get("net_sale_value", 0) for item in store_data)
            total_walkins = len(store_data)
            # Use store_remark for bookings calculation
            total_bookings = sum(1 for item in store_data if item.get("store_remark") == "Deal closed")
            
            fixed_cost = store.get("fixedcost", 0)
            pnl = total_sales - fixed_cost
            
            store["total_sales"] = round(total_sales, 2)
            store["total_walkins"] = total_walkins
            store["total_bookings"] = total_bookings
            store["pnl"] = round(pnl, 2)
            store["conversion_rate"] = round((total_bookings / total_walkins * 100), 2) if total_walkins > 0 else 0
            
            if pnl > 0:
                store["status"] = "profit"
            elif pnl < 0:
                store["status"] = "loss"
            else:
                store["status"] = "break_even"
        
        total_revenue = sum(store.get("total_sales", 0) for store in stores)
        total_pnl = sum(store.get("pnl", 0) for store in stores)
        profitable_stores = sum(1 for store in stores if store.get("status") == "profit")
        loss_stores = sum(1 for store in stores if store.get("status") == "loss")
        
        return {
            "stores": stores,
            "total_revenue": round(total_revenue, 2),
            "total_pnl": round(total_pnl, 2),
            "profitable_stores": profitable_stores,
            "loss_stores": loss_stores
        }
