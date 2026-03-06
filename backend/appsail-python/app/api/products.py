from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from .. import models, schemas, database
from typing import List, Optional
import shutil
import os
import uuid

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[schemas.Product])
def read_products(
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = Query(None),
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Product)
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Product)
def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    quantity: int = Form(...),
    actual_price: float = Form(...),
    offer_price: float = Form(...),
    category_id: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    # Verify category exists
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid Category ID")

    image_url = None
    if image:
        file_extension = os.path.splitext(image.filename)[1]
        file_name = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/static/uploads/{file_name}"

    db_product = models.Product(
        name=name,
        description=description,
        quantity=quantity,
        actual_price=actual_price,
        offer_price=offer_price,
        category_id=category_id,
        image_url=image_url
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    quantity: Optional[int] = Form(None),
    actual_price: Optional[float] = Form(None),
    offer_price: Optional[float] = Form(None),
    category_id: Optional[int] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if name is not None: db_product.name = name
    if description is not None: db_product.description = description
    if quantity is not None: db_product.quantity = quantity
    if actual_price is not None: db_product.actual_price = actual_price
    if offer_price is not None: db_product.offer_price = offer_price
    
    if category_id is not None:
         # Verify category exists
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Invalid Category ID")
        db_product.category_id = category_id

    if image:
        file_extension = os.path.splitext(image.filename)[1]
        file_name = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        db_product.image_url = f"/static/uploads/{file_name}"

    db.commit()
    # Re-fetch
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(database.get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}
