import os
import zipfile
import gzip
import shutil
from pathlib import Path

def unzip_recursive(source_zip, target_dir):
    """
    Unzips a zip file and then recursively unzips any zip files or gz files found within it.
    """
    source_zip = Path(source_zip)
    target_dir = Path(target_dir)

    print(f"Extracting {source_zip} to {target_dir}...")
    
    if not target_dir.exists():
        target_dir.mkdir(parents=True)

    with zipfile.ZipFile(source_zip, 'r') as zip_ref:
        zip_ref.extractall(target_dir)

    # Recursively look for more zip or gz files in the extracted directory
    process_directory(target_dir)

def process_directory(directory):
    """
    Scans a directory for zip/gz files and unzips them, then deletes the original.
    """
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = Path(root) / file
            if file.endswith('.zip'):
                # Create a subfolder with the same name as the zip (minus extension)
                extract_to = Path(root) / file_path.stem
                print(f"Found nested zip: {file_path}. Extracting to {extract_to}...")
                
                try:
                    with zipfile.ZipFile(file_path, 'r') as zip_ref:
                        zip_ref.extractall(extract_to)
                    os.remove(file_path)
                    process_directory(extract_to)
                except Exception as e:
                    print(f"Error extracting {file_path}: {e}")
            
            elif file.endswith('.gz'):
                # For .csv.gz, we want to name it .csv
                # Path(file_path.stem) works for .gz if the file is name.csv.gz, stem will be name.csv
                target_file = Path(root) / file_path.stem
                print(f"Found gz file: {file_path}. Decompressing to {target_file}...")
                
                try:
                    with gzip.open(file_path, 'rb') as f_in:
                        with open(target_file, 'wb') as f_out:
                            shutil.copyfileobj(f_in, f_out)
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error decompressing {file_path}: {e}")

if __name__ == "__main__":
    SOURCE_ZIP = r"e:\hackathon\Xen-0-thon\dataset\demo\mimic-iv-clinical-database-demo-2.2.zip"
    TARGET_ROOT = r"e:\hackathon\Xen-0-thon\dataset\unziped demo"

    if os.path.exists(TARGET_ROOT):
        print(f"Cleaning up existing target directory: {TARGET_ROOT}")
        shutil.rmtree(TARGET_ROOT)

    unzip_recursive(SOURCE_ZIP, TARGET_ROOT)
    print("Done!")
