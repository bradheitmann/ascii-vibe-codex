# src/ascii_vibe/numbers.py
import re
from typing import Tuple, Union

# Swiss number formatting per specification
CURRENCY_SYMBOLS = {
    "USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥", 
    "CHF": "Fr", "CAD": "C$", "AUD": "A$"
}

THIN_SPACE = "\u2009"  # Unicode thin space
REGULAR_SPACE = " "    # ASCII fallback

def format_currency(value: float, currency: str = "USD", ascii_only: bool = False) -> str:
    """Format currency with Swiss conventions: prefix symbol, thin-space thousands, 2dp"""
    symbol = CURRENCY_SYMBOLS.get(currency, "$")
    abs_val = abs(value)
    
    # Format with 2 decimal places
    formatted = f"{abs_val:.2f}"
    
    # Add thousands separator
    parts = formatted.split(".")
    integer_part = parts[0]
    decimal_part = parts[1] if len(parts) > 1 else "00"
    
    # Insert thousands separators
    if len(integer_part) > 3:
        sep = REGULAR_SPACE if ascii_only else THIN_SPACE
        groups = []
        for i, digit in enumerate(reversed(integer_part)):
            if i > 0 and i % 3 == 0:
                groups.append(sep)
            groups.append(digit)
        integer_part = "".join(reversed(groups))
    
    formatted_abs = f"{integer_part}.{decimal_part}"
    
    # Handle negatives with parentheses (Swiss style)
    if value < 0:
        return f"({symbol}{formatted_abs})"
    else:
        return f"{symbol}{formatted_abs}"

def format_percent(value: float, decimal_places: int = 1) -> str:
    """Format percentage with Swiss conventions"""
    if value == 0:
        return "0%"
    
    sign = "+" if value > 0 else ""
    formatted = f"{sign}{value:.{decimal_places}f}%"
    return formatted

def is_numeric_like(text: str) -> bool:
    """Detect if text represents a number (currency, percent, decimal, etc.)"""
    if not text or not text.strip():
        return False
    
    # Remove common prefixes/suffixes and separators
    clean = text.strip()
    clean = re.sub(r'^[\$€£¥]\s*', '', clean)  # currency prefixes
    clean = re.sub(r'%$', '', clean)           # percent suffix
    clean = re.sub(r'[(),\s]', '', clean)     # parentheses, spaces
    
    try:
        float(clean)
        return True
    except ValueError:
        return False

def split_decimal_for_align(text: str) -> Tuple[str, str, str]:
    """Split number for decimal alignment: (prefix, left_of_decimal, right_of_decimal)"""
    if not text or not text.strip():
        return "", "", ""
    
    text = text.strip()
    
    # Handle currency symbols and signs
    prefix_match = re.match(r'^([\$€£¥\(\+\-]*\s*)', text)
    prefix = prefix_match.group(1) if prefix_match else ""
    
    # Handle suffix (%, etc)
    suffix_match = re.search(r'(\s*[%\)]+)$', text)
    suffix = suffix_match.group(1) if suffix_match else ""
    
    # Extract the numeric part
    numeric_part = text[len(prefix):len(text)-len(suffix)]
    
    # Split on decimal point
    if '.' in numeric_part:
        left, right = numeric_part.split('.', 1)
        return prefix, left, right + suffix
    else:
        return prefix, numeric_part, suffix

def normalize_number(text: str, currency: str = "USD", ascii_only: bool = False) -> str:
    """Normalize a number string to Swiss formatting standards"""
    if not is_numeric_like(text):
        return text
    
    clean = text.strip()
    
    # Detect type and extract value
    is_negative = '(' in clean or clean.startswith('-')
    is_currency = any(sym in clean for sym in CURRENCY_SYMBOLS.values())
    is_percent = clean.endswith('%')
    
    # Extract numeric value
    numeric_str = re.sub(r'[^\d.-]', '', clean.replace('(', '').replace(')', ''))
    
    try:
        value = float(numeric_str)
        if is_negative:
            value = -abs(value)
        
        if is_currency:
            return format_currency(value, currency, ascii_only)
        elif is_percent:
            return format_percent(value)
        else:
            # Plain number with thousands separator
            if abs(value) >= 1000:
                sep = REGULAR_SPACE if ascii_only else THIN_SPACE
                if value == int(value):
                    # Integer
                    formatted = f"{int(value):,}".replace(',', sep)
                else:
                    # Float
                    formatted = f"{value:,.1f}".replace(',', sep)
                return formatted
            else:
                return f"{value:.1f}" if value != int(value) else str(int(value))
    
    except ValueError:
        return text