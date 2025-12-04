#!/usr/bin/env python3
"""
Generate PDF from Menaharia Clinic Integration Proposal HTML
Uses WeasyPrint for PDF generation (pure Python solution)
"""

import os
import sys

def generate_pdf():
    """Generate PDF from the HTML proposal using WeasyPrint"""
    
    input_file = "CLINIC_PROPOSAL.html"
    output_file = "Menaharia_Clinic_Integration_Proposal.pdf"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found!")
        return False
    
    print("Generating PDF from HTML proposal...")
    print(f"Input: {input_file}")
    print(f"Output: {output_file}")
    
    try:
        from weasyprint import HTML, CSS
        
        # Read the HTML file
        with open(input_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Additional CSS for better PDF rendering
        additional_css = CSS(string='''
            @page {
                size: Letter;
                margin: 0;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        ''')
        
        # Generate PDF
        HTML(string=html_content).write_pdf(
            output_file,
            stylesheets=[additional_css]
        )
        
        print(f"\n✅ PDF generated successfully: {output_file}")
        print(f"File size: {os.path.getsize(output_file) / 1024:.2f} KB")
        return True
        
    except ImportError:
        print("\n❌ WeasyPrint not installed!")
        print("\nPlease install WeasyPrint:")
        print("  pip install weasyprint")
        print("\nNote: WeasyPrint requires GTK+ on Windows.")
        print("Alternative: Use the browser's Print to PDF feature:")
        print("  1. Open CLINIC_PROPOSAL.html in your browser")
        print("  2. Press Ctrl+P (or Cmd+P on Mac)")
        print("  3. Select 'Save as PDF' as the destination")
        print("  4. Click 'Save'")
        return False
        
    except Exception as e:
        print(f"\n❌ Error generating PDF: {e}")
        return False

if __name__ == "__main__":
    success = generate_pdf()
    sys.exit(0 if success else 1)
