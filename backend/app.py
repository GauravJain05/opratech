import os, re, random
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from itsdangerous import URLSafeTimedSerializer, BadSignature

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///cj.db").replace("postgres://", "postgresql://")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
db = SQLAlchemy(app)
ser = URLSafeTimedSerializer(app.config["SECRET_KEY"])
USERS = {  # demo logins; override with env vars
    os.getenv("CASHIER_USER", "cashier"): (os.getenv("CASHIER_PASS", "cashier123"), "cashier"),
    os.getenv("MANAGER_USER", "manager"): (os.getenv("MANAGER_PASS", "manager123"), "manager"),
}

class Household(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(10), unique=True, index=True)
    consent_at = db.Column(db.DateTime)
    points = db.Column(db.Integer, default=0)
    enriched = db.Column(db.Boolean, default=False)
    members = db.relationship("Member", backref="household")

class Member(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    household_id = db.Column(db.Integer, db.ForeignKey("household.id"))
    name = db.Column(db.String(80))
    birthday = db.Column(db.String(10))
    anniversary = db.Column(db.String(10))

class Purchase(db.Model):  # household_id is NULL for anonymous sales
    id = db.Column(db.Integer, primary_key=True)
    household_id = db.Column(db.Integer, db.ForeignKey("household.id"), nullable=True)
    member_id = db.Column(db.Integer, nullable=True)
    amount = db.Column(db.Integer)
    category = db.Column(db.String(12))
    at = db.Column(db.DateTime)

class Message(db.Model):  # simulated SMS log (nothing is actually sent)
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(10))
    kind = db.Column(db.String(20))
    text = db.Column(db.String(400))
    at = db.Column(db.DateTime, default=datetime.now)

def auth(role=None):
    def deco(f):
        @wraps(f)
        def w(*a, **k):
            try:
                u = ser.loads(request.headers.get("Authorization", "").replace("Bearer ", ""), max_age=8 * 3600, salt="auth")
            except BadSignature:
                return jsonify(error="Please sign in again"), 401
            if role == "manager" and u["role"] != "manager":
                return jsonify(error="Manager access only"), 403
            return f(*a, **k)
        return w
    return deco

@app.post("/api/auth/login")
def login():
    d = request.json or {}
    u = USERS.get(d.get("user"))
    if not u or u[0] != d.get("password"):
        return jsonify(error="Wrong username or password"), 401
    return jsonify(token=ser.dumps({"role": u[1]}, salt="auth"), role=u[1])

def mdays(m):
    t = db.session.query(db.func.max(Purchase.at)).filter(Purchase.member_id == m.id).scalar()
    return (datetime.now() - t).days if t else None

@app.get("/api/household/<phone>")
@auth()
def lookup(phone):
    h = Household.query.filter_by(phone=phone[-10:]).first()
    if not h:
        return jsonify(exists=False, members=[])
    last = db.session.query(db.func.max(Purchase.at)).filter(Purchase.household_id == h.id).scalar()
    return jsonify(exists=True, days=(datetime.now() - last).days if last else None,
                   members=[{"id": m.id, "name": m.name, "days": mdays(m)} for m in h.members])

@app.post("/api/checkout")
@auth()
def checkout():
    d = request.json or {}
    amt = int(d.get("amount") or 0)
    phone = re.sub(r"\D", "", d.get("phone", ""))[-10:]
    if amt <= 0:
        return jsonify(error="Enter the bill amount"), 400
    if d.get("consent") and not re.fullmatch(r"[6-9]\d{9}", phone):
        return jsonify(error="Enter a valid 10-digit mobile number"), 400
    if not d.get("consent"):  # no consent => anonymous sale, nothing personal stored
        db.session.add(Purchase(amount=amt, at=datetime.now()))
        db.session.commit()
        return jsonify(anonymous=True)
    h = Household.query.filter_by(phone=phone).first()
    if not h:
        h = Household(phone=phone, consent_at=datetime.now())
        db.session.add(h)
        db.session.flush()
    name = (d.get("member_name") or "").strip()
    if not name and h.members:  # never guess who shopped: each person keeps their own history
        return jsonify(error="Choose who is shopping"), 400
    m = Member.query.filter_by(household_id=h.id, name=name or "Member 1").first()
    if not m:
        m = Member(household_id=h.id, name=name or "Member 1")
        db.session.add(m)
        db.session.flush()
    db.session.add(Purchase(household_id=h.id, member_id=m.id, amount=amt, at=datetime.now(),
                         category=d.get("category") if d.get("category") in ("Men", "Women", "Kids", "Festive") else None))
    link = f"{request.host_url}r/{ser.dumps({'h': h.id}, salt='rc')}"
    db.session.add(Message(phone=phone, kind="receipt", text=f"Thanks for shopping at Cotton Junction. Receipt: {link} Add your details for 50 bonus points. Reply STOP to opt out."))
    db.session.commit()
    return jsonify(anonymous=False, link=link)

def household_from(t):
    try:
        return db.session.get(Household, ser.loads(t, max_age=30 * 86400, salt="rc")["h"])
    except (BadSignature, KeyError):
        return None

@app.get("/api/receipt/<t>")
def receipt_get(t):
    h = household_from(t)
    return (jsonify(ok=True, claimed=h.enriched), 200) if h else (jsonify(error="This link has expired"), 404)

