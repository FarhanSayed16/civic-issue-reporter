# 🌱 Quick Start: Demo Data Seed Script

## Quick Run

```bash
# 1. Ensure database is initialized
python init_db.py

# 2. Run demo seed script
python seed_demo_environmental_issues.py
```

## What It Does

- Creates **25 realistic environmental issues** with images
- Distributes issues across Mumbai locations
- Assigns proper departments and admins
- Mixes statuses (40% new, 30% in progress, 30% resolved)
- Includes complete address information

## Remove Demo Data

```sql
DELETE FROM issues WHERE description LIKE '%[DEMO]%';
```

## Full Documentation

See: `docs/demo/DEMO_DATA_SEED_GUIDE.md`

---

⚠️ **DEMO DATA ONLY** - Do NOT run in production!

