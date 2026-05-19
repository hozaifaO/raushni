from __future__ import annotations

from fastapi import APIRouter

from app.schemas.landing import LandingContact, LandingContent, LandingSection


router = APIRouter(prefix="/landing", tags=["landing"])


@router.get("", response_model=LandingContent)
def get_landing_content() -> LandingContent:
    return LandingContent(
        organization="Raushni Educational & Social Welfare Trust",
        vision=(
            "Raushni Educational & Social Welfare Trust envisions a just and enlightened society where every "
            "individual, irrespective of their socio-economic background, has equal access to quality education, "
            "essential healthcare, and dignified livelihood opportunities."
        ),
        mission=(
            "To empower underserved communities through quality education, healthcare access, skill development, "
            "and social welfare programs, fostering sustainable change one life at a time."
        ),
        objectives=[
            "Quality formal and digital education for underprivileged children and adults.",
            "Basic healthcare and nutrition access for marginalized families.",
            "Sustainable livelihoods through vocational training and self-help groups.",
            "Women and adolescent girls' empowerment through safety, dignity, and economic independence.",
            "Environmental sustainability through tree plantation and waste management.",
            "Digital and financial inclusion for unbanked rural populations.",
            "Emergency relief during natural disasters.",
            "Community mobilization, advocacy, and strategic partnerships.",
        ],
        sections=[
            LandingSection(
                title="About Us",
                body="A community-rooted trust working across education, healthcare, livelihoods, and social welfare.",
            ),
            LandingSection(
                title="Success Stories",
                body="Stories of learning, dignity, resilience, and collective action from underserved communities.",
            ),
            LandingSection(
                title="Volunteer",
                body="Volunteer through teaching, mentoring, field coordination, relief work, media, and partnerships.",
            ),
        ],
        contact=LandingContact(
            address="Rauzah Apartment, Bhatauna Road, Marwan Khurd, Muzaffarpur, Bihar 843113",
            phone="+91 997 3955 7600",
            email="info@raushni.com",
        ),
        assets={
            "logo": "/assets/brand/raushni-logo.png",
            "banner": "/assets/brand/raushni-banner.png",
            "video": "/assets/videos/raushni-community.mp4",
        },
    )