@app.post("/api/receipt/<t>")
def receipt_post(t):
    h = household_from(t)
    if not h:
        return jsonify(error="This link has expired"), 404
    d = request.json or {}
    if d.get("name"):
        m = h.members[0] if h.members else Member(household_id=h.id)
        m.name, m.birthday, m.anniversary = d["name"], d.get("birthday"), d.get("anniversary")
        db.session.add(m)
    bonus = 0
    if not h.enriched:
        h.enriched, h.points, bonus = True, (h.points or 0) + 50, 50
    db.session.commit()
    return jsonify(bonus=bonus)

def rfm():
    """Recency/Frequency/Monetary quintile scores (1-5). Top 10% by total = VIP; >=60 days = lapsed."""
    now, rows = datetime.now(), []
    for m in Member.query.all():  # one row per person, never per phone number
        ps = Purchase.query.filter_by(member_id=m.id).all()
        if ps:
            cats = [p.category for p in ps if p.category]
            rows.append(dict(id=m.id, phone=m.household.phone, name=m.name, shared=len(m.household.members),
                             cat=max(set(cats), key=cats.count) if cats else "",
                             days=(now - max(p.at for p in ps)).days, freq=len(ps), spend=sum(p.amount for p in ps)))
    n = len(rows)
    for key, out, rev in (("days", "r", True), ("freq", "f", False), ("spend", "m", False)):
        for i, r in enumerate(sorted(rows, key=lambda r: r[key], reverse=rev)):
            r[out] = 1 + i * 5 // n
    ranked = sorted(rows, key=lambda r: (r["r"] + r["f"] + r["m"], r["spend"]), reverse=True)
    top = {r["id"] for r in ranked[:max(1, round(n * .1))]}
    for r in rows:
        r["lapsed"] = r["days"] >= 60
        r["segment"] = "VIP" if r["id"] in top else "Inactive" if r["lapsed"] else "Regular"
    return ranked

@app.get("/api/lapsed")
@auth("manager")
def lapsed():
    days, spend = int(request.args.get("days", 90)), int(request.args.get("min_spend", 0))
    rows = [r for r in rfm() if r["days"] >= days and r["spend"] >= spend]
    return jsonify(sorted(rows, key=lambda r: -r["days"]))

@app.get("/api/segments")
@auth("manager")
def segments():
    rows = rfm()
    c = {s: sum(r["segment"] == s for r in rows) for s in ("VIP", "Regular", "Inactive")}
    c["lapsed"] = sum(r["lapsed"] for r in rows)
    return jsonify(rows=rows, counts=c)

def pick(d):
    return [r for r in rfm() if r["days"] >= int(d.get("min_days") or 0) and r["spend"] >= int(d.get("min_spend") or 0)
            and (not d.get("segment") or r["segment"] == d["segment"])]

@app.post("/api/campaigns/preview")
@auth("manager")
def preview():
    rows = pick(request.json or {})
    return jsonify(count=len(rows), sample=[r["name"] for r in rows[:3]])

@app.post("/api/campaigns/send")
@auth("manager")
def send():
    d = request.json or {}
    rows = pick(d)
    for r in rows:
        db.session.add(Message(phone=r["phone"], kind="campaign", text=d["text"].replace("{name}", r["name"])[:400]))
    db.session.commit()
    return jsonify(sent=len(rows))

@app.get("/api/messages")
@auth("manager")
def messages():
    ms = Message.query.order_by(Message.id.desc()).limit(40).all()
    return jsonify([dict(phone=m.phone, kind=m.kind, text=m.text, at=m.at.strftime("%d %b %H:%M")) for m in ms])

def seed(n=250):
    random.seed(7)
    names = "Aarav Priya Rohan Neha Vikram Anjali Karan Sneha Amit Pooja Rahul Kavya Manish Ritu Sanjay Isha Deepak Meera Arjun Tanvi".split()
    now = datetime.now()
    def buy(h, m, last, count, cat):
        for i in range(count):
            db.session.add(Purchase(household_id=h.id, member_id=m.id, amount=random.randint(8, 140) * 50, category=cat,
                                    at=now - timedelta(days=last + i * random.randint(8, 30))))
    demo = Household(phone="9800000001", consent_at=now)  # demo household: two people, one phone, one lapsed
    db.session.add(demo)
    db.session.flush()
    for nm, last, cat, cnt in (("Rohan", 5, "Men", 4), ("Meera", 96, "Women", 3)):
        m = Member(household_id=demo.id, name=nm)
        db.session.add(m)
        db.session.flush()
        buy(demo, m, last, cnt, cat)
    for _ in range(n):
        h = Household(phone=random.choice("6789") + "".join(random.choices("0123456789", k=9)), consent_at=now)
        db.session.add(h)
        db.session.flush()
        for nm in random.sample(names, random.randint(1, 3)):
            m = Member(household_id=h.id, name=nm)
            db.session.add(m)
            db.session.flush()
            buy(h, m, random.randint(0, 240), random.choice([1, 2, 3, 5, 8]), random.choice(["Men", "Women", "Kids", "Festive"]))
    db.session.commit()

with app.app_context():
    db.create_all()
    if not Household.query.first():
        seed()

DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")

@app.get("/", defaults={"p": ""})
@app.get("/<path:p>")
def spa(p):  # serves the built React app, so one server = one domain
    if p and os.path.isfile(os.path.join(DIST, p)):
        return send_from_directory(DIST, p)
    return send_from_directory(DIST, "index.html")

if __name__ == "__main__":
    app.run(port=5000, debug=True)