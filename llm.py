import os
import sys

# --- Configuration ---
# Add or remove file extensions as needed
# Common web development file types are included by default
INCLUDED_EXTENSIONS = {
    '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.json',
    '.md', '.yaml', '.yml', '.toml', '.sh', '.py', '.rb', '.java',
    '.c', '.cpp', '.h', '.hpp', '.go', '.rs', '.php',
}

# Add or remove directories to exclude from the output
# 'public' is often excluded as it contains the build output and static assets.
# If you have important files in 'public' (like manifest.json), you might keep it.
EXCLUDED_DIRECTORIES = {
    'node_modules', '.git', '.vscode', '__pycache__', 'dist', 'build',
}

# --- THIS SECTION IS UPDATED ---
# Add or remove specific files to exclude
# This now includes common config files that are not part of the core app logic.
EXCLUDED_FILES = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'vite.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'eslint.config.js',
}

# The name of the output file
OUTPUT_FILENAME = "combined_for_llm.txt"

def should_include(path, script_name):
    """
    Determines if a file or directory should be included based on the
    configuration settings.
    """
    # Exclude the script file itself
    if os.path.basename(path) == script_name:
        return False
        
    # Exclude specified directories
    for excluded_dir in EXCLUDED_DIRECTORIES:
        if excluded_dir in path.split(os.sep):
            return False

    # Exclude specified files
    if os.path.basename(path) in EXCLUDED_FILES:
        return False

    # If it's a file, check its extension
    if os.path.isfile(path):
        _, extension = os.path.splitext(path)
        if extension.lower() not in INCLUDED_EXTENSIONS:
            return False

    return True

def combine_project_files(project_root="."):
    """
    Recursively scans a project directory and combines the content of
    relevant files into a single text file.
    """
    combined_content = ""
    file_count = 0
    
    # --- THIS IS NEW: Get the name of the script being run ---
    script_name = os.path.basename(sys.argv[0])

    print(f"Starting to scan project at: {os.path.abspath(project_root)}")
    print(f"Excluding script file: {script_name}")

    for root, dirs, files in os.walk(project_root, topdown=True):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if should_include(os.path.join(root, d), script_name)]

        for file_name in files:
            file_path = os.path.join(root, file_name)

            if should_include(file_path, script_name):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        file_content = f.read()

                    # Add a header with the file path
                    combined_content += f"\n--- File: {os.path.relpath(file_path, project_root)} ---\n"
                    combined_content += file_content
                    file_count += 1
                    print(f"  - Added: {os.path.relpath(file_path, project_root)}")

                except Exception as e:
                    print(f"  - Could not read file {file_path}: {e}")

    try:
        with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as output_file:
            output_file.write(combined_content)
        print(f"\nSuccessfully combined {file_count} files into '{OUTPUT_FILENAME}'.")
    except Exception as e:
        print(f"\nError writing to output file: {e}")


if __name__ == "__main__":
    # Run the script from the root of your project
    combine_project_files()