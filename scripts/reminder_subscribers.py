import os
import requests
from dotenv import load_dotenv

load_dotenv()

POSTMARK_API_KEY = os.getenv("POSTMARK_API_KEY")
TEMPLATE_ID = 45184792
FROM_EMAIL = "Mind Rain <no-reply@mindrain.org>"
REPLY_TO = "support@mindrain.org"
POSTMARK_BATCH_URL = "https://api.postmarkapp.com/email/batchWithTemplates"

# Postmark's hard limit per API request
POSTMARK_BATCH_LIMIT = 500

EMAIL_IDS = [
    "232501007.scad@saveetha.com",
    "232501010.scad@saveetha.com",
    "sandysanthosh8373@gmail.com",
    "jsnawin2007@gmail.com",
    "smruthigirishb@gmail.com",
    "pandeydivyanshi22@gmail.com",
    "bhaswardesarker524@gmail.com",
    "Mirzaalisha.s72@gmail.com",
    "angelintreesa13@gmail.com",
    "ankitabhalla1150@gmail.com",
    "khushboochaudhary2110@gmail.com",
    "goelkanish1@gmail.com",
    "vanshikadhimaan34@gmail.com",
    "vanshikad64@gmail.com",
    "1000025208@dit.edu.in",
    "hamilton.s@sirmvsa.org",
    "pradyumnapranav@gmail.com",
    "aswinimgd@gmail.com",
    "2021barc069@spab.ac.in",
    "juniorpako35@gmail.com",
    "allahrassemchrisnovic@gmail.com",
    "bambaraantoine07@gmail.com",
    "bryantagne73@gmail.com",
    "shrishtiverma610@gmail.com",
    "dishadoshi7@gmail.com",
    "koliprathamesh2205@gmail.com",
    "kripashah4286@gmail.com",
    "radhikamalviya2004@gmail.com",
    "ks17032004@gmail.com",
    "ayushikushwah1820@gmail.com",
    "parekhhetvee@gmail.com",
    "22bar007@gmail.com",
    "dhruv.ghelani.a0322@ipsarajkot.org",
    "janhavid.bnca@gmail.com",
    "janhavid2403@gmail.com",
    "keyurgohil04@gmail.com",
    "tanishqdarekar3858@gmail.com",
    "cheickoumarouologuem10@gmail.com",
    "av195088@gmail.com",
    "gargmeshna@gmail.com",
    "mduduzitichaunganazenda@gmail.com",
    "tumeloyaone@gmail.com",
    "lokeshrejeti2@gmail.com",
    "migueloleontorres@gmail.com",
    "busrabalabann@gmail.com",
    "adrianamagdalenasantamariadelb@gmail.com",
    "tasneemlohawala29@gmail.com",
    "snehasaika08@gmail.com",
    "gracynirmal13@gmail.com",
    "124115021@nitkkr.ac.in",
    "vanshikac4900@gmail.com",
    "nidhishende37@gmail.com",
    "parasbasera85@gmail.com",
    "rkansaljain@gmail.com",
    "ygarg2007@gmail.com",
    "mobhifi464@gmail.com",
    "shivanshigaur765@gmail.com",
    "gaurshivanshi90@gmail.com",
    "sairawat0918@gmail.com",
    "ankitadas.das55@gmail.com",
    "zohaibmohd907@gmail.com",
    "123littlemandy@gmail.com",
    "saikale796@gmail.com",
    "yadukakkar01@gmail.com",
    "yadukakkar@gmail.com",
    "prabhnoorkaur724@gmail.com",
    "musheerafirdoskhan@gmail.com",
    "raghavendrakalpana@gmail.com",
    "sofiavindenes.g@gmail.com",
    "janasophiascheffler@yahoo.de",
    "harshithamiffy@gmail.com",
    "patrakartabya@gmail.com",
    "rvsuthar72005@gmail.com",
    "mona.jhangra@vgu.ac.in",
    "aditya1802005@gmail.com",
    "2024barc030@spab.ac.in",
    "arjun07rrr@gmail.com",
    "vasimmohammad018@gmail.com",
    "ar.praneeth04@gmail.com",
    "danton@2architecture.ca",
    "shrdd06@gmail.com",
    "isamorado26@gmail.com",
    "prasurya.sarmacr7@gmail.com",
    "jakezirino@gmail.com",
    "zirinoj@myumanitoba.ca",
    "shivangijindal19@gmail.com",
    "2024barc018@spab.ac.in",
    "maiaoline@hotmail.com",
    "sivasri102006@gmail.com",
    "shadurian@scsa.ac.in",
    "dirbaparab13@gmail.com",
    "1dt22at010@dsatm.edu.in",
    "shinezaya.architect@gmail.com",
    "kapishbhivgade126@gmail.com",
    "udayaayush13@gmail.com",
    "2024barc025@spab.ac.in",
    "g2singh31@gmail.com",
    "ritishbhowmik1@gmail.com",
    "2024barc006@spab.ac.in",
    "samuuariasm@gmail.com",
    "aazeeshbms@gmail.com",
    "anushka.0707singh@gmail.com",
    "angeles.gfernandez@alumnos.upm.es",
    "angeles.gfeenandez@alumnos.upm.es",
    "garradomaria7@gmail.com",
    "24bds051@iiitdwd.ac.in",
    "jeyanrajan123@gmail.com",
    "ha.ma.2309.g.s@gmail.com",
    "aditi09devadkar@gmail.com",
    "lavanyabhasme11@gmail.com",
    "dharshuananth07@gmail.com",
    "spide611@gmail.com",
    "lavanyacurrent@gmail.com",
    "sharmaaman57714@gmail.com",
    "kovelaananda@gmail.com",
    "anliyajoby8@gmail.com",
    "anoopsingh1540@gmail.com",
    "gbarath550@gmail.com",
    "kevvinbonzox@gmail.com",
    "davearchi2021@gmail.com",
    "godasirajeshwari@gmail.com",
    "m.cgontad@alumnos.upm.es",
    "mihika.arch@spa.ac.in",
    "mohdjunior2005@gmail.com",
    "neha-25a@measiarch.net",
    "krishna.9899733501@gmail.com",
    "nitinkishore202007@gmail.com",
    "rithvik.april5@gmail.com",
    "2023barc017@spab.ac.in",
    "rohandas.zero@gmail.com",
    "srinidhis273@gmail.com",
    "naishadav@gmail.com",
    "mageesha66@gmail.com",
    "srilasyaan1006.scad@saveetha.com",
    "aadithya-23d@measiarch.net",
    "aarushikotwal08@gmail.com",
    "adityaom01042007@gmail.com",
    "232501032.scad@saveetha.com",
    "akankshas2122@gmail.com",
    "alejandrodz10@gmail.com",
    "amrithowlader@gmail.com",
    "anushikasaini861@gmail.com",
    "232501011.scad@saveetha.com",
    "1ns22at003@nittesoa.ac.in",
    "babybhavitha283@gmail.com",
    "belen.perezc@alumnos.upm.es",
    "dhavanebhakti6@gmail.com",
    "ckaur1536@gmail.com",
    "125115010@nitkkr.ac.in",
    "pateldarshan232006@gmail.com",
    "davidmartintellez@gmail.com",
    "deepamgoyal67337@gmail.com",
    "devanshchawla023@gmail.com",
    "dheerajponugoti11@gmail.com",
    "dheetchidh@gmail.com",
    "dhinesh.mg12@gmail.com",
    "tyagidhruv0110@gmail.com",
    "marjadi.dhyana@gmail.com",
    "principalbvcoanm@gmail.com",
    "gurdeepsingh561197@gmail.com",
    "hafeelu2007@gmail.com",
    "harikkrishg84@gmail.com",
    "gautamhemu090@gmail.com",
    "ishantrana008@gmail.com",
    "jeffreinjose@gmail.com",
    "jitendriyamulgund@gmail.com",
    "jobertrg2023@gmail.com",
    "chamb1318@mail.ru",
    "kaarnitha17@gmail.com",
    "kamnakumari200503@gmail.com",
    "ksyed2417@gmail.com",
    "kashhishachhpeliya@gmail.com",
    "kavishkoushic2006@gmail.com",
    "232501023.scad@saveetha.com",
    "kheyjonahrendionson@gmail.com",
    "khushdeepkour11dlp2@gmail.com",
    "2024barc037@spab.ac.in",
    "lavanyabhasme843@gmail.com",
    "logeshwari-24a@measiarch.net",
    "maanya030@gmail.com",
    "maanya.patel0218@gmail.com",
    "1240101328@spav.edu.in",
    "manavamm20@gmail.com",
    "mathewnanmarand@gmail.com",
    "mdashharj@gmail.com",
    "meetsharma9138@gmail.com",
    "nandhu012007@gmail.com",
    "neel22409@gmail.com",
    "nikhilrsverma@gmail.com",
    "ningthibamaibam@gmail.com",
    "architectpappu21@gmail.com",
    "poojanachathurya500@gmail.com",
    "praneetirai@gmail.com",
    "pranshugupta0084@bbdu.ac.in",
    "prashitatiwari4@gmail.com",
    "prarthanaahire@gmail.com",
    "pg5257235@gmail.com",
    "pritamdebnath129@gmail.com",
    "sunrising104@gmail.com",
    "sourabhsoni78d@gmail.com",
    "singhrajveer3002@gmail.com",
    "rattikanishka19@gmail.com",
    "ridhimabhatia786@gmail.com",
    "rolkol@student.bas.org",
    "rudrajha3105@gmail.com",
    "25ar1sa8@mitsgwl.ac.in",
    "saimaajain@gmail.com",
    "sahujisamruddhi@gmail.com",
    "samyukth657@gmail.com",
    "shaashinee-24b@measiarch.net",
    "shaiksadia9866@gmail.com",
    "shraddhapawar2107@gmail.com",
    "goreshravani007@gmail.com",
    "shreyasingh2012007@bbdu.ac.in",
    "shreyaship.ug24.ar@nitp.ac.in",
    "shyamarajiv2831@gmail.com",
    "sidhartharora15327@gmail.com",
    "24sparsh.tyagi@gmail.com",
    "232501034.scad@saveetha.com",
    "subhitect@gmail.com",
    "nuqe81236@gmail.com",
    "tamannamessey@gmail.com",
    "tanmaygoyal.arch@gmail.com",
    "2021barc017@spab.ac.in",
    "ubaidtamboliabc@gmail.com",
    "nehetevedika89@gmail.com",
    "vishalini-24b@measiarch.net",
    "vishwa-22d@measiarch.net",
    "vrushabhekre@gmail.com",
    "noojillayasaswi@gmail.com",
    "yasirimteyaz909@gmail.com",
    "ssac.cherryk25@gmail.com",
]


