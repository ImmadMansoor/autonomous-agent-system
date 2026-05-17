import pypdf
import os

pdfs = [
    "Google Antigravity Hackathon - Challenges.pdf",
    "MenuMind_Project_Proposal_Final.pdf",
    "MenuMind_Simulation_Ledger.pdf",
    "MenuMind_Technical_DataFlow_Architecture.pdf"
]

for pdf in pdfs:
    if os.path.exists(pdf):
        try:
            reader = pypdf.PdfReader(pdf)
            text = f"# {pdf}\n\n"
            for page in reader.pages:
                text += page.extract_text() + "\n\n"
            with open(pdf.replace('.pdf', '.md'), 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"Extracted {pdf}")
        except Exception as e:
            print(f"Failed {pdf}: {e}")
