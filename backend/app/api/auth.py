from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, models, utils
from ..schemas import admin as schemas

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post('/login')
def login(request: schemas.AdminLogin, db: Session = Depends(database.get_db)):
    admin = db.query(models.Admin).filter(models.Admin.username == request.username).first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Invalid Credentials")
    if not utils.Hash.verify(request.password, admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Incorrect Password")
    
    # In a real app, generate JWT token here. For now, return success.
    return {"message": "Login Successful", "username": admin.username}
