import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text(docx_path):
    if not os.path.exists(docx_path):
        print(f"File not found: {docx_path}")
        return

    try:
        with zipfile.ZipFile(docx_path) as zf:
            xml_content = zf.read('word/document.xml')
        
        tree = ET.fromstring(xml_content)
        
        # Namespace map often found in docx
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text_parts = []
        for node in tree.iter():
            if node.tag == f"{{{ns['w']}}}p": # Paragraph
                text_parts.append('\n')
            elif node.tag == f"{{{ns['w']}}}t": # Text
                # Text content
                if node.text:
                    text_parts.append(node.text)
            elif node.tag == f"{{{ns['w']}}}tab":
                text_parts.append('\t')
                
        full_text = "".join(text_parts)
        print(full_text)
        
    except Exception as e:
        print(f"Error extracting {docx_path}: {e}")

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) < 2:
        print("Usage: python extract_docx.py <path_to_docx>")
    else:
        extract_text(sys.argv[1])
