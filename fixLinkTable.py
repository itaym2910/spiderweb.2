import re

with open('src/components/CoreDevice/LinkTable.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('Sections Container')
end_idx = content.find('Links Section')

if start_idx != -1 and end_idx != -1:
    # go back to the start of the line for start_idx
    start_idx = content.rfind('{', 0, start_idx)
    # go back to the start of the line for end_idx
    end_idx = content.rfind('{', 0, end_idx)
    
    content = content[:start_idx] + '{/* --- Sections Container --- */}\n      <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">\n        ' + content[end_idx:]
    with open('src/components/CoreDevice/LinkTable.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
        print('Fixed LinkTable')
else:
    print('Could not find boundaries')
