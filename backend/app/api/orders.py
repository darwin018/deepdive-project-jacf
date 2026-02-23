from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils
from ..models import order as models_order
from ..models import product as models_product
from ..schemas import order as schemas_order
from ..database import get_db

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
)

@router.post("/", response_model=schemas_order.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas_order.OrderCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Create Order
    db_order = models_order.Order(
        name=order.name,
        whatsapp_number=order.whatsapp_number,
        shipping_address=order.shipping_address,
        permanent_address=order.permanent_address,
        total_savings=order.total_savings,
        grand_total=order.grand_total
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    products_details = []

    # Create Order Items
    for item in order.items:
        db_item = models_order.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
        
        # Fetch actual product for email summary
        product = db.query(models_product.Product).filter(models_product.Product.id == item.product_id).first()
        product_name = product.name if product else f"Product #{item.product_id}"
        
        products_details.append({
            "name": product_name,
            "quantity": item.quantity,
            "price": item.price,
            "line_total": item.quantity * item.price
        })
    
    db.commit()
    db.refresh(db_order)
    
    # Trigger Admin Email Notification in Background
    background_tasks.add_task(utils.send_new_order_email, db_order, products_details)
    
    return db_order

@router.get("/", response_model=List[schemas_order.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(models_order.Order).order_by(models_order.Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@router.put("/{order_id}/status", response_model=schemas_order.Order)
def update_order_status(order_id: int, status_update: schemas_order.OrderStatusUpdate, db: Session = Depends(get_db)):
    db_order = db.query(models_order.Order).filter(models_order.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    db_order.status = status_update.status
    db.commit()
    db.refresh(db_order)
    return db_order

@router.put("/{order_id}/payment-status/", response_model=schemas_order.Order)
def update_payment_status(order_id: int, status_update: schemas_order.OrderPaymentStatusUpdate, db: Session = Depends(get_db)):
    db_order = db.query(models_order.Order).filter(models_order.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    db_order.payment_status = status_update.payment_status
    db.commit()
    db.refresh(db_order)
    return db_order
