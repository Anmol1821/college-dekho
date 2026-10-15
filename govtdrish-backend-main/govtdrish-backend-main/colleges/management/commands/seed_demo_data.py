"""
Seed demo data so every screen (home, search, scholarships, college detail,
hometown alumni, outcomes/risk) has something realistic to show.

Idempotent: run it as often as you like, it only fills gaps.

    python manage.py seed_demo_data

NOTE: figures are illustrative demo values, not audited official numbers.
The live AI search (Gemini + Google Search grounding) supplies current facts.
"""
from django.core.management.base import BaseCommand
from colleges.models import College, Course, Scholarship, CollegeOutcome, Alumni

COLLEGES = [
    {
        "name": "Indian Institute of Technology Patna",
        "slug": "iit-patna",
        "city": "Patna",
        "state": "Bihar",
        "ownership_type": "Public",
        "estd_year": 2008,
        "cutoff_rank": 2500,
        "nirf_rank": 30,
        "courses": [
            ("B.Tech Computer Science", 800000, 120, "JEE Advanced + JoSAA counselling"),
            ("B.Tech Electronics", 760000, 100, "JEE Advanced + JoSAA counselling"),
            ("M.Tech (Selected Branches)", 200000, 60, "GATE score"),
        ],
        "outcome": {
            "alumni_audited_count": 210,
            "open_to_work_percent": 4.10,
            "avg_tenure_months": 30.5,
            "top_employers": [
                {"name": "Amazon", "count": 24},
                {"name": "Microsoft", "count": 18},
                {"name": "Qualcomm", "count": 14},
                {"name": "Tata Elxsi", "count": 9},
            ],
            "risk_score": 22,
        },
        "alumni": [
            ("Aman Kumar", "B.Tech CS", 2022, "Patna", "Bihar"),
            ("Priya Singh", "B.Tech ECE", 2021, "Gaya", "Bihar"),
        ],
    },
    {
        "name": "National Law University Delhi",
        "slug": "nlu-delhi",
        "city": "New Delhi",
        "state": "Delhi",
        "ownership_type": "Public",
        "estd_year": 2008,
        "cutoff_rank": 900,
        "nirf_rank": 2,
        "courses": [
            ("B.A. LL.B (Hons.)", 900000, 110, "CLAT UG"),
            ("LL.M", 300000, 50, "CLAT PG"),
        ],
        "outcome": {
            "alumni_audited_count": 180,
            "open_to_work_percent": 6.70,
            "avg_tenure_months": 38.2,
            "top_employers": [
                {"name": "Cyril Amarchand Mangaldas", "count": 21},
                {"name": "Khaitan & Co", "count": 17},
                {"name": "Trilegal", "count": 12},
                {"name": "Shardul Amarchand", "count": 10},
            ],
            "risk_score": 18,
        },
        "alumni": [
            ("Ritika Verma", "B.A. LL.B", 2023, "Delhi", "Delhi"),
        ],
    },
    {
        "name": "Birla Institute of Technology Mesra",
        "slug": "bit-mesra",
        "city": "Ranchi",
        "state": "Jharkhand",
        "ownership_type": "Private",
        "estd_year": 1955,
        "cutoff_rank": 45000,
        "nirf_rank": 41,
        "courses": [
            ("B.Tech Computer Science", 1400000, 180, "JEE Main + counselling"),
            ("B.Tech Mechanical", 1200000, 120, "JEE Main + counselling"),
            ("MBA", 900000, 60, "CAT / MAT score"),
        ],
        "outcome": {
            "alumni_audited_count": 140,
            "open_to_work_percent": 12.30,
            "avg_tenure_months": 24.8,
            "top_employers": [
                {"name": "TCS", "count": 26},
                {"name": "Infosys", "count": 20},
                {"name": "Wipro", "count": 15},
                {"name": "L&T Construction", "count": 8},
            ],
            "risk_score": 47,
        },
        "alumni": [
            ("Sneha Oraon", "B.Tech CS", 2022, "Ranchi", "Jharkhand"),
        ],
    },
    {
        "name": "Patna University",
        "slug": "patna-university",
        "city": "Patna",
        "state": "Bihar",
        "ownership_type": "Public",
        "estd_year": 1917,
        "cutoff_rank": 9000,
        "nirf_rank": 60,
        "courses": [
            ("B.Sc Mathematics", 60000, 240, "10+2 with 45% marks"),
            ("M.A. Political Science", 40000, 120, "Bachelor's degree"),
        ],
        "outcome": {
            "alumni_audited_count": 60,
            "open_to_work_percent": 18.90,
            "avg_tenure_months": 21.4,
            "top_employers": [
                {"name": "Bihar Govt Departments", "count": 14},
                {"name": "State Bank of India", "count": 7},
                {"name": "Private Schools", "count": 11},
            ],
            "risk_score": 58,
        },
        "alumni": [
            ("Md. Irfan Ansari", "M.A. Political Science", 2021, "Patna", "Bihar"),
        ],
    },
    {
        "name": "XLRI Jamshedpur",
        "slug": "xlri-jamshedpur",
        "city": "Jamshedpur",
        "state": "Jharkhand",
        "ownership_type": "Private",
        "estd_year": 1949,
        "cutoff_rank": 3000,
        "nirf_rank": 9,
        "courses": [
            ("PGDM (Business Management)", 2100000, 180, "XAT score + GD/PI"),
            ("PGDM (Human Resources)", 2100000, 120, "XAT score + GD/PI"),
        ],
        "outcome": {
            "alumni_audited_count": 250,
            "open_to_work_percent": 3.20,
            "avg_tenure_months": 34.6,
            "top_employers": [
                {"name": "McKinsey & Company", "count": 16},
                {"name": "BCG", "count": 13},
                {"name": "Hindustan Unilever", "count": 22},
                {"name": "Tata Steel", "count": 19},
            ],
            "risk_score": 15,
        },
        "alumni": [
            ("Ananya Ghosh", "PGDM HR", 2023, "Kolkata", "West Bengal"),
        ],
    },
    {
        "name": "Delhi Technological University",
        "slug": "dtu-delhi",
        "city": "New Delhi",
        "state": "Delhi",
        "ownership_type": "Public",
        "estd_year": 1941,
        "cutoff_rank": 15000,
        "nirf_rank": 29,
        "courses": [
            ("B.Tech Computer Science", 640000, 190, "JEE Main + JAC Delhi counselling"),
            ("B.Tech Information Technology", 620000, 120, "JEE Main + JAC Delhi counselling"),
        ],
        "outcome": {
            "alumni_audited_count": 300,
            "open_to_work_percent": 5.40,
            "avg_tenure_months": 28.9,
            "top_employers": [
                {"name": "Google", "count": 28},
                {"name": "Adobe", "count": 19},
                {"name": "Uber", "count": 11},
                {"name": "Samsung R&D", "count": 17},
            ],
            "risk_score": 24,
        },
        "alumni": [
            ("Karan Malhotra", "B.Tech IT", 2022, "Delhi", "Delhi"),
            ("Fatima Khan", "B.Tech CS", 2021, "Noida", "Uttar Pradesh"),
        ],
    },
]

