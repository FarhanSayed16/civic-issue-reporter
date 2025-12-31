from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from app.models.issue import Issue, Upvote, Notification, Message
from app.models.user import User
from app.services.nlp_service import NLPService
import math
import json
from app.core.config import settings

class IssueService:
    def __init__(self, db: Session):
        self.db = db
        self.nlp_service = NLPService()

    def create_issue(self, payload):
        """Create a new issue with auto-assignment and AI analysis"""
        # ⚠️ DEMO MODE: Skip duplicate detection when DEMO_MODE is enabled
        # This allows repeated testing from same location during demo recording.
        # IMPORTANT: This is TEMPORARY and MUST be disabled in production!
        from app.core.config import settings
        
        if not settings.DEMO_MODE:
            # Normal behavior: Check for duplicate issues
            duplicates = self.check_duplicate_issue(
                lat=payload.lat,
                lng=payload.lng,
                media_urls=payload.media_urls,
                description=payload.description
            )
            
            if duplicates:
                return {
                    "success": False,
                    "message": "Duplicate issue detected",
                    "duplicates": duplicates
                }
        # DEMO MODE: Skip duplicate check - allow multiple submissions
        
        # Use user-selected category instead of AI analysis
        user_category = payload.category
        department = self._map_department(user_category)
        
        # NLP analysis for priority detection and severity scoring
        auto_priority = self.nlp_service.detect_priority(payload.description)
        severity_score = self.nlp_service.get_severity_score(payload.description)
        
        # Auto-assign admin based on category and workload
        assigned_admin_id = self._assign_admin(user_category)

        issue = Issue(
            reporter_id=payload.reporter_id,
            category=user_category,  # Use user-selected category
            description=payload.description,
            status="new",
            priority=auto_priority,
            severity_score=severity_score,
            lat=payload.lat,
            lng=payload.lng,
            media_urls=json.dumps(payload.media_urls or []),
            is_anonymous=bool(getattr(payload, 'is_anonymous', False)),
            assigned_department=department,
            assigned_admin_id=assigned_admin_id,
            address_line1=getattr(payload, 'address_line1', None),
            address_line2=getattr(payload, 'address_line2', None),
            street=getattr(payload, 'street', None),
            landmark=getattr(payload, 'landmark', None),
            pincode=getattr(payload, 'pincode', None),
            upvote_count=0
        )
        
        self.db.add(issue)
        self.db.commit()
        self.db.refresh(issue)
        
        # Send notification to assigned admin
        if assigned_admin_id:
            self._send_notification(
                user_id=assigned_admin_id,
                issue_id=issue.id,
                notification_type="assignment",
                message=f"New issue #{issue.id} assigned to you: {issue.description[:50]}..."
            )
        
        # Get reporter name if not anonymous
        reporter_name = "Anonymous"
        if not issue.is_anonymous:
            reporter = self.db.query(User).filter(User.id == issue.reporter_id).first()
            if reporter:
                reporter_name = reporter.full_name
        
        # Get assigned admin name
        assigned_admin_name = None
        if issue.assigned_admin_id:
            admin = self.db.query(User).filter(User.id == issue.assigned_admin_id).first()
            if admin:
                assigned_admin_name = admin.full_name

        return {
            "id": issue.id,
            "reporter_id": issue.reporter_id,
            "reporter_name": reporter_name,
            "category": issue.category,
            "status": issue.status,
            "priority": issue.priority,
            "severity_score": issue.severity_score,
            "description": issue.description,
            "lat": issue.lat,
            "lng": issue.lng,
            "media_urls": issue.media_urls_list,
            "is_anonymous": bool(issue.is_anonymous),
            "is_verified": bool(issue.is_verified),
            "assigned_department": issue.assigned_department,
            "assigned_admin_id": issue.assigned_admin_id,
            "assigned_admin_name": assigned_admin_name,
            "address_line1": issue.address_line1,
            "address_line2": issue.address_line2,
            "street": issue.street,
            "landmark": issue.landmark,
            "pincode": issue.pincode,
            "upvote_count": issue.upvote_count,
            "created_at": issue.created_at,
            "updated_at": issue.updated_at
        }

    def get_issue(self, issue_id: int):
        """Get a single issue by ID"""
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            return None
        
        # Get reporter name if not anonymous
        reporter_name = "Anonymous"
        if not issue.is_anonymous:
            reporter = self.db.query(User).filter(User.id == issue.reporter_id).first()
            if reporter:
                reporter_name = reporter.full_name
        
        # Get assigned admin name
        assigned_admin_name = None
        if issue.assigned_admin_id:
            admin = self.db.query(User).filter(User.id == issue.assigned_admin_id).first()
            if admin:
                assigned_admin_name = admin.full_name
        
        return {
            "id": issue.id,
            "reporter_id": issue.reporter_id,
            "reporter_name": reporter_name,
            "category": issue.category,
            "status": issue.status,
            "priority": issue.priority,
            "severity_score": issue.severity_score,
            "description": issue.description,
            "lat": issue.lat,
            "lng": issue.lng,
            "media_urls": issue.media_urls_list,
            "is_anonymous": bool(issue.is_anonymous),
            "is_verified": bool(issue.is_verified),
            "assigned_department": issue.assigned_department,
            "assigned_admin_id": issue.assigned_admin_id,
            "assigned_admin_name": assigned_admin_name,
            "address_line1": issue.address_line1,
            "address_line2": issue.address_line2,
            "street": issue.street,
            "landmark": issue.landmark,
            "pincode": issue.pincode,
            "upvote_count": issue.upvote_count,
            "created_at": issue.created_at,
            "updated_at": issue.updated_at
        }

    def get_issues(self, lat: float = None, lng: float = None, radius: float = None, 
                   category: str = None, status: str = None,
                   search: str = None, sort: str = "created_at", limit: int = 50, offset: int = 0):
        """Get issues with optional filtering and sorting"""
        query = self.db.query(Issue)
        
        # Location-based filtering
        if lat is not None and lng is not None and radius is not None:
            # Simple bounding box approximation for performance
            lat_range = radius / 111.0  # Rough conversion: 1 degree ≈ 111 km
            lng_range = radius / (111.0 * math.cos(math.radians(lat)))
            
            query = query.filter(
                Issue.lat.between(lat - lat_range, lat + lat_range),
                Issue.lng.between(lng - lng_range, lng + lng_range)
            )
        
        # Category filtering
        if category:
            query = query.filter(Issue.category == category)
        
        # Status filtering
        if status:
            query = query.filter(Issue.status == status)
        
        # Ward filtering
        
        # Search filtering
        if search:
            query = query.filter(Issue.description.contains(search))
        
        # Sorting
        if sort == "upvote_count":
            query = query.order_by(desc(Issue.upvote_count))
        elif sort == "created_at":
            query = query.order_by(desc(Issue.created_at))
        else:
            query = query.order_by(desc(Issue.created_at))
        
        # Pagination
        issues = query.offset(offset).limit(limit).all()
        
        result = []
        for issue in issues:
            # Get reporter name - show "Anonymous" if anonymous, otherwise show actual name
            reporter_name = "Anonymous"
            if not issue.is_anonymous:
                reporter = self.db.query(User).filter(User.id == issue.reporter_id).first()
                if reporter:
                    reporter_name = reporter.full_name
            
            # Get assigned admin name
            assigned_admin_name = None
            if issue.assigned_admin_id:
                admin = self.db.query(User).filter(User.id == issue.assigned_admin_id).first()
                if admin:
                    assigned_admin_name = admin.full_name
            
            result.append({
                "id": issue.id,
                "reporter_id": issue.reporter_id,
                "reporter_name": reporter_name,
                "category": issue.category,
                "status": issue.status,
                "priority": issue.priority,
            "severity_score": issue.severity_score,
                "description": issue.description,
                "lat": issue.lat,
                "lng": issue.lng,
                "media_urls": issue.media_urls_list,
                "is_anonymous": bool(issue.is_anonymous),
                "is_verified": bool(issue.is_verified),
                "assigned_department": issue.assigned_department,
                "assigned_admin_id": issue.assigned_admin_id,
                "assigned_admin_name": assigned_admin_name,
                "address_line1": issue.address_line1,
                "address_line2": issue.address_line2,
                "street": issue.street,
                "landmark": issue.landmark,
                "pincode": issue.pincode,
                "upvote_count": issue.upvote_count,
                "created_at": issue.created_at,
                "updated_at": issue.updated_at
            })
        
        return result

    def get_user_issues(self, user_id: int):
        """Get all issues reported by a specific user"""
        issues = self.db.query(Issue).filter(
            Issue.reporter_id == user_id
        ).order_by(Issue.created_at.desc()).all()
        
        result = []
        for issue in issues:
            # Get reporter name - show "Anonymous" if anonymous, otherwise show actual name
            reporter_name = "Anonymous"
            if not issue.is_anonymous:
                reporter = self.db.query(User).filter(User.id == issue.reporter_id).first()
                if reporter:
                    reporter_name = reporter.full_name
            
            # Get assigned admin name
            assigned_admin_name = None
            if issue.assigned_admin_id:
                admin = self.db.query(User).filter(User.id == issue.assigned_admin_id).first()
                if admin:
                    assigned_admin_name = admin.full_name
            
            result.append({
                "id": issue.id,
                "reporter_id": issue.reporter_id,
                "reporter_name": reporter_name,
                "category": issue.category,
                "status": issue.status,
                "priority": issue.priority,
            "severity_score": issue.severity_score,
                "description": issue.description,
                "lat": issue.lat,
                "lng": issue.lng,
                "media_urls": issue.media_urls_list,
                "is_anonymous": bool(issue.is_anonymous),
                "is_verified": bool(issue.is_verified),
                "assigned_department": issue.assigned_department,
                "assigned_admin_id": issue.assigned_admin_id,
                "assigned_admin_name": assigned_admin_name,
                "address_line1": issue.address_line1,
                "address_line2": issue.address_line2,
                "street": issue.street,
                "landmark": issue.landmark,
                "pincode": issue.pincode,
                "upvote_count": issue.upvote_count,
                "created_at": issue.created_at,
                "updated_at": issue.updated_at
            })
        
        return result

    def upvote_issue(self, issue_id: int, user_id: int):
        """Toggle upvote for an issue (upvote if not upvoted, remove if already upvoted)"""
        # Check if user already upvoted this issue
        existing_upvote = self.db.query(Upvote).filter(
            Upvote.issue_id == issue_id,
            Upvote.user_id == user_id
        ).first()
        
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            return {"success": False, "message": "Issue not found"}
        
        if existing_upvote:
            # Remove upvote
            self.db.delete(existing_upvote)
            issue.upvote_count = max(0, issue.upvote_count - 1)
            issue.updated_at = datetime.utcnow()
            self.db.commit()
            
            return {
                "success": True,
                "action": "removed",
                "message": "Upvote removed",
                "issue_updated_at": issue.updated_at.isoformat()
            }
        else:
            # Create upvote
            upvote = Upvote(issue_id=issue_id, user_id=user_id)
            self.db.add(upvote)
            issue.upvote_count += 1
            issue.updated_at = datetime.utcnow()
            self.db.commit()
            
            return {
                "success": True,
                "action": "added",
                "message": "Issue upvoted",
                "upvoted_at": upvote.created_at.isoformat(),
                "issue_updated_at": issue.updated_at.isoformat()
            }

    def update_status(self, issue_id: int, status: str):
        """Update issue status"""
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            return {"success": False, "message": "Issue not found"}
        
        issue.status = status
        issue.updated_at = datetime.utcnow()
        self.db.commit()
        
        return {"success": True, "updated_at": issue.updated_at.isoformat()}

    def update_issue_status_with_trust_score(self, issue_id: int, status: str, admin_id: int):
        """Update issue status and adjust user trust score accordingly"""
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            return {"success": False, "message": "Issue not found"}
        
        old_status = issue.status
        issue.status = status
        issue.updated_at = datetime.utcnow()
        
        # Update trust score based on status change
        reporter = self.db.query(User).filter(User.id == issue.reporter_id).first()
        if reporter:
            if status == "spam" and old_status != "spam":
                # Deduct 10 points for spam
                reporter.trust_score = max(0, reporter.trust_score - 10)
                self._send_notification(
                    user_id=issue.reporter_id,
                    issue_id=issue_id,
                    notification_type="spam",
                    message=f"Issue #{issue_id} marked as spam. Trust score reduced by 10 points."
                )
            elif status == "resolved" and old_status in ["new", "in_progress"]:
                # Add 10 points for resolution (max 100)
                reporter.trust_score = min(100, reporter.trust_score + 10)
                self._send_notification(
                    user_id=issue.reporter_id,
                    issue_id=issue_id,
                    notification_type="resolved",
                    message=f"Issue #{issue_id} has been resolved! Trust score increased by 10 points."
                )
            elif status == "in_progress" and old_status == "new":
                self._send_notification(
                    user_id=issue.reporter_id,
                    issue_id=issue_id,
                    notification_type="status_update",
                    message=f"Issue #{issue_id} is now in progress."
                )
        
        self.db.commit()
        return {"success": True, "updated_at": issue.updated_at.isoformat()}

    def get_admin_issues(self, admin_id: int = None, status: Optional[str] = None,
                         category: Optional[str] = None, priority: Optional[str] = None,
                         sort_by: str = "created_at", sort_order: str = "desc", 
                         limit: int = 50, offset: int = 0):
        """Get issues assigned to specific admin"""
        query = self.db.query(Issue)
        
        # If admin_id is provided, filter by assigned admin
        if admin_id:
            query = query.filter(Issue.assigned_admin_id == admin_id)
        
        if status:
            query = query.filter(Issue.status == status)
        
        
        if category:
            query = query.filter(Issue.category == category)
        
        if priority:
            query = query.filter(Issue.priority == priority)
        
        # Sorting
        if sort_by == "upvote_count":
            query = query.order_by(desc(Issue.upvote_count) if sort_order == "desc" else asc(Issue.upvote_count))
        else:
            query = query.order_by(desc(Issue.created_at) if sort_order == "desc" else asc(Issue.created_at))
        
        issues = query.offset(offset).limit(limit).all()
        
        result = []
        for issue in issues:
            # Get reporter name - show "Anonymous" if anonymous, otherwise show actual name
            reporter_name = "Anonymous"
            if not issue.is_anonymous:
                reporter = self.db.query(User).filter(User.id == issue.reporter_id).first()
                if reporter:
                    reporter_name = reporter.full_name
            
            # Get assigned admin name
            assigned_admin_name = None
            if issue.assigned_admin_id:
                admin = self.db.query(User).filter(User.id == issue.assigned_admin_id).first()
                if admin:
                    assigned_admin_name = admin.full_name
            
            result.append({
                "id": issue.id,
                "reporter_id": issue.reporter_id,
                "reporter_name": reporter_name,
                "category": issue.category,
                "status": issue.status,
                "priority": issue.priority,
            "severity_score": issue.severity_score,
                "description": issue.description,
                "lat": issue.lat,
                "lng": issue.lng,
                "media_urls": issue.media_urls_list,
                "is_anonymous": bool(issue.is_anonymous),
                "is_verified": bool(issue.is_verified),
                "assigned_department": issue.assigned_department,
                "assigned_admin_id": issue.assigned_admin_id,
                "assigned_admin_name": assigned_admin_name,
                "address_line1": issue.address_line1,
                "address_line2": issue.address_line2,
                "street": issue.street,
                "landmark": issue.landmark,
                "pincode": issue.pincode,
                "upvote_count": issue.upvote_count,
                "created_at": issue.created_at,
                "updated_at": issue.updated_at
            })
        
        return result

    def get_department_issues(self, department: str, status: Optional[str] = None,
                             category: Optional[str] = None, priority: Optional[str] = None,
                             sort_by: str = "created_at", sort_order: str = "desc", 
                             limit: int = 50, offset: int = 0):
        """Get all issues from a specific department"""
        query = self.db.query(Issue).filter(Issue.assigned_department == department)
        
        if status:
            query = query.filter(Issue.status == status)
        
        if category:
            query = query.filter(Issue.category == category)
        
        if priority:
            query = query.filter(Issue.priority == priority)
        
        # Sorting
        if sort_by == "upvote_count":
            query = query.order_by(desc(Issue.upvote_count) if sort_order == "desc" else asc(Issue.upvote_count))
        else:
            query = query.order_by(desc(Issue.created_at) if sort_order == "desc" else asc(Issue.created_at))
        
        issues = query.offset(offset).limit(limit).all()
        
        result = []
        for issue in issues:
            # Get reporter name - show "Anonymous" if anonymous, otherwise show actual name
            reporter_name = "Anonymous"
            if not issue.is_anonymous:
                reporter = self.db.query(User).filter(User.id == issue.reporter_id).first()
                if reporter:
                    reporter_name = reporter.full_name
            
            # Get assigned admin name
            assigned_admin_name = None
            if issue.assigned_admin_id:
                admin = self.db.query(User).filter(User.id == issue.assigned_admin_id).first()
                if admin:
                    assigned_admin_name = admin.full_name
            
            result.append({
                "id": issue.id,
                "reporter_id": issue.reporter_id,
                "reporter_name": reporter_name,
                "category": issue.category,
                "status": issue.status,
                "priority": issue.priority,
            "severity_score": issue.severity_score,
                "description": issue.description,
                "lat": issue.lat,
                "lng": issue.lng,
                "media_urls": issue.media_urls_list,
                "is_anonymous": bool(issue.is_anonymous),
                "is_verified": bool(issue.is_verified),
                "assigned_department": issue.assigned_department,
                "assigned_admin_id": issue.assigned_admin_id,
                "assigned_admin_name": assigned_admin_name,
                "address_line1": issue.address_line1,
                "address_line2": issue.address_line2,
                "street": issue.street,
                "landmark": issue.landmark,
                "pincode": issue.pincode,
                "upvote_count": issue.upvote_count,
                "created_at": issue.created_at,
                "updated_at": issue.updated_at
            })
        
        return result

    def _analyze_category(self, description: str, media_urls: List[str] = None):
        """Analyze issue to determine category based on AI model detection"""
        # AI model detects environmental issues: garbage, waste, pollution, dumping, burning, etc.
        description_lower = description.lower()
        
        if any(word in description_lower for word in ['open garbage dump', 'illegal dump', 'large dump', 'waste dump']):
            return "Open Garbage Dump"
        elif any(word in description_lower for word in ['plastic pollution', 'plastic waste', 'plastic debris']):
            return "Plastic Pollution"
        elif any(word in description_lower for word in ['open burning', 'waste burning', 'burning garbage', 'burning trash']):
            return "Open Burning"
        elif any(word in description_lower for word in ['water body pollution', 'lake pollution', 'river pollution', 'pond pollution', 'contaminated water body']):
            return "Water Body Pollution"
        elif any(word in description_lower for word in ['construction waste', 'construction debris', 'demolition waste']):
            return "Construction Waste"
        elif any(word in description_lower for word in ['e-waste', 'electronic waste', 'electronic debris', 'battery waste']):
            return "Electronic Waste (E-Waste)"
        elif any(word in description_lower for word in ['biomedical waste', 'medical waste', 'syringe', 'hospital waste']):
            return "Biomedical Waste"
        elif any(word in description_lower for word in ['green space degradation', 'deforestation', 'tree cutting', 'land degradation']):
            return "Green Space Degradation"
        elif any(word in description_lower for word in ['drainage blockage', 'blocked drain', 'drain blocked', 'waterlogging']):
            return "Drainage Blockage"
        elif any(word in description_lower for word in ['water pollution', 'contaminated water', 'stagnant water', 'water logging', 'water accumulation', 'sewage']):
            return "Water Pollution / Contaminated Water"
        elif any(word in description_lower for word in ['garbage overflow', 'waste overflow', 'overflowing bin']):
            return "Garbage Overflow"
        elif any(word in description_lower for word in ['illegal dumping', 'trash', 'litter', 'debris', 'dumping']):
            return "Illegal Dumping / Litter"
        else:
            return "Other Environmental Issues"

    def _map_department(self, category: str):
        """Map category to environmental authority/department"""
        department_mapping = {
            "Open Garbage Dump": "Municipal Waste Collection",
            "Plastic Pollution": "Pollution Control Board",
            "Open Burning": "Pollution Control Board",
            "Water Body Pollution": "Pollution Control Board",
            "Construction Waste": "Municipal Waste Collection",
            "Electronic Waste (E-Waste)": "Hazardous Waste Management",
            "Biomedical Waste": "Hazardous Waste Management",
            "Green Space Degradation": "Green Space Management",
            "Drainage Blockage": "Waste Water Management",
            "Water Pollution / Contaminated Water": "Water Quality Department",
            "Garbage Overflow": "Solid Waste Management",
            "Illegal Dumping / Litter": "Sanitation Department",
            "Other Environmental Issues": "Environmental Authority"
        }
        return department_mapping.get(category, "Environmental Authority")

    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float):
        """Calculate distance between two points using Haversine formula"""
        R = 6371  # Earth's radius in kilometers
        
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        
        a = (math.sin(dlat/2) * math.sin(dlat/2) + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlng/2) * math.sin(dlng/2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    def _assign_admin(self, category: str) -> Optional[int]:
        """Assign admin based on category/department and current workload"""
        # Map category to department
        department = self._map_department(category)
        
        # Get admins from the relevant department
        admins = self.db.query(User).filter(
            User.role == "admin", 
            User.is_active == True,
            User.department == department
        ).all()
        
        # If no department-specific admin, try to find a general admin (not Municipal Commissioner)
        if not admins:
            admins = self.db.query(User).filter(
                User.role == "admin", 
                User.is_active == True,
                User.department != "Municipal Corporation"  # Avoid assigning to Municipal Commissioner
            ).all()
        
        # If still no admin, get any admin as last resort
        if not admins:
            admins = self.db.query(User).filter(User.role == "admin", User.is_active == True).all()
        
        if not admins:
            return None
        
        # Count current workload for each admin (issues in progress or new)
        admin_workloads = []
        for admin in admins:
            workload = self.db.query(Issue).filter(
                Issue.assigned_admin_id == admin.id,
                Issue.status.in_(["new", "in_progress"])
            ).count()
            admin_workloads.append((admin.id, workload))
        
        # Sort by workload (ascending) and return the admin with least workload
        admin_workloads.sort(key=lambda x: x[1])
        return admin_workloads[0][0] if admin_workloads else None

    def _send_notification(self, user_id: int, issue_id: int, notification_type: str, message: str):
        """Send notification to user"""
        notification = Notification(
            user_id=user_id,
            issue_id=issue_id,
            type=notification_type,
            message=message
        )
        self.db.add(notification)
        self.db.commit()

    def check_duplicate_issue(self, lat: float, lng: float, media_urls: List[str] = None, description: str = ""):
        """Check for duplicate issues based on image similarity only"""
        if not media_urls or len(media_urls) == 0:
            return None  # No images to check for duplicates
        
        # Get all recent issues (last 30 days) with media files
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_issues = self.db.query(Issue).filter(
            Issue.created_at >= thirty_days_ago,
            Issue.media_urls.isnot(None),
            Issue.media_urls != ""
        ).all()
        
        duplicates = []
        for issue in recent_issues:
            issue_media_urls = issue.media_urls_list
            if issue_media_urls and len(issue_media_urls) > 0:
                # Check image similarity only
                if self._check_image_similarity(media_urls, issue_media_urls):
                    duplicates.append({
                        "issue_id": issue.id,
                        "reason": "Similar images detected",
                        "created_at": issue.created_at.isoformat(),
                        "status": issue.status
                    })
        
        return duplicates if duplicates else None

    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two coordinates in kilometers using Haversine formula"""
        R = 6371  # Earth's radius in kilometers
        
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        
        a = (math.sin(dlat/2) * math.sin(dlat/2) + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlng/2) * math.sin(dlng/2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        return distance

    def _check_image_similarity(self, urls1: List[str], urls2: List[str]) -> bool:
        """Check if images are similar (simplified check for same URLs or similar filenames)"""
        # For now, we'll do a simple URL comparison
        # In a real implementation, you'd use image hashing or computer vision
        for url1 in urls1:
            for url2 in urls2:
                # Extract filename from URL
                filename1 = url1.split('/')[-1].split('.')[0]
                filename2 = url2.split('/')[-1].split('.')[0]
                
                # Simple similarity check (same filename or very similar)
                if filename1 == filename2 or abs(len(filename1) - len(filename2)) <= 2:
                    return True
        
        return False

    def _check_description_similarity(self, desc1: str, desc2: str) -> bool:
        """Check if descriptions are similar using simple text comparison"""
        # Convert to lowercase and remove common words
        words1 = set(desc1.lower().split())
        words2 = set(desc2.lower().split())
        
        # Remove common words
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
        words1 = words1 - common_words
        words2 = words2 - common_words
        
        # Calculate similarity ratio
        if len(words1) == 0 and len(words2) == 0:
            return True
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        similarity = len(intersection) / len(union) if len(union) > 0 else 0
        
        # Consider similar if more than 60% of words match
        return similarity > 0.6

    def get_admin_issues(self, admin_id: int, status: str = None, category: str = None, priority: str = None, sort_by: str = "created_at", sort_order: str = "desc", limit: int = 50, offset: int = 0):
        """Get issues assigned to a specific admin"""
        query = self.db.query(Issue).filter(Issue.assigned_admin_id == admin_id)
        
        # Apply filters
        if status:
            query = query.filter(Issue.status == status)
        if category:
            query = query.filter(Issue.category == category)
        if priority:
            query = query.filter(Issue.priority == priority)
        
        # Apply sorting
        if sort_by == "created_at":
            if sort_order == "desc":
                query = query.order_by(desc(Issue.created_at))
            else:
                query = query.order_by(Issue.created_at)
        elif sort_by == "updated_at":
            if sort_order == "desc":
                query = query.order_by(desc(Issue.updated_at))
            else:
                query = query.order_by(Issue.updated_at)
        elif sort_by == "priority":
            if sort_order == "desc":
                query = query.order_by(desc(Issue.priority))
            else:
                query = query.order_by(Issue.priority)
        else:
            # Default sorting
            query = query.order_by(desc(Issue.created_at))
        
        # Pagination
        issues = query.offset(offset).limit(limit).all()
        
        result = []
        for issue in issues:
            # Get reporter name - show "Anonymous" if anonymous, otherwise show actual name
            reporter_name = "Anonymous"
            if not issue.is_anonymous:
                reporter = self.db.query(User).filter(User.id == issue.reporter_id).first()
                if reporter:
                    reporter_name = reporter.full_name
            
            # Get assigned admin name
            assigned_admin_name = None
            if issue.assigned_admin_id:
                admin = self.db.query(User).filter(User.id == issue.assigned_admin_id).first()
                if admin:
                    assigned_admin_name = admin.full_name
            
            result.append({
                "id": issue.id,
                "reporter_id": issue.reporter_id,
                "reporter_name": reporter_name,
                "category": issue.category,
                "status": issue.status,
                "priority": issue.priority,
            "severity_score": issue.severity_score,
                "description": issue.description,
                "lat": issue.lat,
                "lng": issue.lng,
                "media_urls": issue.media_urls_list,
                "is_anonymous": bool(issue.is_anonymous),
                "is_verified": bool(issue.is_verified),
                "assigned_department": issue.assigned_department,
                "assigned_admin_id": issue.assigned_admin_id,
                "assigned_admin_name": assigned_admin_name,
                "address_line1": issue.address_line1,
                "address_line2": issue.address_line2,
                "street": issue.street,
                "landmark": issue.landmark,
                "pincode": issue.pincode,
                "upvote_count": issue.upvote_count,
                "created_at": issue.created_at,
                "updated_at": issue.updated_at
            })
        
        return result
