import os
import zipfile

def create_source_code_zip():
    zip_output_dir = 'public/APK_DOWNLOAD'
    os.makedirs(zip_output_dir, exist_ok=True)
    zip_path = os.path.join(zip_output_dir, 'comaiit-pos-source-code.zip')
    
    # Exclude heavy or generated folders
    exclude_dirs = {'node_modules', '.git', 'dist', '.build-outputs', '.cache', '__pycache__'}
    exclude_files = {'.DS_Store', 'comaiit-pos-source-code.zip', 'app-debug.apk'}

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            
            for file in files:
                if file in exclude_files or file.endswith('.pyc'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, '.')
                zipf.write(file_path, arcname)

    # Copy to public root as well
    alt_zip_path = 'public/comaiit-pos-source-code.zip'
    with open(zip_path, 'rb') as f_in, open(alt_zip_path, 'wb') as f_out:
        f_out.write(f_in.read())

    print(f"Successfully packaged full source code into: {zip_path} and {alt_zip_path}")

if __name__ == '__main__':
    create_source_code_zip()