SCHOLARSHIPS = [
    {
        "name": "Post Matric Scholarship (SC)",
        "eligible_category": "SC",
        "max_income": 250000,
        "state": "All",
        "amount": "Full tuition + ₹1,250/month",
    },
    {
        "name": "Post Matric Scholarship (ST)",
        "eligible_category": "ST",
        "max_income": 250000,
        "state": "All",
        "amount": "Full tuition + ₹1,250/month",
    },
    {
        "name": "OBC Post Matric Scholarship",
        "eligible_category": "OBC",
        "max_income": 300000,
        "state": "All",
        "amount": "₹500/month + maintenance allowance",
    },
    {
        "name": "Central Sector Scholarship (Top 20%)",
        "eligible_category": "General",
        "max_income": 800000,
        "state": "All",
        "amount": "₹10,000–₹20,000/year",
    },
    {
        "name": "Merit-cum-Means Scholarship",
        "eligible_category": "All",
        "max_income": 500000,
        "state": "All",
        "amount": "Up to 50% fee waiver",
    },
    {
        "name": "e-Kalyan Post Matric Scholarship",
        "eligible_category": "OBC",
        "max_income": 275000,
        "state": "Jharkhand",
        "amount": "Tuition + ₹10,000/year",
    },
]


class Command(BaseCommand):
    help = "Seed demo colleges, courses, outcomes, alumni and scholarships (idempotent)."

    def handle(self, *args, **options):
        created = {"colleges": 0, "courses": 0, "outcomes": 0, "alumni": 0, "scholarships": 0}

        for data in COLLEGES:
            college, was_created = College.objects.get_or_create(
                slug=data["slug"],
                defaults={
                    "name": data["name"],
                    "city": data["city"],
                    "state": data["state"],
                    "ownership_type": data["ownership_type"],
                    "estd_year": data["estd_year"],
                    "cutoff_rank": data["cutoff_rank"],
                    "nirf_rank": data["nirf_rank"],
                },
            )
            if was_created:
                created["colleges"] += 1

            for name, fees, seats, eligibility in data["courses"]:
                _, was_created = Course.objects.get_or_create(
                    college=college,
                    name=name,
                    defaults={
                        "total_fees": fees,
                        "seats": seats,
                        "eligibility": eligibility,
                    },
                )
                if was_created:
                    created["courses"] += 1

            _, was_created = CollegeOutcome.objects.update_or_create(
                college=college,
                defaults=data["outcome"],
            )
            if was_created:
                created["outcomes"] += 1

            for name, course_name, year, city, state in data["alumni"]:
                _, was_created = Alumni.objects.get_or_create(
                    college=college,
                    name=name,
                    passout_year=year,
                    defaults={
                        "course_name": course_name,
                        "hometown_city": city,
                        "hometown_state": state,
                        # Left empty on purpose: we never publish private
                        # numbers in demo data.
                        "whatsapp_number": "",
                        "is_verified": True,
                    },
                )
                if was_created:
                    created["alumni"] += 1

        for data in SCHOLARSHIPS:
            _, was_created = Scholarship.objects.get_or_create(
                name=data["name"], defaults=data
            )
            if was_created:
                created["scholarships"] += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Seed complete: "
                f"+{created['colleges']} colleges, +{created['courses']} courses, "
                f"+{created['outcomes']} outcomes, +{created['alumni']} alumni, "
                f"+{created['scholarships']} scholarships "
                f"(totals: {College.objects.count()} colleges, "
                f"{Scholarship.objects.count()} scholarships, "
                f"{Alumni.objects.count()} alumni)"
            )
        )
        if created["colleges"] == created["scholarships"] == 0:
            self.stdout.write(self.style.WARNING("Nothing new to seed — data already present."))
