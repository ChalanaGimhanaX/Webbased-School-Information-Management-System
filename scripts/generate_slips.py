import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('client/public/uploads/slips', exist_ok=True)

def create_bank_slip(filename, bank_name, slip_title, student_name, admission_no, grade, fee_title, amount, ref_no, date_str, depositor_name, bank_color=(15, 76, 129), stamp_color=(190, 30, 45)):
    width, height = 960, 620
    img = Image.new('RGB', (width, height), color=(254, 253, 249))
    draw = ImageDraw.Draw(img)

    # Outer decorative border
    draw.rectangle([(12, 12), (width - 13, height - 13)], outline=(210, 205, 195), width=2)
    draw.rectangle([(20, 20), (width - 21, height - 21)], outline=bank_color, width=3)

    # Header Bar
    draw.rectangle([(23, 23), (width - 24, 105)], fill=bank_color)
    
    try:
        font_large = ImageFont.truetype("arialbd.ttf", 24)
        font_title = ImageFont.truetype("arial.ttf", 16)
        font_bold = ImageFont.truetype("arialbd.ttf", 14)
        font_regular = ImageFont.truetype("arial.ttf", 13)
        font_small = ImageFont.truetype("arial.ttf", 11)
        font_mono = ImageFont.truetype("consola.ttf", 13)
        font_mono_bold = ImageFont.truetype("consolab.ttf", 14)
        font_stamp = ImageFont.truetype("arialbd.ttf", 14)
    except:
        font_large = font_title = font_bold = font_regular = font_small = font_mono = font_mono_bold = font_stamp = ImageFont.load_default()

    draw.text((40, 34), bank_name.upper(), fill=(255, 255, 255), font=font_large)
    draw.text((40, 68), f"CUSTOMER DEPOSIT SLIP — {slip_title}", fill=(230, 240, 255), font=font_title)
    
    draw.text((width - 260, 38), "BRANCH: COLOMBO 07", fill=(255, 255, 255), font=font_bold)
    draw.text((width - 260, 64), f"DEPOSIT DATE: {date_str}", fill=(255, 255, 255), font=font_regular)

    # Sub-header notice
    draw.rectangle([(23, 106), (width - 24, 128)], fill=(242, 240, 232))
    draw.text((35, 110), "* ORIGINAL DEPOSITOR RECEIPT — VALID PROOF OF SCHOOL FEE SETTLEMENT *", fill=(100, 95, 85), font=font_small)

    # Beneficiary Info Box
    draw.rectangle([(35, 140), (width - 36, 210)], outline=(190, 185, 175), fill=(255, 255, 255), width=1)
    draw.text((50, 148), "BENEFICIARY INSTITUTION:", fill=(120, 115, 105), font=font_small)
    draw.text((50, 166), "WYCHERLEY INTERNATIONAL SCHOOL — FEE COLLECTION ACCOUNT", fill=(20, 20, 20), font=font_bold)
    draw.text((50, 186), "A/C NO: 0012-9844-3310-88  |  SWIFT/BRANCH: BOCELKX-007", fill=(60, 60, 60), font=font_mono)

    draw.text((width - 330, 148), "VOUCHER REFERENCE NUMBER:", fill=(120, 115, 105), font=font_small)
    draw.text((width - 330, 166), ref_no, fill=(180, 30, 30), font=font_mono_bold)
    draw.text((width - 330, 186), "METHOD: DIRECT BANK DEPOSIT", fill=(70, 70, 70), font=font_small)

    # Student & Fee Info Table
    start_y = 222
    draw.rectangle([(35, start_y), (width - 36, start_y + 175)], outline=(190, 185, 175), fill=(255, 255, 255), width=1)
    
    rows = [
        ("Student Full Name:", student_name, "Admission No:", admission_no),
        ("Grade / Class Level:", f"Grade {grade}", "Academic Fee:", fee_title),
        ("Deposited By (Payer):", depositor_name, "Payment Mode:", "CASH / COUNTER DEPOSIT"),
        ("Currency Code:", "Sri Lankan Rupees (LKR)", "Account Status:", "VERIFIED AND COLLECTED"),
    ]

    curr_y = start_y + 8
    for label1, val1, label2, val2 in rows:
        draw.text((50, curr_y), label1, fill=(110, 105, 95), font=font_small)
        draw.text((210, curr_y), val1, fill=(20, 20, 20), font=font_bold)
        draw.text((490, curr_y), label2, fill=(110, 105, 95), font=font_small)
        draw.text((630, curr_y), val2, fill=(20, 20, 20), font=font_bold)
        curr_y += 32
        draw.line([(35, curr_y - 6), (width - 36, curr_y - 6)], fill=(238, 235, 228), width=1)

    # Highlight Amount Box
    draw.rectangle([(35, 410), (width - 36, 480)], fill=(244, 250, 244), outline=(70, 150, 80), width=2)
    draw.text((50, 420), "TOTAL AMOUNT PAID & CLEARED:", fill=(40, 110, 50), font=font_bold)
    draw.text((50, 442), f"LKR {amount}", fill=(20, 125, 40), font=font_large)

    draw.text((width - 360, 422), "TELLER ID: BOC-TLR-048", fill=(90, 90, 90), font=font_small)
    draw.text((width - 360, 444), "TRANSACTION SYSTEM: CORE-BANKING-ONLINE", fill=(90, 90, 90), font=font_small)

    # Bottom signatures
    draw.line([(50, 555), (250, 555)], fill=(130, 130, 130), width=1)
    draw.text((70, 560), "Depositor Signature", fill=(110, 110, 110), font=font_small)

    draw.line([(width - 270, 555), (width - 70, 555)], fill=(130, 130, 130), width=1)
    draw.text((width - 240, 560), "Authorized Bank Teller", fill=(110, 110, 110), font=font_small)

    # Authentic Bank Stamp in designated box
    stamp_cx, stamp_cy = width // 2, 535
    draw.ellipse([(stamp_cx - 110, stamp_cy - 48), (stamp_cx + 110, stamp_cy + 48)], outline=stamp_color, width=3)
    draw.ellipse([(stamp_cx - 104, stamp_cy - 42), (stamp_cx + 104, stamp_cy + 42)], outline=stamp_color, width=1)
    draw.text((stamp_cx - 95, stamp_cy - 30), bank_name.upper()[:18], fill=stamp_color, font=font_stamp)
    draw.text((stamp_cx - 65, stamp_cy - 8), "* PAID & VERIFIED *", fill=stamp_color, font=font_bold)
    draw.text((stamp_cx - 50, stamp_cy + 12), f"{date_str} - CLB 07", fill=stamp_color, font=font_mono)

    img.save(filename, "JPEG", quality=95)
    print(f"Generated slip: {filename}")

