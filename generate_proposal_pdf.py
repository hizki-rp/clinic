#!/usr/bin/env python3
"""
Generate PDF from Menaharia Clinic Integration Proposal HTML
Uses wkhtmltopdf for high-quality PDF generation with proper page breaks
"""

import subprocess
import sys
import os

def generate_pdf():
    """Generate PDF from the HTML proposal"""
    
    input_file = "CLINIC_PROPOSAL.html"
    output_file = "Menaharia_Clinic_Integration_Proposal.pdf"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found!")
        return False
    
    print("Generating PDF from HTML proposal...")
    print(f"Input: {input_file}")
    print(f"Output: {output_file}")
    
    # wkhtmltopdf command with options for best quality
    cmd = [
        "wkhtmltopdf",
        "--enable-local-file-access",
        "--page-size", "Letter",
        "--margin-top", "0",
        "--margin-bottom", "0",
        "--margin-left", "0",
        "--margin-right", "0",
        "--no-stop-slow-scripts",
        "--javascript-delay", "1000",
        "--enable-javascript",
        "--print-media-type",
        input_file,
        output_file
    ]
    
    try:
        # Run wkhtmltopdf
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"\n✅ PDF generated successfully: {output_file}")
        print(f"File size: {os.path.getsize(output_file) / 1024:.2f} KB")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error generating PDF:")
        print(f"Return code: {e.returncode}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return False
        
    except FileNotFoundError:
        print("\n❌ wkhtmltopdf not found!")
        print("\nPlease install wkhtmltopdf:")
        print("  Windows: Download from https://wkhtmltopdf.org/downloads.html")
        print("  Mac: brew install wkhtmltopdf")
        print("  Linux: sudo apt-get install wkhtmltopdf")
        return False

if __name__ == "__main__":
    success = generate_pdf()
    sys.exit(0 if success else 1)