def build_messages(emails: list[str]) -> list[dict]:
    """Build the Messages payload for the Postmark batch endpoint."""
    return [
        {
            "From": FROM_EMAIL,
            "To": email,
            "TemplateId": TEMPLATE_ID,
            "ReplyTo": REPLY_TO,
            "TemplateModel": {}
        }
        for email in emails
    ]


def send_batch(messages: list[dict], batch_label: str = "") -> tuple[int, int]:
    """Send a batch of messages via Postmark. Returns (sent, failed) counts."""
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_API_KEY,
    }

    print(f"  Sending {len(messages)} email(s){f' [{batch_label}]' if batch_label else ''}...")
    response = requests.post(POSTMARK_BATCH_URL, json={"Messages": messages}, headers=headers)

    if response.status_code != 200:
        print(f"  Postmark API error {response.status_code}: {response.text}")
        return 0, len(messages)

    results = response.json()
    sent = sum(1 for r in results if r.get("ErrorCode") == 0)
    failed = len(results) - sent

    print(f"  Done — Sent: {sent} | Failed: {failed}")
    for r in results:
        if r.get("ErrorCode") != 0:
            print(f"    ✗ {r.get('To')}: {r.get('Message')}")

    return sent, failed


def main():
    if not POSTMARK_API_KEY:
        raise ValueError("POSTMARK_API_KEY is not set in .env")

    total_emails = len(EMAIL_IDS)
    print(f"Loaded {total_emails} recipient(s)\n")

    total_sent = 0
    total_failed = 0

    # Chunk into Postmark's 500-email API limit
    for i in range(0, total_emails, POSTMARK_BATCH_LIMIT):
        chunk = EMAIL_IDS[i : i + POSTMARK_BATCH_LIMIT]
        batch_num = i // POSTMARK_BATCH_LIMIT + 1
        total_batches = -(-total_emails // POSTMARK_BATCH_LIMIT)  # ceiling division

        print(f"{'='*50}")
        print(f"Batch {batch_num}/{total_batches} — {len(chunk)} email(s)")
        print(f"{'='*50}")
        for email in chunk:
            print(f"  → {email}")
        print()

        messages = build_messages(chunk)
        sent, failed = send_batch(messages, batch_label=f"batch {batch_num}")
        total_sent += sent
        total_failed += failed

    print(f"\n{'='*50}")
    print(f"All done — Total sent: {total_sent} | Total failed: {total_failed}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