create_bank_slip(
    'client/public/slip-kasun-exam.jpg',
    'Bank of Ceylon',
    'EXAMINATION FEE DEPOSIT',
    'Kasun Perera',
    'WYC-2026-00101',
    '10',
    'Grade 10 Mid-Year Examination Fee',
    '3,500.00',
    'BOC-KASUN-EXAM-20261003',
    '2026-10-03',
    'Mr. Sunil Perera (Parent)',
    bank_color=(205, 140, 15),
    stamp_color=(180, 30, 30)
)

create_bank_slip(
    'client/public/slip-rashmi-oct.jpg',
    'Hatton National Bank',
    'TERM TUITION INSTALMENT',
    'Rashmi Fernando',
    'WYC-2026-00106',
    '10',
    'Grade 10 Term 1 Tuition Fee',
    '14,000.00',
    'HNB-RASH-20261002',
    '2026-10-02',
    'Mrs. K. Fernando (Parent)',
    bank_color=(0, 85, 150),
    stamp_color=(190, 40, 40)
)

create_bank_slip(
    'client/public/slip-malith-full.jpg',
    'Commercial Bank',
    'FULL TUITION PAYMENT',
    'Malith Silva',
    'WYC-2026-00107',
    '10',
    'Grade 10 Term 1 Tuition Fee (Full)',
    '28,000.00',
    'COMBANK-MALT-20261003',
    '2026-10-03',
    'Mr. D. Silva (Parent)',
    bank_color=(0, 60, 130),
    stamp_color=(180, 20, 20)
)

create_bank_slip(
    'client/public/uploads/slips/slip_nimasha_tuition_2026.jpg',
    'Hatton National Bank',
    'ANNUAL TUITION DEPOSIT',
    'Nimasha Silva',
    'WYC-2026-00102',
    '10',
    'Grade 10 Term 1 Tuition Fee',
    '25,000.00',
    'HNB-DEP-774129',
    '2026-10-04',
    'Mrs. Dilani Silva (Mother)',
    bank_color=(0, 85, 150),
    stamp_color=(190, 40, 40)
)

create_bank_slip(
    'client/public/sample_boc_deposit_slip.jpg',
    'Bank of Ceylon',
    'FEE DEPOSIT SLIP (SAMPLE)',
    'Kasun Perera',
    'WYC-2026-00101',
    '10',
    'Grade 10 Term 1 Tuition Fee',
    '25,000.00',
    'BOC-SAMPLE-REF-2026',
    '2026-10-04',
    'Parent / Guardian',
    bank_color=(205, 140, 15),
    stamp_color=(180, 30, 30)
)
