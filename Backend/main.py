from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.auth import (
    create_access_token,
    get_current_admin,
    verify_admin_password,
    ADMIN_USERNAME,
)
from backend.database import Base, engine, get_db
from backend.models import ContactInquiry
from backend.schemas import (
    AdminLoginRequest,
    AdminLoginResponse,
    ContactInquiryCreate,
    ContactInquiryResponse,
)


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Personal Website Contact API",
    description="Backend API for client enquiries and admin management.",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://anayo-engr.github.io",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Personal Website Contact API is running",
        "status": "success",
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


# --------------------------------------------------
# CLIENT CONTACT FORM
# --------------------------------------------------

@app.post(
    "/contact",
    response_model=ContactInquiryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_contact_inquiry(
    inquiry: ContactInquiryCreate,
    db: Session = Depends(get_db),
):
    new_inquiry = ContactInquiry(
        surname=inquiry.surname,
        othernames=inquiry.othernames,
        email=inquiry.email,
        project_type=inquiry.project_type,
        location=inquiry.location,
        budget=inquiry.budget,
        timeline=inquiry.timeline,
        comments=inquiry.comments,
        status="new",
    )

    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)

    return new_inquiry


# --------------------------------------------------
# ADMIN LOGIN
# --------------------------------------------------

@app.post(
    "/admin/login",
    response_model=AdminLoginResponse,
)
def admin_login(
    login_data: AdminLoginRequest,
):
    if login_data.username != ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    if not verify_admin_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    token = create_access_token()

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# --------------------------------------------------
# ADMIN - VIEW ALL ENQUIRIES
# --------------------------------------------------

@app.get(
    "/admin/inquiries",
    response_model=list[ContactInquiryResponse],
)
def get_all_inquiries(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    inquiries = (
        db.query(ContactInquiry)
        .order_by(ContactInquiry.created_at.desc())
        .all()
    )

    return inquiries


# --------------------------------------------------
# ADMIN - VIEW ONE ENQUIRY
# --------------------------------------------------

@app.get(
    "/admin/inquiries/{inquiry_id}",
    response_model=ContactInquiryResponse,
)
def get_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    inquiry = (
        db.query(ContactInquiry)
        .filter(ContactInquiry.id == inquiry_id)
        .first()
    )

    if inquiry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enquiry not found.",
        )

    return inquiry


# --------------------------------------------------
# ADMIN - UPDATE ENQUIRY STATUS
# --------------------------------------------------

@app.patch(
    "/admin/inquiries/{inquiry_id}/status",
    response_model=ContactInquiryResponse,
)
def update_inquiry_status(
    inquiry_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    allowed_statuses = {
        "new",
        "contacted",
        "in_progress",
        "completed",
        "archived",
    }

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid status. "
                "Use: new, contacted, in_progress, "
                "completed, or archived."
            ),
        )

    inquiry = (
        db.query(ContactInquiry)
        .filter(ContactInquiry.id == inquiry_id)
        .first()
    )

    if inquiry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enquiry not found.",
        )

    inquiry.status = new_status

    db.commit()
    db.refresh(inquiry)

    return inquiry


# --------------------------------------------------
# ADMIN - DELETE ENQUIRY
# --------------------------------------------------

@app.delete(
    "/admin/inquiries/{inquiry_id}",
)
def delete_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    inquiry = (
        db.query(ContactInquiry)
        .filter(ContactInquiry.id == inquiry_id)
        .first()
    )

    if inquiry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enquiry not found.",
        )

    db.delete(inquiry)
    db.commit()

    return {
        "message": "Enquiry deleted successfully.",
        "id": inquiry_id,
    }
