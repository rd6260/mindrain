from pathlib import Path

template = Path("scripts/assets/TUH-participation-certificate.svg").expanduser().read_text()

names = [
    "Alice Johnson",
    "Bob Smith",
    "Charlie Brown",
    "I cannot think for a name"
]

for name in names:
    svg = template.replace("{{NAME}}", name)

    filename = name.replace(" ", "_")
    Path(f"~/{filename}.svg").expanduser().write_text(svg)
