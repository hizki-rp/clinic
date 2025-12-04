#!/usr/bin/env python3
"""
Generate a professional PDF proposal document for clinic integration.
Requires: pip install markdown reportlab
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import markdown
from datetime import datetime

def create_header_footer(canvas_obj, doc):
    """Add header and footer to each page"""
    canvas_obj.saveState()
    
    # Header
    canvas_obj.setFont('Helvetica-Bold', 10)
    canvas_obj.setFillColor(colors.HexColor('#1e40af'))
    canvas_obj.drawString(inch, letter[1] - 0.5*inch, "Menaharia Medium Clinic")
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(colors.grey)
    canvas_obj.drawRightString(letter[0] - inch, letter[1] - 0.5*inch, 
                                f"Integration Proposal - {datetime.now().strftime('%B %Y')}")
    
    # Footer
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.drawString(inch, 0.5*inch, "Confidential Document")
    canvas_obj.drawRightString(letter[0] - inch, 0.5*inch, f"Page {doc.page}")
    
    canvas_obj.restoreState()

def generate_proposal_pdf():
    """Generate the complete proposal PDF"""
    
    # Create PDF
    filename = "Menaharia_Clinic_Integration_Proposal.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           rightMargin=inch, leftMargin=inch,
                           topMargin=inch, bottomMargin=inch)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=10,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    heading3_style = ParagraphStyle(
        'CustomHeading3',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#3b82f6'),
        spaceAfter=8,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        alignment=TA_JUSTIFY,
        spaceAfter=6
    )
    
    # Cover Page
    elements.append(Spacer(1, 2*inch))
    elements.append(Paragraph("Healthcare Management System", title_style))
    elements.append(Paragraph("Integration Proposal", subtitle_style))
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph("Menaharia Medium Clinic", heading2_style))
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph(f"Prepared: {datetime.now().strftime('%B %d, %Y')}", body_style))
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph("Version 1.0", body_style))
    elements.append(PageBreak())
    
    # Executive Summary
    elements.append(Paragraph("Executive Summary", heading1_style))
    elements.append(Paragraph(
        "This document outlines the comprehensive Healthcare Management System developed for "
        "Menaharia Medium Clinic. The system is designed to streamline patient management, "
        "queue operations, staff coordination, and administrative tasks.",
        body_style
    ))
    elements.append(Spacer(1, 0.2*inch))
    
    # Key Benefits
    elements.append(Paragraph("Key Benefits:", heading3_style))
    benefits = [
        "Real-time patient queue management across 5 stages",
        "Complete electronic health records (EHR) system",
        "Automated report generation (PDF format)",
        "Role-based access control for security",
        "Staff management and coordination",
        "Laboratory test tracking and results",
        "Digital prescription generation"
    ]
    for benefit in benefits:
        elements.append(Paragraph(f"• {benefit}", body_style))
    elements.append(PageBreak())
    
    # System Overview
    elements.append(Paragraph("1. System Overview", heading1_style))
    elements.append(Paragraph("Complete Digital Solution", heading2_style))
    elements.append(Paragraph(
        "The Healthcare Management System provides end-to-end digital management of clinic operations, "
        "from patient registration through discharge, including all intermediate stages of care.",
        body_style
    ))
    elements.append(Spacer(1, 0.2*inch))
    
    # Technology Stack Table
    elements.append(Paragraph("Technology Stack", heading3_style))
    tech_data = [
        ['Component', 'Technology', 'Purpose'],
        ['Frontend', 'React + TypeScript', 'Modern, responsive web interface'],
        ['Backend', 'Django REST Framework', 'Secure, scalable API'],
        ['Database', 'SQLite/PostgreSQL', 'Reliable data storage'],
        ['Deployment', 'Vercel + Cloud', 'High availability hosting']
    ]
    tech_table = Table(tech_data, colWidths=[1.5*inch, 2*inch, 2.5*inch])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    elements.append(tech_table)
    elements.append(PageBreak())
    
    # Current Features
    elements.append(Paragraph("2. Current Features & Capabilities", heading1_style))
    
    features_data = [
        ("Patient Management", [
            "Patient registration with demographics",
            "Patient search and filtering",
            "Card number system",
            "Medical history tracking",
            "Visit history and records"
        ]),
        ("Queue Management", [
            "5-stage workflow tracking",
            "Real-time patient status",
            "Role-based queue visibility",
            "Priority management",
            "Stage-specific actions"
        ]),
        ("Staff Management", [
            "Employee registration",
            "Role assignment",
            "Department management",
            "Staff directory with search"
        ]),
        ("Reports & Analytics", [
            "Revenue summary (PDF)",
            "Patient demographics (PDF)",
            "Visit history (PDF)",
            "Staff performance (PDF)",
            "Resource utilization (PDF)"
        ])
    ]
    
    for feature_name, feature_list in features_data:
        elements.append(Paragraph(feature_name, heading2_style))
        for item in feature_list:
            elements.append(Paragraph(f"✓ {item}", body_style))
        elements.append(Spacer(1, 0.1*inch))
    
    elements.append(PageBreak())
    
    # User Roles
    elements.append(Paragraph("3. User Roles & Access Levels", heading1_style))
    
    roles_data = [
        ['Role', 'Access Level', 'Key Responsibilities'],
        ['Admin', 'Full System', 'Staff management, reports, configuration'],
        ['Doctor', 'Clinical', 'Patient examination, prescriptions, lab orders'],
        ['Reception', 'Front Desk', 'Patient registration, appointments, waiting room'],
        ['Laboratory', 'Lab Only', 'Test management, result entry'],
        ['Nurse/Triage', 'Triage', 'Vital signs, initial assessment']
    ]
    
    roles_table = Table(roles_data, colWidths=[1.2*inch, 1.5*inch, 3.3*inch])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(roles_table)
    elements.append(PageBreak())
    
    # Required Information Section
    elements.append(Paragraph("4. Required Clinic Information", heading1_style))
    elements.append(Paragraph(
        "To complete the integration, we need the following information from your clinic. "
        "Please fill in the attached forms and return them within 7 days.",
        body_style
    ))
    elements.append(Spacer(1, 0.2*inch))
    
    required_info = [
        ("Section A: Clinic Details", [
            "Official clinic name and registration number",
            "Complete physical address",
            "Contact information (phone, email, website)",
            "Operating hours",
            "High-resolution clinic logo"
        ]),
        ("Section B: Service Pricing", [
            "Consultation fees (general, specialist, emergency)",
            "Registration and administrative fees",
            "Additional service charges",
            "Payment methods accepted"
        ]),
        ("Section C: Laboratory Services", [
            "Complete test catalog with codes",
            "Test pricing",
            "Turnaround times",
            "External lab partnerships (if any)"
        ]),
        ("Section D: Staff Information", [
            "Complete staff list with roles",
            "Medical licenses and specializations",
            "Contact information",
            "Department assignments"
        ])
    ]
    
    for section_name, items in required_info:
        elements.append(Paragraph(section_name, heading2_style))
        for item in items:
            elements.append(Paragraph(f"• {item}", body_style))
        elements.append(Spacer(1, 0.1*inch))
    
    elements.append(PageBreak())
    
    # Integration Timeline
    elements.append(Paragraph("8. Integration Timeline", heading1_style))
    
    timeline_data = [
        ['Phase', 'Duration', 'Activities', 'Deliverables'],
        ['1. Information Collection', 'Week 1', 'Gather clinic data, pricing, staff info', 'Completed forms'],
        ['2. Customization', 'Week 2-3', 'Configure pricing, tests, staff accounts', 'Customized system'],
        ['3. Data Migration', 'Week 3-4', 'Import existing records, setup data', 'Migrated data'],
        ['4. Testing', 'Week 4-5', 'System testing, UAT, bug fixes', 'Test reports'],
        ['5. Training', 'Week 5-6', 'Staff training all roles', 'Trained staff'],
        ['6. Go-Live', 'Week 7', 'Deployment, parallel run, support', 'Live system'],
        ['7. Support', 'Ongoing', '30-day intensive support', 'Stable operation']
    ]
    
    timeline_table = Table(timeline_data, colWidths=[1.3*inch, 1*inch, 2.2*inch, 1.5*inch])
    timeline_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(timeline_table)
    elements.append(PageBreak())
    
    # Training & Support
    elements.append(Paragraph("9. Training & Support", heading1_style))
    
    training_data = [
        ['Role', 'Duration', 'Topics Covered'],
        ['Admin', '2 days', 'System config, staff mgmt, reports, troubleshooting'],
        ['Doctor', '1 day', 'Patient workflow, prescriptions, lab orders, history'],
        ['Reception', '1 day', 'Registration, queue mgmt, appointments'],
        ['Laboratory', '1 day', 'Test ordering, result entry, reports'],
        ['Nurse/Triage', '1 day', 'Vital signs, triage assessment, handoff']
    ]
    
    training_table = Table(training_data, colWidths=[1.5*inch, 1*inch, 3.5*inch])
    training_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(training_table)
    
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph("Support Channels:", heading3_style))
    support_items = [
        "Email support during business hours",
        "Phone support for urgent issues",
        "On-site support (first 30 days)",
        "Remote support via screen sharing",
        "Complete user manuals and documentation",
        "Video tutorials available online"
    ]
    for item in support_items:
        elements.append(Paragraph(f"• {item}", body_style))
    
    elements.append(PageBreak())
    
    # Next Steps
    elements.append(Paragraph("10. Next Steps", heading1_style))
    elements.append(Paragraph("Immediate Actions Required:", heading2_style))
    
    next_steps = [
        "Review this proposal document thoroughly",
        "Fill in all required information sections (A, B, C, D)",
        "Gather clinic logo and any existing patient data",
        "Schedule follow-up meeting to discuss completed information",
        "Sign integration agreement (separate document)"
    ]
    
    for i, step in enumerate(next_steps, 1):
        elements.append(Paragraph(f"{i}. {step}", body_style))
    
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph("Contact Information:", heading3_style))
    elements.append(Paragraph("Project Manager: [To be assigned]", body_style))
    elements.append(Paragraph("Email: integration@clinic-system.com", body_style))
    elements.append(Paragraph("Phone: [To be provided]", body_style))
    elements.append(Paragraph("Office Hours: Monday - Friday, 9:00 AM - 5:00 PM", body_style))
    
    elements.append(PageBreak())
    
    # Signature Page
    elements.append(Spacer(1, 1*inch))
    elements.append(Paragraph("Agreement Signatures", heading1_style))
    elements.append(Spacer(1, 0.5*inch))
    
    signature_data = [
        ['Clinic Representative', ''],
        ['Name: _______________________________', ''],
        ['Title: _______________________________', ''],
        ['Signature: _______________________________', ''],
        ['Date: _______________________________', ''],
        ['', ''],
        ['System Provider', ''],
        ['Name: _______________________________', ''],
        ['Title: _______________________________', ''],
        ['Signature: _______________________________', ''],
        ['Date: _______________________________', '']
    ]
    
    sig_table = Table(signature_data, colWidths=[6*inch])
    sig_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 6), (0, 6), 'Helvetica-Bold'),
    ]))
    elements.append(sig_table)
    
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph(
        "This document is confidential and intended solely for the use of Menaharia Medium Clinic. "
        "Unauthorized distribution is prohibited.",
        ParagraphStyle('Confidential', parent=body_style, fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
    ))
    
    # Build PDF
    doc.build(elements, onFirstPage=create_header_footer, onLaterPages=create_header_footer)
    
    print(f"✓ PDF generated successfully: {filename}")
    print(f"✓ File size: {os.path.getsize(filename) / 1024:.2f} KB")
    return filename

if __name__ == "__main__":
    import os
    try:
        filename = generate_proposal_pdf()
        print(f"\n✓ Proposal PDF created: {filename}")
        print("\nNext steps:")
        print("1. Review the PDF")
        print("2. Send to clinic management")
        print("3. Collect completed forms")
        print("4. Schedule follow-up meeting")
    except Exception as e:
        print(f"✗ Error generating PDF: {e}")
        import traceback
        traceback.print_exc()
